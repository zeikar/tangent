import katex from "katex";

// Changing one TeX expression into another without two different glyphs ever
// overlapping: tokens both share move from their old place to their new one,
// the rest fade out or in where they stand, each at a time nothing else is
// in its way. Used by Equation's transformTo and PaperRect's label changes.

// Top-level TeX tokens, each renderable on its own: a symbol, a command with
// its arguments (\dfrac{x}{2}, \sqrt{2}), or a group, with any scripts
// (x^2). A string that doesn't split cleanly stays one token.
const tokenCache = new Map<string, string[]>();
export const texTokens = (tex: string): string[] => {
  let toks = tokenCache.get(tex);
  if (!toks) {
    toks = splitTokens(tex);
    tokenCache.set(tex, toks);
  }
  return toks;
};

const splitTokens = (tex: string): string[] => {
  const toks: string[] = [];
  let i = 0;
  const space = () => {
    while (i < tex.length && /\s/.test(tex[i])) i++;
  };
  const group = (open: string, close: string) => {
    const start = i;
    let depth = 0;
    for (; i < tex.length; i++) {
      if (tex[i] === "\\") i++;
      else if (tex[i] === open) depth++;
      else if (tex[i] === close && --depth === 0) return tex.slice(start, ++i);
    }
    throw new Error(`unbalanced ${open} in ${tex}`);
  };
  const atom = (): string => {
    space();
    if (tex[i] === "{") return group("{", "}");
    if (tex[i] !== "\\") return tex[i++];
    const name = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i))![0];
    i += name.length;
    let s = name;
    // A command word takes the groups right after it as its arguments.
    while (/^\\[a-zA-Z]/.test(name)) {
      const at = i;
      space();
      if (tex[i] === "{") s += group("{", "}");
      else if (tex[i] === "[" && s === name) s += group("[", "]");
      else {
        i = at;
        break;
      }
    }
    return s;
  };
  try {
    for (space(); i < tex.length; space()) {
      let t = atom();
      for (;;) {
        const at = i;
        space();
        if (tex[i] === "^" || tex[i] === "_") t += tex[i++] + atom();
        else if (tex[i] === "'") t += tex[i++];
        else {
          i = at;
          break;
        }
      }
      toks.push(t);
    }
    katex.renderToString(wrapTokens(toks, (k) => `\\htmlData{tok=${k}}`), { trust: true, strict: "ignore" });
    return toks;
  } catch {
    return [tex];
  }
};

// Tokens joined back into one expression, each inside wrap(k){...}; KaTeX
// keeps its spacing across these groups.
export const wrapTokens = (toks: string[], wrap: (k: number) => string) =>
  toks.map((t, k) => `${wrap(k)}{${t}}`).join(" ");

// Tokens as drawn this frame, each with its own color, opacity and offset
// from its layout slot (layout stays KaTeX's own).
export type DrawnToken = { tex: string; color: string; opacity: number; dx: number; dy: number };
export const drawTokens = (tokens: DrawnToken[]) =>
  tokens
    .map(
      (t) =>
        `\\htmlStyle{color:${t.color};opacity:${t.opacity.toFixed(4)};position:relative;` +
        `left:${t.dx.toFixed(2)}px;top:${t.dy.toFixed(2)}px}{${t.tex}}`,
    )
    .join(" ");

// Where a token moves: from the center of box a to that of box b, t of the way.
export const moveOffset = (a: InkBox, b: InkBox, t: number) => ({
  dx: ((a[0] + a[2] - b[0] - b[2]) / 2) * (1 - t),
  dy: ((a[1] + a[3] - b[1] - b[3]) / 2) * (1 - t),
});

// Pairs [i, j] of equal tokens, a[i] === b[j], keeping order (longest common
// subsequence).
export const matchTokens = (a: string[], b: string[]): [number, number][] => {
  const n = a.length;
  const m = b.length;
  const len = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      len[i][j] = a[i] === b[j] ? len[i + 1][j + 1] + 1 : Math.max(len[i + 1][j], len[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (a[i] === b[j]) pairs.push([i++, j++]);
    else if (len[i + 1][j] >= len[i][j + 1]) i++;
    else j++;
  }
  return pairs;
};

export type InkBox = [left: number, top: number, right: number, bottom: number];

// Windows (shares of the action, eased by `ease`) for the three kinds of
// glyphs. Outgoing ones fade out over the first OUT; each move starts, and the
// incoming ones start fading in, at the earliest time (checked every 1% of the
// action) from which no glyph meets a different one that is still or already
// showing. If incoming glyphs would get less than IN_MIN to fade in, the
// moves end sooner.
const OUT = 0.35;
const IN_MIN = 0.3;
const STEP = 0.05; // candidate start times
const MARGIN = 2; // px: glyphs closer than this count as touching
const SHOWING = 0.02; // opacity below which a fading glyph no longer counts
export const schedule = (
  outgoing: InkBox[],
  moving: [InkBox, InkBox][],
  incoming: InkBox[],
  ease: (t: number) => number,
) => {
  const meets = (a: InkBox, b: InkBox) =>
    Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > -MARGIN && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > -MARGIN;
  const clamp = (t: number) => Math.min(Math.max(t, 0), 1);
  const samples = Array.from({ length: 101 }, (_, i) => i / 100);
  const outEnd = outgoing.length ? OUT : 0;
  const outShowing = (u: number) => outgoing.length > 0 && 1 - ease(clamp(u / OUT)) > SHOWING;
  const at = ([a, b]: [InkBox, InkBox], t: number): InkBox => a.map((v, i) => v + (b[i] - v) * t) as InkBox;
  const starts = (from: number, to: number) =>
    Array.from({ length: Math.round((to - from) / STEP) + 1 }, (_, i) => from + i * STEP);
  for (const moveEnd of [1, 1 - IN_MIN]) {
    const moved = (m0: number, u: number) => ease(clamp((u - m0) / (moveEnd - m0)));
    const moveStart = starts(0, outEnd).find((m0) =>
      samples.every((u) => !outShowing(u) || moving.every((m) => outgoing.every((o) => !meets(at(m, moved(m0, u)), o)))),
    ) ?? outEnd;
    const inStart = starts(0, 1 - IN_MIN).find((c) =>
      samples
        .filter((u) => u >= c)
        .every((u) =>
          incoming.every(
            (g) => (!outShowing(u) || outgoing.every((o) => !meets(g, o))) && moving.every((m) => !meets(at(m, moved(moveStart, u)), g)),
          ),
        ),
    );
    if (inStart !== undefined || moveEnd < 1) {
      return { out: [0, outEnd || 1], move: [moveStart, moveEnd], in: [inStart ?? moveEnd, 1] } as const;
    }
  }
  throw new Error("unreachable");
};
