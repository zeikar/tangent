"""Computational checks for the claims in research.md. Run: python3 verify.py

Every number research.md states is asserted at the precision it is written.
Code can't show that no next term exists; it checks the representations,
recounts small ranges directly, lists every base-5 (and base-6) 0/1 number
below a bound to test the other bases, and recomputes the heuristic's numbers
from its formula. Statements about what is unknown rest on the sources.
"""
import math


def digits(n, b):
    out = []
    while True:
        n, r = divmod(n, b)
        out.append(r)
        if n == 0:
            return out[::-1]


def rep(n, b):
    return "".join(str(d) for d in digits(n, b))


def only01(n, b):
    while n:
        if n % b > 1:
            return False
        n //= b
    return True


def all01(n, top):
    """Only 0s and 1s in every base from 2 to top."""
    return all(only01(n, b) for b in range(2, top + 1))


def sums_of_powers(base, count):
    """Every number whose base-`base` digits are all 0 or 1, below base**count."""
    vals = [0]
    for i in range(count):
        p = base ** i
        vals += [v + p for v in vals]
    return sorted(vals)


# C1: A258107 by direct search: the smallest number > 1 that is 0/1 in bases 2..n.
def a(n):
    k = 2
    while not all01(k, n):
        k += 1
    return k


terms = [a(n) for n in range(2, 6)]
assert terms == [2, 3, 4, 82000]
print(f"C1 a(2..5) = {terms}")

# C2: every number is 0/1 in base 2; 0 and 1 are single digits in every base.
assert all(only01(n, 2) for n in range(2, 100_001))
assert all(rep(0, b) == "0" and rep(1, b) == "1" for b in range(2, 11))
print("C2 2..100,000 are all 0/1 in base 2; 0 and 1 are '0' and '1' in bases 2..10")

# C3: 2, 3 and 4 in small bases.
assert rep(2, 3) == "2"
assert (rep(3, 2), rep(3, 3), rep(3, 4)) == ("11", "10", "3")
assert (rep(4, 2), rep(4, 3), rep(4, 4)) == ("100", "11", "10")
print("C3 2 = '2'(3); 3 = 11(2) 10(3) '3'(4); 4 = 100(2) 11(3) 10(4)")

# C4: 82000 in bases 2..5, nothing smaller (> 1) passes 3, 4 and 5, and the
# jump from 4 is about 20,000 times. OEIS's counterexample 12345 is checked too.
reps = [rep(82000, b) for b in range(2, 6)]
assert reps == ["10100000001010000", "11011111001", "110001100", "10111000"]
assert [len(r) for r in reps] == [17, 11, 9, 8]
assert not any(all01(n, 5) for n in range(2, 82000))
assert 82000 / 4 == 20_500
assert [rep(12345, b) for b in range(2, 6)] == ["11000000111001", "121221020", "3000321", "343340"]
print(f"C4 82000 = {' / '.join(reps)} (bases 2..5); none of 2..81,999 passes; 82000/4 = 20,500")

# C5: 82000 is not 0/1 in base 6 (or 10), and no N > 1 can be 0/1 in every
# base: in any base above N it is the single digit N.
assert rep(82000, 6) == "1431344" and rep(82000, 10) == "82000"
assert all(digits(n, n + 1) == [n] for n in range(2, 1001))
print("C5 82000 = 1431344 in base 6; N in base N+1 is the one digit N (N = 2..1000)")

# C6, C8, C17: list every 0/1 number in base 5 below 5^20 (2^20 of them) and
# test bases 4, 3 and 6.
K5 = 20
b5 = sums_of_powers(5, K5)
b45 = [n for n in b5 if only01(n, 4)]
b345 = [n for n in b45 if only01(n, 3)]
assert b45 == [0, 1, 5, 16400, 16401, 16405, 82000, 82001, 82005]
assert b345 == [0, 1, 82000]
assert [n for n in b345 if n > 1 and only01(n, 6)] == []
assert round(5 ** K5 / 1e13, 2) == 9.54
print(f"C6 below 5^{K5} ≈ {5 ** K5:.2e}: bases 2-5 -> {b345}; bases 4,5 -> {b45}; "
      "none > 1 also passes base 6")

# C7: the search limits as written in OEIS.
big = 65520 * math.log10(2)
assert int(big) == 19723 and round(10 ** (big % 1), 2) == 3.06
# 19,724 digits, counted against powers of 10: str() refuses ints over 4300
# digits from Python 3.11 on
assert 10 ** 19_723 <= 2 ** 65520 < 10 ** 19_724
assert round(3125 * math.log10(5), 1) == 2184.3 and len(str(5 ** 3125)) == 2185
print(f"C7 2^65520 ≈ {10 ** (big % 1):.2f}e{int(big)} (19,724 digits); "
      f"5^3125 ≈ 10^{3125 * math.log10(5):.1f}")

# Easy to misstate: Evans' own search reached 111...1 (27 ones) in base 6,
# about 2.0 x 10^20, so his "greater than 10^21" is a slip for 10^20.
evans = int("1" * 27, 6)
assert evans == 204698073815493849907 and 10 ** 20 < evans < 10 ** 21
print(f"   Evans' 1...1 (27 ones, base 6) = {evans} ≈ {evans:.1e}")

# C10: Singh's 2026 comment. Any N that is 0/1 in bases 4 and 6 has a 0 as its
# second-to-last base-6 digit, so N ≡ 0 or 1 (mod 36). Checked on every base-6
# 0/1 number below 6^16 and on every N up to 10^6.
b46 = [n for n in sums_of_powers(6, 16) if only01(n, 4)]
assert b46 == [0, 1, 1296, 1297]
direct46 = [n for n in range(1_000_001) if only01(n, 4) and only01(n, 6)]
for n in b46 + direct46:
    assert n % 36 in (0, 1) and (n // 6) % 6 == 0
assert 82000 % 36 == 28
assert only01(36, 6) and not only01(36, 4)  # the condition is necessary, not sufficient
print(f"C10 0/1 in bases 4 and 6 below 6^16: {b46}; all ≡ 0 or 1 (mod 36); 82000 ≡ 28")

# C12: within one base the count is exact: 0..b^d-1 holds exactly 2^d numbers
# with only 0s and 1s, and the d-digit ones are 2^(d-1) of (b-1)*b^(d-1).
for b in range(3, 7):
    for d in range(1, 8):
        assert sum(only01(n, b) for n in range(b ** d)) == 2 ** d
        assert sum(only01(n, b) for n in range(b ** (d - 1), b ** d)) == 2 ** (d - 1)
assert 3 ** 10 == 59_049 and round(100 * 2 ** 10 / 3 ** 10, 2) == 1.73
# So up to n = b^d there are 2^d = n^(log_b 2) of them; for base 5 about n^0.43 (C11).
assert round(math.log(2) / math.log(5), 2) == 0.43
print(f"C12 b = 3..6, d = 1..7: exactly 2^d of b^d; base 3, 10 digits: 1,024 of 59,049 "
      f"≈ {100 * 2 ** 10 / 3 ** 10:.2f}%")

# C13: the funnel, counted directly.
funnel = {}
for N in (100_000, 1_000_000):
    survivors = list(range(2, N + 1))
    counts = [len(survivors)]
    for b in (2, 3, 4, 5):
        survivors = [n for n in survivors if only01(n, b)]
        counts.append(len(survivors))
    funnel[N] = (counts, survivors)
    single = [sum(only01(n, b) for n in range(2, N + 1)) for b in (3, 4, 5)]
    print(f"C13 2..{N:,}: {' -> '.join(f'{c:,}' for c in counts)} (bases 2, 3, 4, 5); "
          f"bases 3, 4, 5 alone: {single}")
assert funnel[100_000] == ([99_999, 99_999, 2046, 30, 1], [82000])
assert funnel[1_000_000] == ([999_999, 999_999, 8190, 41, 1], [82000])
assert [sum(only01(n, b) for n in range(2, 100_001)) for b in (4, 5)] == [510, 254]


# C14: Evans' heuristic. With random, independent digits, n is 0/1 in bases
# 2..b with "probability" p(n, b) = prod_{i=2..b} 1/(i-1) * (2/i)^floor(log_i n),
# which lies between n^alpha(b)/(b-1)! and b/2^(b-1) * n^alpha(b), where
# alpha(b) = 1 - b + sum_{i=2..b} log_i 2.
def alpha(b):
    return 1 - b + sum(math.log(2) / math.log(i) for i in range(2, b + 1))


def tail_sum(s, start=2, m=100_000):
    """sum_{n >= start} n^-s, partial sum plus an Euler-Maclaurin tail."""
    head = math.fsum(n ** -s for n in range(start, m))
    return head + m ** (1 - s) / (s - 1) + m ** -s / 2 + s * m ** (-s - 1) / 12


def ilog(n, i):
    k, p = 0, i
    while p <= n:
        k, p = k + 1, p * i
    return k


def p(n, b):
    return math.prod((2 / i) ** ilog(n, i) / (i - 1) for i in range(2, b + 1))


def model_count(b, lo, hi):
    """sum of p(n, b) for lo <= n <= hi, summed exactly over the stretches
    where every floor(log_i n) is constant."""
    cuts = {lo, hi + 1}
    for i in range(2, b + 1):
        q = i
        while q <= hi:
            if q > lo:
                cuts.add(q)
            q *= i
    cuts = sorted(cuts)
    return math.fsum((c1 - c0) * p(c0, b) for c0, c1 in zip(cuts, cuts[1:]))


al = {b: alpha(b) for b in range(2, 7)}
assert al[2] == 0
assert (round(al[3], 2), round(al[4], 2), round(al[5], 2)) == (-0.37, -0.87, -1.44)
assert al[4] > -1 > al[5]
s5 = tail_sum(-al[5])
lo5, hi5 = s5 / math.factorial(4), 5 / 2 ** 4 * s5
assert round(s5, 2) == 1.89 and (round(lo5, 2), round(hi5, 2)) == (0.08, 0.59)
for n in range(2, 200_000, 997):  # a sample of n
    assert n ** al[5] / 24 <= p(n, 5) < 5 / 16 * n ** al[5]
e5 = model_count(5, 2, 10 ** 80)
assert lo5 < e5 < hi5 and round(e5, 2) == 0.21
# Most of it sits on small numbers that have long been checked.
e5_small, e5_above = model_count(5, 2, 1000), model_count(5, 82001, 10 ** 80)
assert round(e5_small, 2) == 0.20 and round(e5_above, 3) == 0.002
print(f"C14 alpha(3..5) ≈ {al[3]:.2f}, {al[4]:.2f}, {al[5]:.2f}; sum n^alpha(5) ≈ {s5:.2f}; "
      f"e(5) between {lo5:.2f} and {hi5:.2f} (model sum ≈ {e5:.2f}: "
      f"≈ {e5_small:.2f} from n <= 1000, ≈ {e5_above:.3f} above 82000)")
# Same formula with b = 6 (our computation; Evans gives no number for it).
# Nearly all of the model's 0.023 comes from n <= 1000, so it says nothing
# about a(6) beyond the searched range.
s6 = tail_sum(-al[6])
lo6, hi6 = s6 / math.factorial(5), 6 / 2 ** 5 * s6
e6 = model_count(6, 2, 10 ** 80)
assert round(al[6], 2) == -2.05 and (round(lo6, 3), round(hi6, 2)) == (0.005, 0.11)
assert round(e6, 3) == 0.023 and model_count(6, 2, 1000) / e6 > 0.99
print(f"    b = 6: alpha ≈ {al[6]:.2f}, e(6) between {lo6:.3f} and {hi6:.2f} "
      f"(model sum ≈ {e6:.3f}, over 99% of it from n <= 1000)")

# C15: the model is rough. Over 2..10^6 it expects about 11 numbers that are
# 0/1 in bases 2..4; there are 41. The gap is not an artifact of where the
# range ends: at 3^12 - 1, 4^10 - 1 and 3^13 - 1 the model says 10 to 12 and
# the count is still 41. Bases are entangled: n ending in 1 in base 6 ends in
# 1 in base 3.
m4 = model_count(4, 2, 10 ** 6)
assert round(m4) == 11
for cut in (3 ** 12 - 1, 4 ** 10 - 1, 3 ** 13 - 1):
    assert 10 <= model_count(4, 2, cut) < 12.5
    assert sum(all01(n, 4) for n in range(2, cut + 1)) == 41
assert all(n % 3 == 1 for n in range(1, 10_000) if n % 6 == 1)
print(f"C15 model over 2..10^6: bases 2-4 ≈ {m4:.1f} (actual 41; 10-12 vs 41 at 3^12-1, 4^10-1, 3^13-1)")

# C16: bases 3 and 4 (= 2, 3, 4) keep going: OEIS A258981's data, 82000 is a(27).
A258981 = [0, 1, 4, 81, 84, 85, 256, 273, 324, 325, 336, 337, 1089, 1092, 1093, 20496,
           20497, 20736, 20737, 20740, 65620, 65856, 65857, 81921, 81984, 81985, 82000,
           86032, 86277, 86292, 86293, 86356, 262468, 262480, 263169]
listed34 = [n for n in range(263_170) if all01(n, 4)]
assert listed34 == A258981
assert A258981.index(82000) + 1 == 27
assert len([n for n in A258981 if 1 < n <= 82000]) == 25
print(f"C16 0..263,169 in bases 2-4: {len(listed34)} numbers = A258981's data; 82000 is a(27)")

# C18: near misses. Exactly two of bases 3, 4, 5 pass (three of four rows lit).
near = [n for n in range(2, 100_001) if sum(only01(n, b) for b in (3, 4, 5)) == 2]
close = [n for n in near if abs(n - 82000) <= 100]
assert len(near) == 46 and close == [81900, 81901, 81921, 81984, 81985, 82001, 82005]
assert all(only01(n, 3) and only01(n, 5) for n in (81900, 81901))
assert all(only01(n, 3) and only01(n, 4) for n in (81921, 81984, 81985))
assert all(only01(n, 4) and only01(n, 5) for n in (82001, 82005))
print(f"C18 2..100,000: {len(near)} near misses; within 100 of 82000: {close}")

# C20: counting in base 3 and base 2 (the dictionary's example).
assert [rep(n, 3) for n in range(10)] == ["0", "1", "2", "10", "11", "12", "20", "21", "22", "100"]
assert [rep(n, 2) for n in range(5)] == ["0", "1", "10", "11", "100"]
assert [rep(n, 5) for n in range(4, 7)] == ["4", "10", "11"]
print("C20 base 3 counts 0 1 2 10 11 12 20 21 22 100; base 2 counts 0 1 10 11 100")

print("all checks passed")
