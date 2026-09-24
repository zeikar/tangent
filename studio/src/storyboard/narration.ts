import { getStaticFiles, staticFile } from "remotion";

// An episode's narration is episode media, which a clone doesn't have:
// scripts/build-cues.py copies it to public/episodes/<slug>/ (gitignored).
// Resolving it at render time rather than importing it keeps the studio
// bundling without it; only that episode's composition fails.
export const narrationSrc = (slug: string) => {
  const name = `episodes/${slug}/narration.mp3`;
  if (!getStaticFiles().some((f) => f.name === name)) {
    throw new Error(`studio/public/${name} is missing: run studio/scripts/build-cues.py for ${slug} first`);
  }
  return staticFile(name);
};
