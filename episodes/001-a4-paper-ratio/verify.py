"""Computational checks for the claims in research.md. Run: python3 verify.py

Every number research.md states is asserted at the precision it is written.
"""
import math

# ISO 216 A series, mm (short, long). Source: [S4] Table 1.
A = {0: (841, 1189), 1: (594, 841), 2: (420, 594), 3: (297, 420), 4: (210, 297),
     5: (148, 210), 6: (105, 148), 7: (74, 105), 8: (52, 74), 9: (37, 52), 10: (26, 37)}
SQRT2 = math.sqrt(2)


def design(n):
    """Unrounded A(n) in mm, from [S1]'s formula (= [S4] equations (1), (2) + halving)."""
    return 1000 * 2 ** (-0.25 - n / 2), 1000 * 2 ** (0.25 - n / 2)


# C1: every size is √2:1 within rounding error.
off = {n: 100 * (l / s / SQRT2 - 1) for n, (s, l) in A.items()}
for n, (s, l) in A.items():
    print(f"A{n:<2} {s:>4} x {l:<4}  ratio ≈ {l / s:.5f}  off by ≈ {off[n]:+.3f}%")
assert max(abs(v) for v in off.values()) < 0.7
assert (round(off[8], 2), round(off[10], 2), round(off[9], 2)) == (0.63, 0.63, -0.62)
assert round(off[4], 3) == 0.005
print(f"C1 all within 0.7%; A8, A10 ≈ {off[8]:+.2f}%, A9 ≈ {off[9]:+.2f}%, A4 ≈ {off[4]:+.3f}%")

# C2: halving A(n) across its long side gives A(n+1) (long side floored to mm).
for n in range(10):
    s, l = A[n]
    assert A[n + 1] == (l // 2, s), n
print("C2 halving: A(n) cut in half = A(n+1) for n = 0..9")

# C3: the only ratio x (long/short) preserved by halving: x/1 = 1/(x/2) -> x^2 = 2.
x = SQRT2
assert math.isclose(x / 1, 1 / (x / 2))
for other in (1.25, 1.5, 11 / 8.5):
    assert not math.isclose(other, 1 / (other / 2))
assert round(x, 6) == 1.414214
print(f"C3 x/1 = 1/(x/2) holds only for x = sqrt(2) ≈ {x:.6f}")

# C5: A0 is 1 m² by design; [S4] equations (1) y/x = √2 and (2) xy = 1 m²
# give x = 2^(-1/4) m, y = 2^(1/4) m, which the standard states as 0,841 / 1,189 m.
x0, y0 = 2 ** -0.25, 2 ** 0.25
assert math.isclose(y0 / x0, SQRT2) and math.isclose(x0 * y0, 1)
assert (round(x0, 6), round(y0, 6)) == (0.840896, 1.189207)
assert (round(x0, 3), round(y0, 3)) == (0.841, 1.189)
a0 = 841 * 1189
assert a0 == 999_949 and round(a0 / 1e6, 5) == 0.99995
print(f"C5 A0 design ≈ {x0:.6f} x {y0:.6f} m; table 841 x 1189 mm -> {a0:,} mm² ≈ {a0 / 1e6:.5f} m²")

# C6: A4 is A0 halved four times -> 1/16 m² by design.
a4 = 210 * 297
assert a4 == 62_370 and 1e6 / 2 ** 4 == 62_500
print(f"C6 A4 area {a4:,} mm² vs 1/16 m² = {1e6 / 16:,.0f} mm²")

# C7: 80 g/m² paper -> an A4 sheet weighs about 5 g.
assert round(80 * a4 / 1e6, 2) == 4.99
print(f"C7 A4 at 80 g/m² ≈ {80 * a4 / 1e6:.2f} g")

# C8: A0 is the design size rounded to the nearest mm (840.9 -> 841, so not
# floored); the smaller sizes come from halving the rounded sizes and flooring
# (C2). Flooring the unrounded design sizes would give A1 = 594 x 840, not 841.
assert (round(1000 * x0), round(1000 * y0)) == A[0]
assert round(1000 * x0, 3) == 840.896
assert math.floor(1000 * x0) == 840 != A[1][1]
assert (round(297 / 210, 5), round(SQRT2, 5)) == (1.41429, 1.41421)
print(f"C8 297/210 ≈ {297 / 210:.5f}, sqrt(2) ≈ {SQRT2:.5f}")

# C11: US Letter (8.5 x 11 in) changes shape when halved.
letter, half = 11 / 8.5, 8.5 / 5.5
assert (round(letter, 3), round(half, 3)) == (1.294, 1.545)
print(f"C11 Letter ratio ≈ {letter:.3f}, halved ≈ {half:.3f}")

# C12: adjacent A sizes differ by √2 in length (2 in area), hence copier
# presets of 141% (A4 -> A3) and 71% (A3 -> A4); Canon shows 70% instead.
up, down = [], []
for n in range(10):
    (s1, l1), (s0, l0) = A[n], A[n + 1]
    up += [s1 / s0, l1 / l0]
    down += [s0 / s1, l0 / l1]
assert all(abs(r / SQRT2 - 1) < 0.01 for r in up)
assert all(abs(r * SQRT2 - 1) < 0.01 for r in down)
assert (round(420 / 297, 4), round(297 / 210, 4)) == (1.4141, 1.4143)
assert round(100 * SQRT2, 1) == 141.4 and round(100 / SQRT2, 2) == 70.71
assert math.floor(100 * SQRT2) == 141
assert round(100 / SQRT2) == 71 and math.floor(100 / SQRT2) == 70
print(f"C12 A4 -> A3: 420/297 ≈ {420 / 297:.4f}, 297/210 ≈ {297 / 210:.4f} (141%); "
      f"A3 -> A4: 297/420 ≈ {297 / 420:.4f}, 210/297 ≈ {210 / 297:.4f} (71% or 70%)")
# The presets are rounded, so the fit is not to the millimetre: 71% is above
# 1/√2, so a full A3 page comes out about 1 mm larger than A4; 70% and 141% fit.
assert round(1.41 ** 2, 2) == 1.99
overs = {}
for (src, dst, p) in ((4, 3, 1.41), (3, 4, 0.71), (3, 4, 0.70)):
    overs[p] = max(A[src][i] * p - A[dst][i] for i in (0, 1))
    print(f"    A{src} at {p:.0%} on A{dst}: {A[src][0] * p:.1f} x {A[src][1] * p:.1f} mm "
          f"on {A[dst][0]} x {A[dst][1]} "
          f"({'over by ≈ %.1f mm' % overs[p] if overs[p] > 0 else 'fits'})")
assert overs[1.41] <= 0 and overs[0.70] <= 0 and round(overs[0.71]) == 1


# C13: same shape -> one uniform scale fills the target page. Scale A(n) to
# A(m) by the factor that fits both sides; the other side's leftover is the
# rounding residue only. Letter -> Ledger (11 x 17 in) leaves a real margin.
def leftover(src, dst):
    k = min(dst[0] / src[0], dst[1] / src[1])
    return dst[0] - k * src[0], dst[1] - k * src[1], k


worst_rel = max(max(a / A[m][0], b / A[m][1])
                for n in A for m in A for a, b, _ in [leftover(A[n], A[m])])
worst_mm = max(max(leftover(A[n], A[m])[:2]) for n, m in ((3, 4), (4, 3), (4, 5), (5, 4)))
assert round(100 * worst_rel, 2) == 1.24 and round(worst_mm, 2) == 0.69
print(f"C13 any A size -> any A size: leftover ≤ {100 * worst_rel:.2f}% of the side; "
      f"A3 <-> A4 <-> A5 ≤ {worst_mm:.2f} mm")
_, ll, k = leftover((8.5, 11), (11, 17))
assert round(100 * k) == 129 and round(ll * 25.4, -1) == 70 and round(100 * ll / 17) == 16
print(f"C13 Letter -> Ledger at ≈ {100 * k:.0f}%: leftover ≈ {ll * 25.4:.0f} mm "
      f"({100 * ll / 17:.0f}% of the 17 in side)")

# C14: the rounding residue is under 1 mm for every size, far below the
# standard's tolerance (±1.5 mm up to 150 mm [S4]; ±2 mm for 150-600 mm [S1][S2]).
gaps = {n: max(abs(t - d) for t, d in zip(A[n], design(n))) for n in A}
assert max(gaps.values()) < 0.7 and round(gaps[5], 2) == round(gaps[6], 2) == 0.65
assert max(gaps, key=gaps.get) in (5, 6)
d4 = design(4)
assert (round(d4[0], 2), round(d4[1], 2)) == (210.22, 297.30) and round(gaps[4], 2) == 0.30
assert round(210 * SQRT2, 2) == 296.98 and round(297 - 210 * SQRT2, 2) == 0.02
print(f"C14 A4 design ≈ {d4[0]:.2f} x {d4[1]:.2f} mm vs table 210 x 297: gap ≈ {gaps[4]:.2f} mm; "
      f"largest over A0-A10 ≈ {max(gaps.values()):.2f} mm; 210·sqrt(2) ≈ {210 * SQRT2:.2f} mm")
