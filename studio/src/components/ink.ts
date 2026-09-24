// Where KaTeX output actually draws, in client pixels (divide by
// useCurrentScale() for frame pixels).

// Union of glyphs, radical signs and fraction bars. KaTeX's strut and spacing
// spans are left out: they are taller or wider than the ink.
export const inkRect = (el: Element) => {
  const rects: DOMRect[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (/^[\s\u200b]*$/.test(n.textContent ?? "")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    rects.push(range.getBoundingClientRect());
  }
  el.querySelectorAll("svg, .frac-line").forEach((e) => rects.push(e.getBoundingClientRect()));
  if (!rects.length) throw new Error("KaTeX output has no ink");
  return {
    left: Math.min(...rects.map((r) => r.left)),
    right: Math.max(...rects.map((r) => r.right)),
    top: Math.min(...rects.map((r) => r.top)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  };
};

// A whole expression's ink: its height from KaTeX's struts, which KaTeX sizes
// from glyph metrics (a text range's height is the font's ascent and descent,
// so an x would get the same top as a 1).
export const expressionInk = (el: Element) => {
  const struts = [...el.querySelectorAll(".katex-strut, .strut")].map((s) => s.getBoundingClientRect());
  if (!struts.length) throw new Error("KaTeX output has no strut");
  return {
    ...inkRect(el),
    top: Math.min(...struts.map((r) => r.top)),
    bottom: Math.max(...struts.map((r) => r.bottom)),
  };
};
