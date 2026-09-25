// Hash of the studio code a render depends on: src/ (components, player,
// theme), the locked dependencies (KaTeX, Remotion) and remotion.config.ts.
// render.mts stamps it into each render; check-render.mts compares, because
// its geometry checks measure the current code, not the render's pixels.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const studio = join(import.meta.dirname, "..");

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));

export const studioSha256 = () => {
  const hash = createHash("sha256");
  const paths = [...files(join(studio, "src")), join(studio, "package-lock.json"), join(studio, "remotion.config.ts")]
    .map((p) => relative(studio, p))
    .sort();
  for (const p of paths) hash.update(p).update("\0").update(readFileSync(join(studio, p))).update("\0");
  return hash.digest("hex");
};

// The comment tag render.mts writes and check-render.mts reads.
export const renderTag = (storyboardSha256: string, studio: string) => `storyboard-sha256=${storyboardSha256} studio-sha256=${studio}`;
export const readTag = (comment: string | undefined) => ({
  storyboard: /storyboard-sha256=([0-9a-f]{64})/.exec(comment ?? "")?.[1],
  studio: /studio-sha256=([0-9a-f]{64})/.exec(comment ?? "")?.[1],
});
