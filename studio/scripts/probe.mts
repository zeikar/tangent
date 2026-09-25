// Runs a composition in the browser with the `probe` prop, without taking
// screenshots, and returns what each frame draws (src/probe/snapshot.ts).
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { renderFrames, selectComposition } from "@remotion/renderer";
import { PROBE_PREFIX } from "../src/probe/prefix.ts";

export type Line = [x1: number, y1: number, x2: number, y2: number, width: number, opacity: number];
export type Box = [left: number, top: number, right: number, bottom: number];
export type TextItem = {
  kind: string;
  text: string;
  box: Box;
  opacity: number;
  glyph: [char: string, height: number] | null;
  origin?: [x: number, y: number];
  lines?: number;
};
export type Fill = [...box: Box, opacity: number, corners?: number[]];
export type ElementSnap = { id: string; lines: Line[]; fills: Fill[]; texts: TextItem[] };
export type FrameSnap = { frame: number; els: ElementSnap[]; extra?: unknown };

const studio = join(import.meta.dirname, "..");

// The CLI bundles with remotion.config.ts (rspack); the Node API would not.
export const bundleStudio = () => {
  const dir = join(studio, "out", "bundle");
  execFileSync("npx", ["remotion", "bundle", "--out-dir", dir], { cwd: studio, stdio: ["ignore", "ignore", "inherit"] });
  return dir;
};

export const probeFrames = async (opts: {
  serveUrl: string;
  id: string;
  inputProps: Record<string, unknown>;
  frameRange?: [number, number];
}): Promise<FrameSnap[]> => {
  const inputProps = { ...opts.inputProps, probe: true };
  // The renderer looks for its browser under <cwd>/node_modules/.remotion and
  // downloads one if missing: run it from the studio, whatever the caller's cwd.
  const cwd = process.cwd();
  process.chdir(studio);
  try {
    return await probe(opts, inputProps);
  } finally {
    process.chdir(cwd);
  }
};

const probe = async (
  opts: { serveUrl: string; id: string; frameRange?: [number, number] },
  inputProps: Record<string, unknown>,
): Promise<FrameSnap[]> => {
  const composition = await selectComposition({ serveUrl: opts.serveUrl, id: opts.id, inputProps, logLevel: "error" });
  const frames = new Map<number, FrameSnap>();
  // Remotion echoes every browser console line to stdout; drop ours.
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array, ...rest: never[]) =>
    String(chunk).includes(PROBE_PREFIX) || write(chunk, ...rest)) as typeof process.stdout.write;
  try {
  await renderFrames({
    composition,
    serveUrl: opts.serveUrl,
    inputProps,
    imageFormat: "none",
    outputDir: null,
    frameRange: opts.frameRange ?? null,
    logLevel: "error",
    onStart: () => {},
    onFrameUpdate: () => {},
    onBrowserLog: (log) => {
      if (!log.text.startsWith(PROBE_PREFIX)) return;
      const snap: FrameSnap = JSON.parse(log.text.slice(PROBE_PREFIX.length));
      frames.set(snap.frame, snap);
    },
  });
  } finally {
    process.stdout.write = write;
  }
  const [a, b] = opts.frameRange ?? [0, composition.durationInFrames - 1];
  const out: FrameSnap[] = [];
  for (let f = a; f <= b; f++) {
    const s = frames.get(f);
    if (!s) throw new Error(`probe: no snapshot for frame ${f}`);
    out.push(s);
  }
  return out;
};
