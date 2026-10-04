"""Computational checks for the claims in research.md. Run: python3 verify.py

A program can only look at finitely many rooms, so each infinite claim is
checked on a window of rooms 1..N (and the finite-hotel claims exhaustively
for small hotels). The window checks show the rule never collides and leaves
exactly the rooms research.md says it leaves; the infinite statements
themselves rest on the sources.
"""
import itertools
import math

N = 10_000
GUESTS = range(1, N + 1)


def injective(f, xs):
    images = [f(x) for x in xs]
    return len(set(images)) == len(images)


# C1: everyone moves from n to n + 1 -> no two guests share a room, room 1 is free.
shift = {n: n + 1 for n in GUESTS}
assert injective(shift.get, GUESTS)
assert set(shift.values()) == set(range(2, N + 2))
assert 1 not in shift.values()
print(f"C1 n -> n+1: guests 1..{N} land in rooms 2..{N + 1}, one each; room 1 is free")

# C2: k new guests -> move n to n + k, rooms 1..k are free.
for k in (1, 2, 5, 37):
    moved = {n + k for n in GUESTS}
    assert len(moved) == N and moved.isdisjoint(range(1, k + 1))
    assert moved == set(range(k + 1, N + k + 1))
print("C2 n -> n+k frees exactly rooms 1..k (k = 1, 2, 5, 37)")

# C3: infinitely many new guests -> move n to 2n. The old guests fill the even
# rooms exactly, and every odd room is free.
double = {n: 2 * n for n in GUESTS}
assert injective(double.get, GUESTS)
window = set(range(1, 2 * N + 1))
assert set(double.values()) == {r for r in window if r % 2 == 0}
free = window - set(double.values())
assert free == {r for r in window if r % 2 == 1} and len(free) == N
print(f"C3 n -> 2n: rooms 1..{2 * N} hold the old guests in all {N} even rooms; "
      f"all {len(free)} odd rooms are free")

# C5: Gamow's book came "more than two decades" after the lecture (Jan 1925 -> 1947).
assert 1947 - 1925 == 22 > 20
print("C5 1925 -> 1947: 22 years")

# C7: naturals and evens pair one to one (n <-> 2n, inverse m -> m/2), although
# the evens are only half of each window 1..2N.
evens = sorted(r for r in window if r % 2 == 0)
assert [m // 2 for m in evens] == list(GUESTS)
assert all(2 * (m // 2) == m for m in evens)
assert len(evens) * 2 == len(window)
print(f"C7 1..{N} <-> 2, 4, .., {2 * N}: each natural has one even partner and back; "
      f"evens are half of 1..{2 * N}")

# C8: Galileo's counts - squares up to 100, 10,000 and 1,000,000 are 10, 100 and
# 1,000 (1/10, 1/100, 1/1000 of the numbers), yet n <-> n² pairs every number.
for limit, count in ((100, 10), (10_000, 100), (1_000_000, 1_000)):
    assert math.isqrt(limit) == count and limit // count == count
assert injective(lambda n: n * n, GUESTS)
print("C8 squares up to 10^2, 10^4, 10^6: 10, 100, 1000 (1/10, 1/100, 1/1000); n <-> n² is one to one")

# C9: a full finite hotel can't take one more guest: no way to give n + 1 guests
# n rooms one each, and no finite set pairs off with a proper part of itself.
# Exhaustive over every assignment for hotels of 1..5 rooms.
for n in range(1, 6):
    rooms = range(n)
    assert not any(len(set(a)) == n + 1 for a in itertools.product(rooms, repeat=n + 1))
    for missing in rooms:
        part = [r for r in rooms if r != missing]
        assert not any(len(set(a)) == n for a in itertools.product(part, repeat=n))
# And in a full finite hotel, n -> n + 1 sends the last guest to a room that doesn't exist.
assert max(shift.values()) == N + 1 > N
print("C9 hotels with 1..5 rooms: no one-each assignment of n+1 guests, "
      "and no pairing with a proper part (all assignments tried)")

# C13: Cantor's diagonal step. For any list of k rows of k binary digits, flipping
# the diagonal gives a row that differs from every listed row. Exhaustive for k <= 4.
for k in range(1, 5):
    for flat in itertools.product((0, 1), repeat=k * k):
        rows = [flat[i * k:(i + 1) * k] for i in range(k)]
        diag = tuple(1 - rows[i][i] for i in range(k))
        assert all(diag[i] != rows[i][i] for i in range(k))
        assert diag not in rows
print("C13 diagonal: the flipped diagonal is missing from every list of k rows, k = 1..4 "
      f"({sum(2 ** (k * k) for k in range(1, 5)):,} lists)")

# C14: ℵ0 + 1 = ℵ0 is the C1 pairing (Cantor: new element e0 -> 1, ν -> ν + 1).
pair = {"e0": 1, **{v: v + 1 for v in GUESTS}}
assert len(set(pair.values())) == len(pair) and set(pair.values()) == set(range(1, N + 2))
# Floating point (IEEE 754) follows the extended reals' convention: ∞ + 1 = ∞,
# while ∞ − ∞ is left undefined (NaN).
assert math.inf + 1 == math.inf and math.isnan(math.inf - math.inf)
print("C14 {e0} ∪ {1..N} -> {1..N+1} one to one; inf + 1 == inf, inf - inf is NaN")

# C15: the moves as a walk. In n -> n+1 everyone walks one room; in n -> 2n guest n
# walks n rooms, so the walk has no bound: at one room per unit time, by time T only
# guests 1..T have arrived. Every room's old guest leaves at time 0 and its new guest
# arrives later, so no room ever holds two guests; the odd rooms are empty from time 0.
assert all(shift[n] - n == 1 for n in GUESTS)
assert all(double[n] - n == n for n in GUESTS)
for T in (1, 10, 1000):
    assert sum(1 for n in GUESTS if double[n] - n <= T) == T
arrive = {double[n]: double[n] - n for n in GUESTS}      # room -> arrival time
assert all(t > 0 for t in arrive.values())
assert all(r not in arrive for r in free)
print("C15 n -> 2n: guest n walks n rooms; by time T only T guests have arrived; "
      "arrivals all after time 0, odd rooms never re-entered")

# C16: infinitely many coaches of infinitely many guests.
# Prime powers: old guest n -> 2^n, coach c seat n -> (c-th odd prime)^n.
ODD_PRIMES = [p for p in range(3, 200) if all(p % d for d in range(2, math.isqrt(p) + 1))]
K = 12
rooms = {(0, n): 2 ** n for n in range(1, K + 1)}
rooms.update({(c, n): ODD_PRIMES[c - 1] ** n for c in range(1, K + 1) for n in range(1, K + 1)})
assert len(set(rooms.values())) == len(rooms)
assert ODD_PRIMES[:3] == [3, 5, 7] and rooms[(1, 2)] == 9 and rooms[(2, 3)] == 125


def prime_power(m):
    p = next(d for d in range(2, m + 1) if m % d == 0)
    while m % p == 0:
        m //= p
    return m == 1


assert not any(prime_power(m) for m in (6, 10, 12, 15, 847)) and 847 == 7 * 11 ** 2
assert not {6, 10, 12, 15, 847} & set(rooms.values())
print(f"C16 prime powers: {len(rooms)} guests (hotel + {K} coaches x {K} seats) in distinct rooms; "
      "6, 10, 12, 15, 847 stay empty")
# Prime factorization: seat n, coach c -> 2^n 3^c (c = 0 for the hotel); 2592 = 2^5 3^4.
pf = {(c, n): 2 ** n * 3 ** c for c in range(0, K + 1) for n in range(1, K + 1)}
assert len(set(pf.values())) == len(pf) and 2 ** 5 * 3 ** 4 == 2592
# Triangular numbers fill every room: hotel n -> n(n+1)/2, coach c seat n ->
# (c+n-1)(c+n)/2 + n. All (c, n) with c + n <= S fill rooms 1..S(S+1)/2 exactly.
S = 200
tri = [(c + n - 1) * (c + n) // 2 + n for c in range(0, S) for n in range(1, S + 1 - c)]
assert sorted(tri) == list(range(1, S * (S + 1) // 2 + 1))
assert all((0 + n - 1) * n // 2 + n == n * (n + 1) // 2 for n in GUESTS)
print(f"C16 2^n 3^c distinct (2592 = 2^5 3^4); triangular rule fills rooms 1..{S * (S + 1) // 2} "
      "with no gap and no clash")

# C17: the 10-room picture. Shifting a full 10-room hotel by one frees room 1 but
# sends guest 10 to a room that doesn't exist: still 10 rooms for 11 people.
ROOMS10 = range(1, 11)
moved = {g: g + 1 for g in ROOMS10}
housed = {g: r for g, r in moved.items() if r in ROOMS10}
assert moved[10] == 11 and 11 not in ROOMS10
assert set(housed.values()) == set(range(2, 11)) and len(housed) + 1 == 10
# Pigeonhole is stronger than the picture: however the guests of a full finite hotel
# swap rooms, one guest per room fills every room again, so no room frees up.
# Exhaustive over all assignments for hotels of 1..6 rooms.
for n in range(1, 7):
    for a in itertools.product(range(n), repeat=n):
        if len(set(a)) == n:
            assert set(a) == set(range(n))
print("C17 10 rooms shifted: guest 10 -> room 11 (none), rooms 2..10 full, room 1 free; "
      "hotels of 1..6 rooms: every one-per-room reshuffle refills every room")

# C18: natural density. Among 1..n the evens are n//2 (share -> 1/2) and the squares
# isqrt(n) (share -> 0), although both pair off with all of 1, 2, 3, ... (C7, C8).
for n in (10, 1_000, 1_000_000):
    assert sum(1 for m in range(1, n + 1) if m % 2 == 0) == n // 2 == n / 2
assert [math.isqrt(n) / n for n in (100, 10_000, 1_000_000)] == [0.1, 0.01, 0.001]
print("C18 evens in 1..n: n/2 (n = 10, 1000, 10^6); squares: 1/10, 1/100, 1/1000 of 10^2, 10^4, 10^6")
