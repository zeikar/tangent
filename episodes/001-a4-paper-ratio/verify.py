"""Computational checks for the claims in research.md. Run: python3 verify.py"""
import math

# ISO 216 A series, mm (short, long). Source: [S1] table.
A = {0: (841, 1189), 1: (594, 841), 2: (420, 594), 3: (297, 420), 4: (210, 297),
     5: (148, 210), 6: (105, 148), 7: (74, 105), 8: (52, 74), 9: (37, 52), 10: (26, 37)}
SQRT2 = math.sqrt(2)

# C1: every size is √2:1 within rounding error.
for n, (s, l) in A.items():
    ratio = l / s
    assert abs(ratio - SQRT2) / SQRT2 < 0.01, (n, ratio)
    print(f"A{n:<2} {s:>4} x {l:<4}  ratio {ratio:.5f}  off by {100 * (ratio / SQRT2 - 1):+.3f}%")

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
print(f"C3 x/1 = 1/(x/2) holds only for x = sqrt(2) = {x:.6f}")

# C5: A0 is 1 m² (before rounding).
a0 = 841 * 1189
print(f"C5 A0 area {a0:,} mm² = {a0 / 1e6:.6f} m²")
assert abs(a0 / 1e6 - 1) < 1e-4

# C6: A4 is A0 halved four times -> 1/16 m².
a4 = 210 * 297
print(f"C6 A4 area {a4:,} mm² vs 1/16 m² = {1e6 / 16:,.0f} mm²")
assert abs(a4 / (1e6 / 16) - 1) < 0.01

# C7: 80 g/m² paper -> an A4 sheet weighs about 5 g.
print(f"C7 A4 at 80 g/m²: {80 * a4 / 1e6:.2f} g")

# C8: A4's rounded ratio vs √2.
print(f"C8 297/210 = {297 / 210:.6f}, sqrt(2) = {SQRT2:.6f}")

# C11: US Letter (8.5 x 11 in) changes shape when halved.
letter, half = 11 / 8.5, 8.5 / 5.5
print(f"C11 Letter ratio {letter:.3f}, halved {half:.3f}")
assert abs(letter - half) > 0.2
