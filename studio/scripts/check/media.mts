// Media measurements for check-render.mts: one streaming pass over the
// render's pixels, and the audio numbers (loudness, sync, word onsets).
import { execFileSync, spawn, spawnSync } from "node:child_process";

export type Box = [left: number, top: number, right: number, bottom: number];

export const ffprobe = (path: string) =>
  JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", path], {
      encoding: "utf8",
    }),
  ) as {
    streams: {
      codec_type: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
      nb_frames?: string;
      duration?: string;
      pix_fmt?: string;
      color_space?: string;
      color_primaries?: string;
      color_transfer?: string;
      color_range?: string;
      sample_rate?: string;
    }[];
    format: { duration: string; tags?: Record<string, string> };
  };

export type PixelOpts = {
  width: number;
  height: number;
  visual: { top: number; bottom: number };
  caption: { top: number; bottom: number };
  left: number;
  right: number;
  inkLevel: number;
  changeLevel: number;
  changePixels: number;
  reactFrames: number[]; // frames to time the first visible change from (words, cues)
  reactionWindow: number; // frames to look for it
  loop: boolean;
};

export type PixelStats = {
  frames: number;
  background: number;
  visual: (Box | null)[]; // ink bbox above the caption band, per frame
  outside: { frame: number; pixels: number; box: Box }[]; // ink outside content x / the zones
  reaction: Map<number, number | null>; // react frame -> frames to the first visible change
  captionChange: number[]; // caption-band pixels changed since the previous frame
  loopPixels: number | null; // visual-zone pixels differing between the last and first frame
};

// Streams gray frames out of ffmpeg and keeps only what the checks need.
export const pixelPass = (render: string, o: PixelOpts): Promise<PixelStats> =>
  new Promise((resolve, reject) => {
    const { width: W, height: H } = o;
    const size = W * H;
    const zoneRows = [o.visual.top, o.visual.bottom + 1] as const;
    const zoneSize = (zoneRows[1] - zoneRows[0]) * W;
    const refs = new Map<number, Uint8Array>(); // visual zone of the frame before each word
    const stats: PixelStats = { frames: 0, background: 0, visual: [], outside: [], reaction: new Map(), captionChange: [], loopPixels: null };
    const capStart = o.caption.top * W;
    const capSize = (o.caption.bottom + 1 - o.caption.top) * W;
    let prevCaption: Uint8Array | null = null;
    let first: Uint8Array | null = null;
    let last: Uint8Array | null = null;
    let threshold = 0;
    const frame = Buffer.alloc(size);
    let filled = 0;

    const changed = (a: Uint8Array, zoneStart: number) => {
      let n = 0;
      for (let i = 0; i < zoneSize; i++) if (Math.abs(frame[zoneStart + i] - a[i]) > o.changeLevel) n++;
      return n;
    };

    const process1 = (f: number) => {
      if (f === 0) {
        // Background: the most common value in the top-left corner.
        const counts = new Map<number, number>();
        for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) counts.set(frame[y * W + x], (counts.get(frame[y * W + x]) ?? 0) + 1);
        stats.background = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        threshold = stats.background + o.inkLevel;
      }
      let vMinX = W, vMaxX = -1, vMinY = H, vMaxY = -1;
      let out = 0, oMinX = W, oMaxX = -1, oMinY = H, oMaxY = -1;
      for (let y = 0; y < H; y++) {
        const row = y * W;
        const rowOk = (y >= o.visual.top && y <= o.visual.bottom) || (y >= o.caption.top && y <= o.caption.bottom);
        let a = -1, b = -1;
        for (let x = 0; x < W; x++) {
          if (frame[row + x] <= threshold) continue;
          if (a < 0) a = x;
          b = x;
          if (!rowOk || x < o.left || x > o.right) {
            out++;
            if (x < oMinX) oMinX = x;
            if (x > oMaxX) oMaxX = x;
            if (y < oMinY) oMinY = y;
            oMaxY = y;
          }
        }
        if (a >= 0 && y < o.caption.top) {
          if (a < vMinX) vMinX = a;
          if (b > vMaxX) vMaxX = b;
          if (y < vMinY) vMinY = y;
          vMaxY = y;
        }
      }
      stats.visual.push(vMaxX >= 0 ? [vMinX, vMinY, vMaxX + 1, vMaxY + 1] : null);
      if (out) stats.outside.push({ frame: f, pixels: out, box: [oMinX, oMinY, oMaxX + 1, oMaxY + 1] });

      const zoneStart = zoneRows[0] * W;
      const zone = () => frame.subarray(zoneStart, zoneStart + zoneSize);
      // How much the caption band changed since the previous frame.
      const caption = frame.subarray(capStart, capStart + capSize);
      let capChanged = 0;
      if (prevCaption) for (let i = 0; i < capSize; i++) if (Math.abs(caption[i] - prevCaption[i]) > o.changeLevel) capChanged++;
      stats.captionChange.push(capChanged);
      prevCaption = Uint8Array.from(caption);
      // First visible change after each word or cue, against the frame before it.
      for (const w of o.reactFrames) {
        if (f === w - 1 || (w === 0 && f === 0)) refs.set(w, Uint8Array.from(zone()));
      }
      for (const [w, ref] of refs) {
        if (f < w || stats.reaction.has(w)) continue;
        if (changed(ref, zoneStart) > o.changePixels) stats.reaction.set(w, f - w);
        else if (f >= w + o.reactionWindow) stats.reaction.set(w, null);
        if (stats.reaction.has(w)) refs.delete(w);
      }
      if (o.loop) {
        if (f === 0) first = Uint8Array.from(zone());
        last = zone();
      }
    };

    const ff = spawn("ffmpeg", ["-v", "error", "-i", render, "-f", "rawvideo", "-pix_fmt", "gray", "-"], {
      stdio: ["ignore", "pipe", "inherit"],
    });
    ff.stdout.on("data", (chunk: Buffer) => {
      let at = 0;
      while (at < chunk.length) {
        const n = Math.min(size - filled, chunk.length - at);
        chunk.copy(frame, filled, at, at + n);
        filled += n;
        at += n;
        if (filled === size) {
          process1(stats.frames++);
          filled = 0;
        }
      }
    });
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited ${code} decoding ${render}`));
      for (const w of o.reactFrames) if (!stats.reaction.has(w)) stats.reaction.set(w, null);
      if (first && last) {
        const [a, b]: Uint8Array[] = [first, last];
        let n = 0;
        for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > o.changeLevel) n++;
        stats.loopPixels = n;
      }
      resolve(stats);
    });
  });

// Integrated loudness (LUFS), loudness range (LU) and true peak (dBTP).
export const loudness = (path: string) => {
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], {
    encoding: "utf8",
  });
  const summary = stderr.slice(stderr.lastIndexOf("Summary:"));
  const num = (re: RegExp) => Number(re.exec(summary)?.[1] ?? NaN);
  return { lufs: num(/I:\s+(-?[\d.]+) LUFS/), lra: num(/LRA:\s+(-?[\d.]+) LU/), truePeak: num(/Peak:\s+(-?[\d.]+) dBFS/) };
};

// Mono 48 kHz samples.
export const pcm = (path: string) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], {
    maxBuffer: 1 << 30,
  });
  return new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
};

// Lag (ms) of b against a, from 1 ms amplitude envelopes; positive = b is late.
export const envelopeLag = (a: Int16Array, b: Int16Array, maxMs = 150) => {
  const env = (s: Int16Array) => {
    const e = new Float64Array(Math.floor(s.length / 48));
    for (let i = 0; i < e.length; i++) {
      let sum = 0;
      for (let j = 0; j < 48; j++) sum += Math.abs(s[i * 48 + j]);
      e[i] = sum;
    }
    return e;
  };
  const ea = env(a);
  const eb = env(b);
  const n = Math.min(ea.length, eb.length);
  let best = 0;
  let bestScore = -Infinity;
  for (let lag = -maxMs; lag <= maxMs; lag++) {
    let score = 0;
    for (let i = maxMs; i < n - maxMs; i++) score += ea[i] * eb[i + lag];
    if (score > bestScore) {
      bestScore = score;
      best = lag;
    }
  }
  return best;
};

// RMS level (dBFS) per 10 ms window.
export const levels = (s: Int16Array) => {
  const hop = 480;
  const out = new Float64Array(Math.floor(s.length / hop));
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    for (let j = 0; j < hop; j++) sum += s[i * hop + j] ** 2;
    const rms = Math.sqrt(sum / hop) / 32768;
    out[i] = rms > 0 ? 20 * Math.log10(rms) : -120;
  }
  return out;
};
