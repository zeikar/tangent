import katex from "katex";

// Changing one TeX expression into another without two different glyphs ever
// overlapping: tokens both share move from their old place to their new one,
// the rest fade out or in where they stand, each at a time nothing else is
// in its way. Used by Equation, PaperRect's edge labels and Note.

// A token is a symbol, a command with its arguments (\frac{x}{2}), or a
// group; a script's base and each script are tokens of their own (x^2 is x
// and a superscript 2), and \sqrt{...} is a container token (the radical)
// around its radicand's tokens. Spacing (\, \quad, ~) joins the token before
// it, having no ink of its own. Keys match tokens across expressions: a
// script's tokens are keyed apart from full-size ones.
type Node =
  | { kind: "atom"; tex: string }
  | { kind: "script"; base: Node; sup?: Node[]; sub?: Node[] }
  | { kind: "wrap"; open: string; close: string; key: string; inner: Node[] };

export type Tokens = {
  keys: string[];
  parents: (number | null)[]; // the container token each token sits in
  // The expression with each token k wrapped as `${wrap(k)}{...}`.
  tex: (wrap: (k: number) => string) => string;
};

const SPACING = /^(\\[,:;! ]|\\q?quad|~)$/;

const parse = (tex: string): Node[] => {
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
  const atom = (): Node => {
    space();
    if (tex[i] === "{") return { kind: "atom", tex: group("{", "}") };
    if (tex[i] !== "\\") return { kind: "atom", tex: tex[i++] };
    const name = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i))![0];
    i += name.length;
    if (name === "\\sqrt") {
      space();
      const index = tex[i] === "[" ? group("[", "]") : "";
      space();
      if (tex[i] !== "{") throw new Error(`\\sqrt without a braced radicand in ${tex}`);
      const radicand = group("{", "}");
      return { kind: "wrap", open: `\\sqrt${index}{`, close: "}", key: `\\sqrt${index}`, inner: parse(radicand.slice(1, -1)) };
    }
    // A command word takes the groups right after it as its arguments.
    let s = name;
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
    return { kind: "atom", tex: s };
  };
  const scriptArg = (): Node[] => {
    space();
    return tex[i] === "{" ? parse(group("{", "}").slice(1, -1)) : [atom()];
  };
  const nodes: Node[] = [];
  for (space(); i < tex.length; space()) {
    let n = atom();
    let sup: Node[] | undefined;
    let sub: Node[] | undefined;
    for (;;) {
      const at = i;
      space();
      if (tex[i] === "^" && !sup) {
        i++;
        sup = scriptArg();
      } else if (tex[i] === "_" && !sub) {
        i++;
        sub = scriptArg();
      } else if (tex[i] === "'" && n.kind === "atom" && !sup && !sub) {
        n = { kind: "atom", tex: n.tex + tex[i++] };
      } else {
        i = at;
        break;
      }
    }
    if (sup || sub) n = { kind: "script", base: n, sup, sub };
    const last = nodes[nodes.length - 1];
    if (n.kind === "atom" && SPACING.test(n.tex) && last?.kind === "atom") last.tex += n.tex;
    else nodes.push(n);
  }
  return nodes;
};

const assemble = (nodes: Node[], wrap: (k: number) => string, next: { k: number }): string =>
  nodes
    .map((n) => {
      if (n.kind === "atom") return `${wrap(next.k++)}{${n.tex}}`;
      if (n.kind === "wrap") {
        const k = next.k++;
        return `${wrap(k)}{${n.open}${assemble(n.inner, wrap, next)}${n.close}}`;
      }
      const base = assemble([n.base], wrap, next);
      const sup = n.sup ? `^{${assemble(n.sup, wrap, next)}}` : "";
      const sub = n.sub ? `_{${assemble(n.sub, wrap, next)}}` : "";
      return base + sup + sub;
    })
    .join(" ");

// Keys and containers, numbered in assemble's order.
const collect = (nodes: Node[], prefix: string, parent: number | null, out: Pick<Tokens, "keys" | "parents">) => {
  for (const n of nodes) {
    if (n.kind === "atom") {
      out.keys.push(prefix + n.tex);
      out.parents.push(parent);
    } else if (n.kind === "wrap") {
      const k = out.keys.length;
      out.keys.push(prefix + n.key);
      out.parents.push(parent);
      collect(n.inner, prefix, k, out);
    } else {
      collect([n.base], prefix, parent, out);
      if (n.sup) collect(n.sup, `${prefix}^`, parent, out);
      if (n.sub) collect(n.sub, `${prefix}_`, parent, out);
    }
  }
};

const tokenCache = new Map<string, Tokens>();
// A string that doesn't split cleanly stays one token.
export const tokenize = (tex: string): Tokens => {
  let t = tokenCache.get(tex);
  if (!t) {
    let nodes: Node[];
    try {
      nodes = parse(tex);
      katex.renderToString(assemble(nodes, (k) => `\\htmlData{tok=${k}}`, { k: 0 }), { trust: true, strict: "ignore" });
    } catch {
      nodes = [{ kind: "atom", tex }];
    }
    const out = { keys: [] as string[], parents: [] as (number | null)[] };
    collect(nodes, "", null, out);
    t = { ...out, tex: (wrap) => assemble(nodes, wrap, { k: 0 }) };
    tokenCache.set(tex, t);
  }
  return t;
};

// A color (#rrggbb, rgb() or rgba()) with its alpha scaled by `a`.
export const withAlpha = (color: string, a: number) => {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  const [r, g, b, a0] = hex
    ? [...hex.slice(1).map((h) => parseInt(h, 16)), 1]
    : (/rgba?\(([^)]+)\)/.exec(color)?.[1].split(",").map(Number) ?? []);
  if (b === undefined) throw new Error(`withAlpha: can't read color ${color}`);
  return `rgba(${r},${g},${b},${((a0 ?? 1) * a).toFixed(4)})`;
};

// A token as drawn this frame: its color, its opacity (as the color's alpha,
// so a radical fades without its radicand), and its offset from its layout
// slot (written relative to its container's).
export type TokenStyle = { color: string; opacity: number; dx: number; dy: number };
export const drawTokens = (t: Tokens, styles: TokenStyle[]) =>
  t.tex((k) => {
    const s = styles[k];
    const p = t.parents[k];
    const dx = s.dx - (p === null ? 0 : styles[p].dx);
    const dy = s.dy - (p === null ? 0 : styles[p].dy);
    return `\\htmlStyle{color:${withAlpha(s.color, s.opacity)};position:relative;left:${dx.toFixed(2)}px;top:${dy.toFixed(2)}px}`;
  });

export type InkBox = [left: number, top: number, right: number, bottom: number];

// Where a token moves: from the center of box a to that of box b, t of the way.
export const moveOffset = (a: InkBox, b: InkBox, t: number) => ({
  dx: ((a[0] + a[2] - b[0] - b[2]) / 2) * (1 - t),
  dy: ((a[1] + a[3] - b[1] - b[3]) / 2) * (1 - t),
});

// Pairs [i, j] of equal keys, a[i] === b[j], keeping order (longest common
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

// A glyph for the schedule: its ink box(es) and ids (a moving glyph has its
// old and its new id); `apart(a, b)` says whether two ids may not overlap
// (a radical and its own radicand may).
export type Glyph = { box: InkBox; ids: string[] };
export type Move = { from: InkBox; to: InkBox; ids: string[] };

// Windows (shares of the action, eased by `ease`) for the three kinds of
// glyphs. Outgoing ones fade out over the first OUT; the moves start, and the
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
  outgoing: Glyph[],
  moving: Move[],
  incoming: Glyph[],
  ease: (t: number) => number,
  apart: (a: string, b: string) => boolean,
) => {
  const meets = (a: InkBox, b: InkBox) =>
    Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > -MARGIN && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > -MARGIN;
  const clash = (a: { ids: string[] }, b: { ids: string[] }) => a.ids.some((x) => b.ids.some((y) => apart(x, y)));
  const clamp = (t: number) => Math.min(Math.max(t, 0), 1);
  const samples = Array.from({ length: 101 }, (_, i) => i / 100);
  const outEnd = outgoing.length ? OUT : 0;
  const outShowing = (u: number) => outgoing.length > 0 && 1 - ease(clamp(u / OUT)) > SHOWING;
  const at = (m: Move, t: number): InkBox => m.from.map((v, i) => v + (m.to[i] - v) * t) as InkBox;
  const starts = (from: number, to: number) =>
    Array.from({ length: Math.round((to - from) / STEP) + 1 }, (_, i) => from + i * STEP);
  for (const moveEnd of [1, 1 - IN_MIN]) {
    const moved = (m0: number, u: number) => ease(clamp((u - m0) / (moveEnd - m0)));
    const moveStart =
      starts(0, outEnd).find((m0) =>
        samples.every(
          (u) => !outShowing(u) || moving.every((m) => outgoing.every((o) => !clash(m, o) || !meets(at(m, moved(m0, u)), o.box))),
        ),
      ) ?? outEnd;
    const inStart = starts(0, 1 - IN_MIN).find((c) =>
      samples
        .filter((u) => u >= c)
        .every((u) =>
          incoming.every(
            (g) =>
              (!outShowing(u) || outgoing.every((o) => !clash(g, o) || !meets(g.box, o.box))) &&
              moving.every((m) => !clash(g, m) || !meets(at(m, moved(moveStart, u)), g.box)),
          ),
        ),
    );
    if (inStart !== undefined || moveEnd < 1) {
      return { out: [0, outEnd || 1], move: [moveStart, moveEnd], in: [inStart ?? moveEnd, 1] } as const;
    }
  }
  throw new Error("unreachable");
};

// A morph between two tokenized expressions whose tokens sit at the given ink
// boxes (null: no ink of their own), given which old token each matched new
// token comes from (matchTokens, or per part for Equation): every token's
// opacity and offset at this point of the action, all scheduled together.
export type MorphToken = { id: string; parent: string | null; box: InkBox | null };
export const morph = (
  from: MorphToken[],
  to: MorphToken[],
  matched: [number, number][],
  progress: (p0: number, p1: number) => number,
  ease: (t: number) => number,
) => {
  const pairs = matched.filter(([i, j]) => from[i].box && to[j].box);
  const source = new Map(pairs.map(([i, j]) => [j, i]));
  const staying = new Set(pairs.map(([i]) => i));
  // Two ids may overlap when one token sits inside the other (a radical and its radicand).
  const byId = new Map([...from, ...to].map((t) => [t.id, t]));
  const inside = (a: string, b: string) => {
    for (let q = byId.get(a)?.parent ?? null; q !== null; q = byId.get(q)?.parent ?? null) if (q === b) return true;
    return false;
  };
  const apart = (a: string, b: string) => a !== b && !inside(a, b) && !inside(b, a);
  const w = schedule(
    from.flatMap((t, i) => (staying.has(i) || !t.box ? [] : [{ box: t.box, ids: [t.id] }])),
    pairs.map(([i, j]) => ({ from: from[i].box!, to: to[j].box!, ids: [from[i].id, to[j].id] })),
    to.flatMap((t, j) => (source.has(j) || !t.box ? [] : [{ box: t.box, ids: [t.id] }])),
    ease,
    apart,
  );
  const out = 1 - progress(...w.out);
  const move = progress(...w.move);
  const enter = progress(...w.in);
  return {
    // Old tokens' opacity factor: moving ones are drawn by the new expression.
    old: from.map((_, i) => (staying.has(i) ? 0 : out)),
    // New tokens: opacity, the old token each comes from, and the offset from its slot.
    new: to.map((t, j) => {
      const i = source.get(j);
      return i === undefined
        ? { opacity: enter, source: null, dx: 0, dy: 0 }
        : { opacity: 1, source: i, ...moveOffset(from[i].box!, t.box!, move) };
    }),
    move,
  };
};
