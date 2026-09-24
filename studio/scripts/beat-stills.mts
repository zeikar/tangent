// Renders a still at every beat's last frame (cues.json endFrame) for the
// per-beat pixel check, with the safe-area guide unless --clean.
//
//   node scripts/beat-stills.mts ../episodes/<slug> [--clean] [--frames=12,40]
// Writes <episode>/frames/<beat>-f<frame>[-safe].png ("frame-f<n>" with
// --frames, which renders those frames instead of the beat ends). The
// composition id is the slug.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { assertCuesFresh } from "./cues-fresh.mts";

const [episodeArg, ...flags] = process.argv.slice(2);
if (!episodeArg) throw new Error("usage: node scripts/beat-stills.mts <episode dir> [--clean] [--frames=a,b]");
const episode = resolve(episodeArg);
const slug = basename(episode);
const clean = flags.includes("--clean");
const only = flags.find((f) => f.startsWith("--frames="))?.slice("--frames=".length);

const cues = assertCuesFresh(episode);
const shots: { name: string; frame: number }[] = only
  ? only.split(",").map((f) => ({ name: "frame", frame: Number(f) }))
  : cues.beats.map((b: { id: string; endFrame: number }) => ({ name: b.id, frame: b.endFrame }));

const outDir = join(episode, "frames");
const bundleDir = join(import.meta.dirname, "../out/bundle");
mkdirSync(outDir, { recursive: true });
const run = (args: string[]) =>
  execFileSync("npx", ["remotion", ...args], { cwd: join(import.meta.dirname, ".."), stdio: ["ignore", "ignore", "inherit"] });

run(["bundle", "--out-dir", bundleDir]);
for (const { name, frame } of shots) {
  const out = join(outDir, `${name}-f${frame}${clean ? "" : "-safe"}.png`);
  run(["still", bundleDir, slug, out, `--frame=${frame}`, `--props=${JSON.stringify({ showSafeArea: !clean })}`]);
  console.log(out);
}
// The storyboard may have changed while the stills rendered.
if (assertCuesFresh(episode).storyboardSha256 !== cues.storyboardSha256) {
  throw new Error("cues.json was rebuilt while the stills rendered; they may be stale, rerun");
}
