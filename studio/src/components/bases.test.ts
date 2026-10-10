import { describe, expect, it } from "vitest";
import { ease } from "../style/theme";
import { countValue, digitsOf, only01, runValues } from "./bases";

const rep = (n: number, b: number) => digitsOf(n, b).join("");

describe("digitsOf", () => {
  it("writes 82000 as research's C4 and C5 do", () => {
    expect([2, 3, 4, 5, 6].map((b) => rep(82000, b))).toEqual(["10100000001010000", "11011111001", "110001100", "10111000", "1431344"]);
    expect(rep(0, 3)).toBe("0");
  });

  it("finds 82000 the first number past 1 lit in bases 2 to 5", () => {
    let n = 2;
    while (![2, 3, 4, 5].every((b) => only01(n, b))) n++;
    expect(n).toBe(82000);
  });
});

describe("runValues", () => {
  const bases = [3, 2, 4, 5];
  const run = runValues(5, 81899, 30, ease.smooth, bases, 3);

  it("starts and ends on its values and never goes down", () => {
    expect(run).toHaveLength(30);
    expect(run[0]).toBe(5);
    expect(run[29]).toBe(81899);
    for (let i = 1; i < run.length; i++) expect(run[i]).toBeGreaterThanOrEqual(run[i - 1]);
  });

  it("flickers a lower lamp on real numbers, never lighting all four rows", () => {
    const lit = (n: number) => bases.filter((b) => b > 2 && only01(n, b)).length;
    const flickers = run.filter((n, i) => i % 3 === 2 && n > 100 && lit(n) === 1);
    expect(flickers.length).toBeGreaterThanOrEqual(4);
    expect(run.every((n) => lit(n) < 3)).toBe(true);
  });
});

describe("countValue", () => {
  it("counts up into each stop in its slot's first quarter, then holds it", () => {
    const at = (i: number) => countValue(81899, [81900, 81901, 81921], 36, i);
    expect([0, 1, 2, 3, 11].map(at)).toEqual([81900, 81900, 81900, 81900, 81900]);
    expect([12, 13].map(at)).toEqual([81901, 81901]);
    expect([24, 25, 26, 27, 35, 40].map(at)).toEqual([81908, 81914, 81921, 81921, 81921, 81921]);
  });

  it("spreads the numbers between evenly when they outnumber the frames", () => {
    expect([0, 1, 2].map((i) => countValue(81985, [82000], 11, i))).toEqual([81993, 82000, 82000]);
  });
});
