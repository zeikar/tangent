// Hash of the studio code a render depends on: src/ (components, player,
// theme), the locked dependencies (KaTeX, Remotion) and remotion.config.ts.
// render.mts stamps it into each render; check-render.mts compares, because
// its geometry checks measure the current code, not the render's pixels.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const studio = join(import.meta.dirname, "..");

// Tracked and new files under src/, not ignored ones (.DS_Store) or tests,
// which renders don't run.
const srcFiles = () =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "src"], { cwd: studio, encoding: "utf8" })
    .split("\0")
    .filter((p) => p && !/\.test\.tsx?$/.test(p) && existsSync(join(studio, p)));

export const studioSha256 = () => {
  const hash = createHash("sha256");
  const paths = [...srcFiles(), "package-lock.json", "remotion.config.ts"].sort();
  for (const p of paths) hash.update(p).update("\0").update(readFileSync(join(studio, p))).update("\0");
  return hash.digest("hex");
};

// The comment tag render.mts writes and check-render.mts reads.
export const renderTag = (storyboardSha256: string, studio: string, cues: string) =>
  `storyboard-sha256=${storyboardSha256} studio-sha256=${studio} cues-sha256=${cues}`;
export const readTag = (comment: string | undefined) => ({
  storyboard: /storyboard-sha256=([0-9a-f]{64})/.exec(comment ?? "")?.[1],
  studio: /studio-sha256=([0-9a-f]{64})/.exec(comment ?? "")?.[1],
  cues: /cues-sha256=([0-9a-f]{64})/.exec(comment ?? "")?.[1],
});
