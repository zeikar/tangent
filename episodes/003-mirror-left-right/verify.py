"""Computational checks for the claims in research.md. Run: python3 verify.py

Coordinates are the viewer's: x = the viewer's right, y = up, z = forward.
The viewer stands at z < 0 facing a wall mirror in the plane z = 0.
"""
import math
import random


def mat(*rows):
    return tuple(tuple(float(v) for v in r) for r in rows)


def diag(a, b, c):
    return mat((a, 0, 0), (0, b, 0), (0, 0, c))


def mul(a, b):
    return tuple(tuple(sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)) for i in range(3))


def apply(m, v):
    return tuple(sum(m[i][k] * v[k] for k in range(3)) for i in range(3))


def det(m):
    (a, b, c), (d, e, f), (g, h, i) = m
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)


def close(u, v, eps=1e-9):
    return all(abs(p - q) < eps for p, q in zip(u, v))


def same(a, b):
    return all(close(r, s) for r, s in zip(a, b))


def rot(axis, deg):
    """Rotation by `deg` about the x, y or z axis."""
    c, s = round(math.cos(math.radians(deg)), 12), round(math.sin(math.radians(deg)), 12)
    return {"x": mat((1, 0, 0), (0, c, -s), (0, s, c)),
            "y": mat((c, 0, s), (0, 1, 0), (-s, 0, c)),
            "z": mat((c, -s, 0), (s, c, 0), (0, 0, 1))}[axis]


def reflect(n):
    """Reflection in the plane through the origin with normal n: I - 2 n nᵀ."""
    k = math.sqrt(sum(x * x for x in n))
    n = [x / k for x in n]
    return tuple(tuple((i == j) - 2 * n[i] * n[j] for j in range(3)) for i in range(3))


def unit(v):
    k = math.sqrt(sum(x * x for x in v))
    return tuple(x / k for x in v)


def sub(u, v):
    return tuple(p - q for p, q in zip(u, v))


RIGHT, UP, FWD = (1, 0, 0), (0, 1, 0), (0, 0, 1)
FLIP_LR, FLIP_UD, FLIP_FB = diag(-1, 1, 1), diag(1, -1, 1), diag(1, 1, -1)
WALL = reflect(FWD)                              # the wall mirror, plane z = 0


# C1: the law of reflection alone puts the image of every point (x, y, z) at
# (x, y, -z). Light from P that reaches the eye E after bouncing at R (angle of
# incidence = angle of reflection) arrives along the line from (x, y, -z).
random.seed(3)
for _ in range(2000):
    P = (random.uniform(-2, 2), random.uniform(-2, 2), random.uniform(-3, -0.1))
    E = (random.uniform(-2, 2), random.uniform(-2, 2), random.uniform(-3, -0.1))
    img = apply(WALL, P)
    t = img[2] / (img[2] - E[2])                 # where the line img -> E meets z = 0
    R = tuple(i + t * (e - i) for i, e in zip(img, E))
    d_in, d_out = unit(sub(R, P)), unit(sub(E, R))
    bounced = tuple(a - 2 * d_in[2] * n for a, n in zip(d_in, FWD))
    assert abs(R[2]) < 1e-12 and close(bounced, d_out)
assert same(WALL, FLIP_FB)
# The three arrows of the key picture: up and right keep their direction, the
# arrow pointing into the mirror comes back out.
assert apply(WALL, RIGHT) == (1, 0, 0) and apply(WALL, UP) == (0, 1, 0)
assert apply(WALL, FWD) == (0, 0, -1)
print("C1 wall mirror: (x, y, z) -> (x, y, -z) from the law of reflection; "
      "right and up arrows unchanged, forward arrow reversed")

# C2: any mirror flips only the direction along its normal. Beside a mirror
# (normal along the shoulders) that is left-right; on the floor, up-down.
for n in [(1, 0, 0), (0, 1, 0), (0, 0, 1), (1, 2, -0.5), (0.3, -1, 0.7)]:
    m = reflect(n)
    assert close(apply(m, n), tuple(-x for x in n))
    for v in [(n[1], -n[0], 0), (0, n[2], -n[1]), (n[2], 0, -n[0])]:
        assert close(apply(m, v), v)             # directions along the surface stay
assert same(reflect(RIGHT), FLIP_LR) and same(reflect(UP), FLIP_UD)
print("C2 any plane mirror reverses only its normal: side-on -> left-right, "
      "floor -> up-down, facing -> front-back")

# C3: the image is the object's mirror twin (enantiomorph). Handedness is the sign
# of det[fingers, palm normal, thumb]; a palm-down right hand, fingers forward,
# has its thumb on the left, a left hand on the right.
right_hand = [FWD, (0, -1, 0), (-1, 0, 0)]
left_hand = [FWD, (0, -1, 0), (1, 0, 0)]


def handedness(frame):
    return math.copysign(1, det(tuple(zip(*frame))))


assert handedness(right_hand) == -handedness(left_hand)
assert handedness([apply(WALL, v) for v in right_hand]) == handedness(left_hand)
# Every rotation keeps handedness (det +1), every one-axis flip reverses it
# (det -1): no turning or moving makes the image coincide with the original.
gens = [rot("x", 90), rot("y", 90), rot("z", 90)]
group, frontier = {diag(1, 1, 1)}, [diag(1, 1, 1)]
while frontier:
    g = frontier.pop()
    for h in gens:
        k = tuple(tuple(round(x) for x in row) for row in mul(g, h))
        k = mat(*k)
        if k not in group:
            group.add(k)
            frontier.append(k)
assert len(group) == 24 and all(round(det(g)) == 1 for g in group)
assert all(round(det(f)) == -1 for f in (FLIP_LR, FLIP_UD, FLIP_FB))
assert not any(same(g, f) for g in group for f in (FLIP_LR, FLIP_UD, FLIP_FB))
for g in group:
    assert handedness([apply(g, v) for v in right_hand]) == handedness(right_hand)
# The three one-axis flips give the same shape, differing only by a rotation.
assert same(FLIP_LR, mul(rot("y", 180), FLIP_FB)) and same(FLIP_UD, mul(rot("x", 180), FLIP_FB))
print("C3 the mirrored right hand has a left hand's handedness; none of the 24 "
      "quarter-turn rotations undoes it; flipping any one axis gives the same shape")

# C4: what the comparison does. The image equals me turned half around a
# vertical axis and then flipped left-right; turned head over heels (about
# the left-right axis), it differs by an up-down flip; walked straight in, it
# differs front-back.
assert same(FLIP_FB, mul(rot("y", 180), FLIP_LR))
assert same(FLIP_FB, mul(rot("x", 180), FLIP_UD))
# The watch on my left wrist, as an offset from my body's centre (me at z = -1,
# my image at z = +1). The turned-around me would wear it on the opposite side
# from the image, so the image looks like someone wearing it on the right.
watch = (-0.3, 1.0, 0.0)
image_watch = apply(WALL, watch)
turned = apply(rot("y", 180), watch)
flipped_over = apply(rot("x", 180), watch)
assert image_watch == (-0.3, 1.0, 0.0) and close(turned, (0.3, 1.0, 0.0))
assert close(image_watch, apply(FLIP_LR, turned))      # only left-right differs
assert close(image_watch, apply(FLIP_UD, flipped_over))  # only up-down differs
print("C4 image = (turn about the vertical axis) then left-right flip "
      "= (turn head over heels) then up-down flip; watch: image x = "
      f"{image_watch[0]}, turned-around me x = {turned[0]:.1f}")

# C7: Takano & Tanaka ([S4]). 102 students (33 men, 69 women): 65.7% saw their
# own image left-right reversed, 33.3% did not; all saw the letters reversed.
assert 33 + 69 == 102
counts = {p: [n for n in range(103) if round(100 * n / 102, 1) == p] for p in (65.7, 33.3)}
assert counts == {65.7: [67], 33.3: [34]}
# Questionnaire: 583 students (321 + 249 + 13 unknown) made 598 choices.
assert 321 + 249 + 13 == 583 and 598 - 583 == 15
# The source doesn't say whether 46.5% and 43.1% are of the 598 choices or the
# 583 people; both give whole counts, and "nothing reversed" leads either way.
for base in (598, 583):
    fits = [[n for n in range(base + 1) if round(100 * n / base, 1) == p] for p in (46.5, 43.1)]
    assert all(len(f) == 1 for f in fits) and fits[0][0] > fits[1][0]
print(f"C7 {counts[65.7][0]}/102 = 65.7%, {counts[33.3][0]}/102 = 33.3% "
      "(one of 102 in neither); questionnaire shares fit whole counts of 598 or 583")

# C8: a floor mirror or a still lake (plane y = 0) reverses up-down only.
LAKE = reflect(UP)
peak, tree = (0, 1000, 5000), (500, 300, 5000)   # m: right of centre, up, ahead
assert apply(LAKE, peak) == (0, -1000, 5000) and apply(LAKE, tree) == (500, -300, 5000)
# A sheet held upright over a table mirror, letter facing the viewer: the
# image's letter is upside down and not left-right reversed.
assert all(apply(LAKE, (u, v, -1))[:2] == (u, -v) for u, v in [(1, 2), (-3, 5)])
print("C8 lake: the peak 1000 m up appears 1000 m down, the tree stays 500 m to the right")

# C10, C11: a letter on paper shown to the mirror. F on a grid, u = reading
# right, v = up. The paper starts at z = -0.5 facing the viewer; turning it
# half around an axis through its centre makes it face the mirror.
F = [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (1, 4), (2, 4), (1, 2)]


def shape(points):
    """Position-free form of a set of grid points."""
    u0, v0 = min(u for u, _ in points), min(v for _, v in points)
    return frozenset((round(u - u0), round(v - v0)) for u, v in points)


def seen_in_mirror(turn):
    """What the viewer sees of the letter's image; perspective from the eye
    only scales it, since the whole image lies at one depth."""
    placed = [apply(turn, (u, v, 0)) for u, v in F]
    return shape([apply(WALL, (x, y, z - 0.5))[:2] for x, y, z in placed])


flip_lr = shape([(-u, v) for u, v in F])
flip_ud = shape([(u, -v) for u, v in F])
turn_2d = [lambda u, v: (u, v), lambda u, v: (-v, u), lambda u, v: (-u, -v), lambda u, v: (v, -u)]
assert all(shape([r(u, v) for u, v in F]) != flip_lr for r in turn_2d)  # F is chiral in the plane
assert seen_in_mirror(rot("y", 180)) == flip_lr           # turned about the vertical axis
assert seen_in_mirror(rot("x", 180)) == flip_ud           # turned over, about the horizontal axis
assert seen_in_mirror(diag(1, 1, 1)) == shape(F)          # not turned (a transparent sheet)
# C11: the upside-down F is the backwards F turned half around in the page.
assert flip_ud == shape([(-u, -v) for u, v in flip_lr])
print("C10 paper turned about the vertical axis -> backwards F; about the horizontal "
      "axis -> upside-down F, left and right kept; not turned -> reads normally; "
      "C11 upside-down F = backwards F rotated 180° in the page")

# C12: Plato discussed it in the 4th century BC ([S8]): at least 2300 years ago.
assert 2026 + 300 > 2300 > 2000
print(f"C12 the 4th century BC ended {2026 + 300} years before 2026")

# C13: mirrored text on an ambulance's front reads normally in the rear-view
# mirror of the car ahead. Both vehicles face +z; someone facing the ambulance
# (facing -z) has their right at -x, so normal text runs toward -x and the
# mirrored text toward +x. The rear-view mirror (plane z = const) keeps x, and
# the driver (facing +z) reads toward +x, left to right.
REAR = reflect(FWD)
assert apply(REAR, (1, 0, 0))[0] == 1
print("C13 mirrored text runs toward +x; the rear-view mirror keeps x; the driver reads it left to right")

# C14: two mirrors meeting at a right angle, corner away from the viewer. Two
# reflections make a rotation (half a turn about the vertical axis): the image
# is me turned around, with my handedness, as others see me.
corner = mul(reflect((-1, 0, 1)), reflect((1, 0, 1)))
assert same(corner, rot("y", 180)) and round(det(corner)) == 1
assert handedness([apply(corner, v) for v in right_hand]) == handedness(right_hand)
assert close(apply(corner, watch), turned)
print("C14 mirror corner = half turn about the vertical axis (det +1): not reversed")
