"""Computational checks for the claims in research.md. Run: python3 verify.py

Every number research.md states is asserted at the precision it is written.
Data, copied from CVRL [S2]: the Stockman & Sharpe (2000) 2-deg cone
fundamentals [S1] (= CIE 2006 LMS), linear energy units, 5 nm, each cone
peaking at 1 (the S column is blank above 615 nm and read as 0); and the
CIE 1931 2-deg colour-matching functions [S5], every 5 nm from 380 to 780 nm.
The storyboard can draw the curves from the same tables.
"""
import math

CONES = """
390 4.15003E-04 3.68349E-04 9.54729E-03
395 1.05192E-03 9.58658E-04 2.38250E-02
400 2.40836E-03 2.26991E-03 5.66498E-02
405 4.83339E-03 4.70010E-03 1.22451E-01
410 8.72127E-03 8.79369E-03 2.33008E-01
415 1.33837E-02 1.45277E-02 3.81363E-01
420 1.84480E-02 2.16649E-02 5.43618E-01
425 2.29317E-02 2.95714E-02 6.74474E-01
430 2.81877E-02 3.94566E-02 8.02555E-01
435 3.41054E-02 5.18199E-02 9.03573E-01
440 4.02563E-02 6.47782E-02 9.91020E-01
445 4.49380E-02 7.58812E-02 9.91515E-01
450 4.98639E-02 8.70524E-02 9.55393E-01
455 5.53418E-02 9.81934E-02 8.60240E-01
460 6.47164E-02 1.16272E-01 7.86704E-01
465 8.06894E-02 1.44541E-01 7.38268E-01
470 9.94755E-02 1.75893E-01 6.46359E-01
475 1.18802E-01 2.05398E-01 5.16411E-01
480 1.40145E-01 2.35754E-01 3.90333E-01
485 1.63952E-01 2.68063E-01 2.90322E-01
490 1.91556E-01 3.03630E-01 2.11867E-01
495 2.32926E-01 3.57061E-01 1.60526E-01
500 2.88959E-01 4.27764E-01 1.22839E-01
505 3.59716E-01 5.15587E-01 8.88965E-02
510 4.43683E-01 6.15520E-01 6.08210E-02
515 5.36494E-01 7.19154E-01 4.28123E-02
520 6.28561E-01 8.16610E-01 2.92033E-02
525 7.04720E-01 8.85550E-01 1.93912E-02
530 7.70630E-01 9.35687E-01 1.26013E-02
535 8.25711E-01 9.68858E-01 8.09453E-03
540 8.81011E-01 9.95217E-01 5.08900E-03
545 9.19067E-01 9.97193E-01 3.16893E-03
550 9.40198E-01 9.77193E-01 1.95896E-03
555 9.65733E-01 9.56583E-01 1.20277E-03
560 9.81445E-01 9.17750E-01 7.40174E-04
565 9.94486E-01 8.73205E-01 4.55979E-04
570 9.99993E-01 8.13509E-01 2.81800E-04
575 9.92310E-01 7.40291E-01 1.75039E-04
580 9.69429E-01 6.53274E-01 1.09454E-04
585 9.55602E-01 5.72597E-01 6.89991E-05
590 9.27673E-01 4.92599E-01 4.39024E-05
595 8.85969E-01 4.11246E-01 2.82228E-05
600 8.33982E-01 3.34429E-01 1.83459E-05
605 7.75103E-01 2.64872E-01 1.20667E-05
610 7.05713E-01 2.05273E-01 8.03488E-06
615 6.30773E-01 1.56243E-01 5.41843E-06
620 5.54224E-01 1.16641E-01 0
625 4.79941E-01 8.55872E-02 0
630 4.00711E-01 6.21120E-02 0
635 3.27864E-01 4.44879E-02 0
640 2.65784E-01 3.14282E-02 0
645 2.13284E-01 2.18037E-02 0
650 1.65141E-01 1.54480E-02 0
655 1.24749E-01 1.07120E-02 0
660 9.30085E-02 7.30255E-03 0
665 6.85100E-02 4.97179E-03 0
670 4.98661E-02 3.43667E-03 0
675 3.58233E-02 2.37617E-03 0
680 2.53790E-02 1.63734E-03 0
685 1.77201E-02 1.12128E-03 0
690 1.21701E-02 7.61051E-04 0
695 8.47170E-03 5.25457E-04 0
700 5.89749E-03 3.65317E-04 0
705 4.09129E-03 2.53417E-04 0
710 2.80447E-03 1.74402E-04 0
715 1.92058E-03 1.20608E-04 0
720 1.32687E-03 8.41716E-05 0
725 9.17777E-04 5.89349E-05 0
730 6.39373E-04 4.16049E-05 0
735 4.46035E-04 2.94354E-05 0
740 3.10869E-04 2.08860E-05 0
745 2.19329E-04 1.50458E-05 0
750 1.54549E-04 1.08200E-05 0
755 1.09508E-04 7.82271E-06 0
760 7.79912E-05 5.69093E-06 0
765 5.56264E-05 4.13998E-06 0
770 3.99295E-05 3.02683E-06 0
775 2.86163E-05 2.21100E-06 0
780 2.07321E-05 1.63433E-06 0
785 1.50432E-05 1.21054E-06 0
790 1.09446E-05 8.99170E-07 0
795 7.97750E-06 6.69594E-07 0
800 5.85057E-06 5.03187E-07 0
805 4.31102E-06 3.80046E-07 0
810 3.17009E-06 2.86329E-07 0
815 2.34468E-06 2.16878E-07 0
820 1.74666E-06 1.65158E-07 0
825 1.30241E-06 1.25508E-07 0
830 9.74306E-07 9.53411E-08 0
"""
CIE1931 = """
380 0.001368000000 0.000039000000 0.006450001000
385 0.002236000000 0.000064000000 0.010549990000
390 0.004243000000 0.000120000000 0.020050010000
395 0.007650000000 0.000217000000 0.036210000000
400 0.014310000000 0.000396000000 0.067850010000
405 0.023190000000 0.000640000000 0.110200000000
410 0.043510000000 0.001210000000 0.207400000000
415 0.077630000000 0.002180000000 0.371300000000
420 0.134380000000 0.004000000000 0.645600000000
425 0.214770000000 0.007300000000 1.039050100000
430 0.283900000000 0.011600000000 1.385600000000
435 0.328500000000 0.016840000000 1.622960000000
440 0.348280000000 0.023000000000 1.747060000000
445 0.348060000000 0.029800000000 1.782600000000
450 0.336200000000 0.038000000000 1.772110000000
455 0.318700000000 0.048000000000 1.744100000000
460 0.290800000000 0.060000000000 1.669200000000
465 0.251100000000 0.073900000000 1.528100000000
470 0.195360000000 0.090980000000 1.287640000000
475 0.142100000000 0.112600000000 1.041900000000
480 0.095640000000 0.139020000000 0.812950100000
485 0.057950010000 0.169300000000 0.616200000000
490 0.032010000000 0.208020000000 0.465180000000
495 0.014700000000 0.258600000000 0.353300000000
500 0.004900000000 0.323000000000 0.272000000000
505 0.002400000000 0.407300000000 0.212300000000
510 0.009300000000 0.503000000000 0.158200000000
515 0.029100000000 0.608200000000 0.111700000000
520 0.063270000000 0.710000000000 0.078249990000
525 0.109600000000 0.793200000000 0.057250010000
530 0.165500000000 0.862000000000 0.042160000000
535 0.225749900000 0.914850100000 0.029840000000
540 0.290400000000 0.954000000000 0.020300000000
545 0.359700000000 0.980300000000 0.013400000000
550 0.433449900000 0.994950100000 0.008749999000
555 0.512050100000 1.000000000000 0.005749999000
560 0.594500000000 0.995000000000 0.003900000000
565 0.678400000000 0.978600000000 0.002749999000
570 0.762100000000 0.952000000000 0.002100000000
575 0.842500000000 0.915400000000 0.001800000000
580 0.916300000000 0.870000000000 0.001650001000
585 0.978600000000 0.816300000000 0.001400000000
590 1.026300000000 0.757000000000 0.001100000000
595 1.056700000000 0.694900000000 0.001000000000
600 1.062200000000 0.631000000000 0.000800000000
605 1.045600000000 0.566800000000 0.000600000000
610 1.002600000000 0.503000000000 0.000340000000
615 0.938400000000 0.441200000000 0.000240000000
620 0.854449900000 0.381000000000 0.000190000000
625 0.751400000000 0.321000000000 0.000100000000
630 0.642400000000 0.265000000000 0.000049999990
635 0.541900000000 0.217000000000 0.000030000000
640 0.447900000000 0.175000000000 0.000020000000
645 0.360800000000 0.138200000000 0.000010000000
650 0.283500000000 0.107000000000 0.000000000000
655 0.218700000000 0.081600000000 0.000000000000
660 0.164900000000 0.061000000000 0.000000000000
665 0.121200000000 0.044580000000 0.000000000000
670 0.087400000000 0.032000000000 0.000000000000
675 0.063600000000 0.023200000000 0.000000000000
680 0.046770000000 0.017000000000 0.000000000000
685 0.032900000000 0.011920000000 0.000000000000
690 0.022700000000 0.008210000000 0.000000000000
695 0.015840000000 0.005723000000 0.000000000000
700 0.011359160000 0.004102000000 0.000000000000
705 0.008110916000 0.002929000000 0.000000000000
710 0.005790346000 0.002091000000 0.000000000000
715 0.004109457000 0.001484000000 0.000000000000
720 0.002899327000 0.001047000000 0.000000000000
725 0.002049190000 0.000740000000 0.000000000000
730 0.001439971000 0.000520000000 0.000000000000
735 0.000999949300 0.000361100000 0.000000000000
740 0.000690078600 0.000249200000 0.000000000000
745 0.000476021300 0.000171900000 0.000000000000
750 0.000332301100 0.000120000000 0.000000000000
755 0.000234826100 0.000084800000 0.000000000000
760 0.000166150500 0.000060000000 0.000000000000
765 0.000117413000 0.000042400000 0.000000000000
770 0.000083075270 0.000030000000 0.000000000000
775 0.000058706520 0.000021200000 0.000000000000
780 0.000041509940 0.000014990000 0.000000000000
"""


def table(text):
    return {int(w): tuple(map(float, v)) for w, *v in (l.split() for l in text.strip().splitlines())}


LMS = table(CONES)      # wavelength -> (L, M, S), each cone's own peak = 1
XYZ = table(CIE1931)    # wavelength -> (x̄, ȳ, z̄)
W = sorted(LMS)
assert (W[0], W[-1], len(W)) == (390, 830, 89)


def mix(lights, t=LMS):
    """Response to several monochromatic lights at once: [(nm, power), ...]."""
    return [sum(p * t[w][i] for w, p in lights) for i in range(3)]


def bars(v):
    """The three bars as the video draws them: each cone's response, scaled so the tallest is 1."""
    top = max(v)
    return [x / top for x in v]


# C1: peaks. The table is in energy units; per photon (quantal) it is energy / λ.
energy = {c: max(W, key=lambda w: LMS[w][i]) for i, c in enumerate("LMS")}
quanta = {c: max(W, key=lambda w: LMS[w][i] / w) for i, c in enumerate("LMS")}
# 1 nm CVRL tables: energy 570 / 543 / 442 nm, quantal 566 / 541 / 441 nm.
PEAKS = {"L": (570, 566), "M": (543, 541), "S": (442, 441)}
for c, (e, q) in PEAKS.items():
    assert abs(energy[c] - e) <= 3 and abs(quanta[c] - q) <= 3
    assert round(e, -1) == round(q, -1)
# energy vs per-photon peaks differ by 1-4 nm; L and M peaks are 25-30 nm apart.
assert sorted(e - q for e, q in PEAKS.values()) == [1, 2, 4]
assert (PEAKS["L"][0] - PEAKS["M"][0], PEAKS["L"][1] - PEAKS["M"][1]) == (27, 25)
print(f"C1 peaks (5 nm grid): energy {energy}, per photon {quanta} -> about S 440, M 540, L 570 nm")

# C3: the curves overlap. Green-yellow light drives L and M almost equally;
# red light still drives M; S is near zero from green onward.
L550, M550, S550 = LMS[550]
assert round(L550, 2) == 0.94 and round(M550, 2) == 0.98 and S550 < 0.003
ratio = {w: LMS[w][1] / LMS[w][0] for w in (620, 650, 700)}
assert (round(ratio[620], 2), round(ratio[650], 2), round(ratio[700], 2)) == (0.21, 0.09, 0.06)
assert all(LMS[w][1] > 0 for w in W)
assert max(LMS[w][2] for w in W if w >= 550) < 0.003
print(f"C3 550 nm: L ≈ {L550:.2f}, M ≈ {M550:.2f}; M/L at 620, 650, 700 nm ≈ "
      f"{ratio[620]:.2f}, {ratio[650]:.2f}, {ratio[700]:.2f}; S < 0.003 from 550 nm")

# C4: sliding from red to violet, the tallest bar goes L -> M -> S
# (each cone scaled to its own peak; another scaling moves the borders).
tallest = {w: "LMS"[max(range(3), key=lambda i: LMS[w][i])] for w in W if w <= 700}
runs = []
for w in sorted(tallest, reverse=True):
    if not runs or runs[-1][0] != tallest[w]:
        runs.append([tallest[w], w, w])
    runs[-1][2] = w
assert [(c, lo) for c, hi, lo in runs] == [("L", 555), ("M", 490), ("S", 390)]
print("C4 tallest bar from 700 nm down: " + ", ".join(f"{c} {hi}-{lo} nm" for c, hi, lo in runs))

# C5: no single wavelength gives "L and S high, M low". M is the shortest bar
# only at the violet edge, where L is under 5% of S (and every bar is tiny).
m_lowest = [w for w in W if LMS[w][1] < min(LMS[w][0], LMS[w][2])]
assert m_lowest == [390, 395, 400, 405]
edge = max(min(LMS[w][0], LMS[w][2]) / max(LMS[w]) for w in m_lowest)
assert edge < 0.045 and round(100 * edge, 1) == 4.4
assert max(max(LMS[w][0], LMS[w][1]) for w in m_lowest) < 0.005
assert not any(b[1] < min(b[0], b[2]) and min(b[0], b[2]) >= 0.05 for b in map(bars, LMS.values()))
print(f"C5 M is the shortest bar only at {m_lowest[0]}-{m_lowest[-1]} nm, where L ≤ {edge:.1%} of S")

# sRGB from its definition [S6]: BT.709 primaries and D65 white in CIE 1931 xy.
PRIMARIES = ((0.64, 0.33), (0.30, 0.60), (0.15, 0.06))
WHITE = (0.3127, 0.3290)


def solve(m, v):
    """Cramer's rule for a 3x3 system m·x = v."""
    def det(a):
        return (a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
                - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
                + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]))
    d = det(m)
    return [det([[v[r] if c == k else m[r][c] for c in range(3)] for r in range(3)]) / d for k in range(3)]


def xyz_of(xy):
    x, y = xy
    return [x / y, 1.0, (1 - x - y) / y]


cols = [xyz_of(p) for p in PRIMARIES]
gain = solve([[cols[c][r] for c in range(3)] for r in range(3)], xyz_of(WHITE))
RGB2XYZ = [[cols[c][r] * gain[c] for c in range(3)] for r in range(3)]


def to_rgb(xyz):
    """Linear sRGB; a negative channel means the colour is outside what sRGB can show."""
    return solve(RGB2XYZ, xyz)


def to_xyz(rgb):
    return [sum(RGB2XYZ[r][c] * rgb[c] for c in range(3)) for r in range(3)]


def hue(rgb):
    """HSV hue angle in degrees (sRGB magenta #ff00ff = 300)."""
    r, g, b = rgb
    hi, lo = max(rgb), min(rgb)
    if hi == r:
        h = (g - b) / (hi - lo) % 6
    elif hi == g:
        h = (b - r) / (hi - lo) + 2
    else:
        h = (r - g) / (hi - lo) + 4
    return 60 * h


assert hue([1, 0, 1]) == 300

# C6: red + blue light that looks magenta. Find the blue power that puts the
# 630 nm + 450 nm mixture at magenta's hue (CIE 1931 -> sRGB [S5][S6]), then
# read its bars (cone fundamentals [S1]; a different standard observer, close
# enough for a hue).
RED, BLUE = 630, 450


def blue_for_hue(red, blue, target=300):
    lo, hi = 1e-3, 1e3
    for _ in range(100):
        k = math.sqrt(lo * hi)
        h = hue(to_rgb(mix([(red, 1), (blue, k)], XYZ)))
        lo, hi = (k, hi) if (h if h > 180 else h + 360) > target else (lo, k)
    return k


k = blue_for_hue(RED, BLUE)
magenta = [(RED, 1), (BLUE, k)]
assert round(hue(to_rgb(mix(magenta, XYZ)))) == 300 and round(k, 2) == 0.97
mb = bars(mix(magenta))
assert [round(x, 2) for x in mb] == [0.48, 0.16, 1.00] and mb[1] < min(mb[0], mb[2])
print(f"C6 {RED} nm + {BLUE} nm (power 1 : {k:.2f}) looks magenta; bars L {mb[0]:.2f}, M {mb[1]:.2f}, S {mb[2]:.2f}")

# The single wavelength that drives L and S in the same balance as the mixture.
# L/S rises steadily from 445 nm to 615 nm; below 445 nm it stays under 0.05.
band = [w for w in W if 445 <= w <= 615]
assert all(LMS[b][0] / LMS[b][2] > LMS[a][0] / LMS[a][2] for a, b in zip(band, band[1:]))
assert max(LMS[w][0] / LMS[w][2] for w in W if w < 445) < 0.05


def same_balance(ls):
    """(wavelength, its L, M, S) where a single wavelength has L/S = ls (linear between 5 nm rows)."""
    for a, b in zip(band, band[1:]):
        ra, rb = (LMS[w][0] / LMS[w][2] for w in (a, b))
        if ra <= ls <= rb:
            (La, _, Sa), (Lb, _, Sb) = LMS[a], LMS[b]
            t = (ls * Sa - La) / ((Lb - La) - ls * (Sb - Sa))
            return a + 5 * t, [(1 - t) * LMS[a][i] + t * LMS[b][i] for i in range(3)]


mL, mM, mS = mix(magenta)
w_star, (sL, sM, sS) = same_balance(mL / mS)
assert round(w_star) == 483 and round(sM / sS, 1) == 0.8 and round(mM / mS, 2) == 0.16
assert round((sM / sS) / (mM / mS)) == 5
print(f"C6 a single {w_star:.0f} nm light has the same L:S balance but M/S ≈ {sM / sS:.2f} "
      f"vs {mM / mS:.2f} in the mixture (≈ {(sM / sS) / (mM / mS):.0f}x)")

# Other red + blue pairs mixed to magenta's hue: the same picture.
pairs = []
for red in range(600, 701, 10):
    for blue in range(440, 461, 5):
        p = [(red, 1), (blue, blue_for_hue(red, blue))]
        L, M, S = mix(p)
        w, (wL, wM, wS) = same_balance(L / S)
        pairs.append((w, (wM / wS) / (M / S), bars(mix(p))))
assert all(b[1] < min(b[0], b[2]) for _, _, b in pairs)
assert round(min(w for w, _, _ in pairs)) == 480 and round(max(w for w, _, _ in pairs)) == 489
assert round(min(r for _, r, _ in pairs)) == 3 and round(max(r for _, r, _ in pairs)) == 7
print(f"C6 {len(pairs)} red (600-700 nm) + blue (440-460 nm) pairs at magenta's hue: M always lowest; "
      f"same-L:S wavelength {min(w for w, _, _ in pairs):.0f}-{max(w for w, _, _ in pairs):.0f} nm, "
      f"M about {min(r for _, r, _ in pairs):.0f}-{max(r for _, r, _ in pairs):.0f}x")

# Every red (600-700 nm) + blue (400-465 nm) mixture, at powers 1 : 0.001..1000,
# whose L is at least 5% of its S: the mixture always has less M (relative to S)
# than the single wavelength with the same L:S balance, so no single wavelength
# matches it. It compares ratios, so it holds however the bars are scaled. (The
# ratio nears 1 only when the mixture is almost all one of its two lights.)
# Mixtures with less L than that are nearly pure blue; they fall in the violet
# end's hook, where L/S turns back, the data are least certain [S1], and this
# comparison doesn't apply, so they are left out.
worst, checked = 0, 0
for red in range(600, 701, 5):
    for blue in range(400, 466, 5):
        for e in range(-30, 31):
            L, M, S = mix([(red, 1), (blue, 10 ** (e / 10))])
            if L / S >= 0.05:
                _, (wL, wM, wS) = same_balance(L / S)
                worst, checked = max(worst, (M / S) / (wM / wS)), checked + 1
assert worst < 1 and checked == 14472
print(f"C6 {checked} red+blue mixtures with L ≥ 5% of S: mixture M/S < single-wavelength M/S "
      f"(max ratio {worst:.4f})")

# C20: an eye without M cones compares only L and S. Turned up to the same L,
# the ~483 nm light also gives the same S as the magenta mixture, so for that
# eye the two lights are the same colour; with M they differ about 5x in M.
p = mL / sL
assert math.isclose(p * sS, mS) and round(p, 2) == 2.88 and round(p * sM / mM) == 5
print(f"C20 without M: the mixture = {w_star:.0f} nm light at {p:.2f}x power (same L and S); M differs {p * sM / mM:.0f}x")

# C8: dominant wavelength (CIE 1931, white D65 [S4][S6]). A colour has one when the
# line from white through it meets the spectrum locus; purples meet the purple
# boundary instead and get a complementary wavelength (the opposite direction).
LOCUS = [(w, (lambda s: (XYZ[w][0] / s, XYZ[w][1] / s))(sum(XYZ[w]))) for w in sorted(XYZ)]


def cross(p, d, a, b):
    ex, ey = b[0] - a[0], b[1] - a[1]
    den = d[1] * ex - d[0] * ey
    if den == 0:
        return None
    rx, ry = a[0] - p[0], a[1] - p[1]
    t, u = (ry * ex - rx * ey) / den, (ry * d[0] - rx * d[1]) / den
    return u if t > 0 and 0 <= u <= 1 else None


def dominant(rgb):
    X = to_xyz(rgb)
    c = (X[0] / sum(X), X[1] / sum(X))
    d = (c[0] - WHITE[0], c[1] - WHITE[1])
    for sign in (1, -1):
        dd = (sign * d[0], sign * d[1])
        for (w0, a), (w1, b) in zip(LOCUS, LOCUS[1:]):
            u = cross(WHITE, dd, a, b)
            if u is not None:
                return ("dominant" if sign == 1 else "complementary"), w0 + u * (w1 - w0)


dom = {name: dominant(rgb) for name, rgb in (
    ("red", (1, 0, 0)), ("green", (0, 1, 0)), ("blue", (0, 0, 1)),
    ("yellow", (1, 1, 0)), ("cyan", (0, 1, 1)), ("magenta", (1, 0, 1)))}
for name, (kind, w) in dom.items():
    print(f"C8 sRGB {name:<7} {kind} wavelength ≈ {w:.0f} nm")
assert all(dom[n][0] == "dominant" for n in ("red", "green", "blue", "yellow", "cyan"))
assert dom["magenta"][0] == "complementary"
assert [round(dom[n][1]) for n in ("yellow", "red", "green", "blue", "cyan", "magenta")] == [570, 611, 549, 464, 491, 549]

# C10: screen magenta is full red + full blue, green off [S7]; it sits on the
# far side of white from green, so green is its complementary wavelength (C8).
assert math.isclose(dom["magenta"][1], dom["green"][1])

# C17: no single wavelength fits inside sRGB, so an on-screen rainbow is an
# approximation. Toward violet (below about 461 nm) the closest screen colour
# has red light in it next to blue.
visible = [w for w in sorted(XYZ) if 390 <= w <= 700]
assert all(min(to_rgb(XYZ[w])) < 0 for w in visible)
reddish = [w for w in visible if to_rgb(XYZ[w])[0] > 0 and w < 500]
assert reddish == list(range(390, 461, 5))
r460, r465 = to_rgb(XYZ[460])[0], to_rgb(XYZ[465])[0]
edge_nm = 460 + 5 * r460 / (r460 - r465)
assert round(edge_nm) == 461
assert min(to_rgb(to_xyz([1, 0, 1]))) >= -1e-12
print(f"C17 every 5 nm step 390-700 nm is outside sRGB; red channel > 0 below ≈ {edge_nm:.0f} nm")

# C18: painting the L, M, S bars red, green, blue and adding them does not give
# the light's colour; the conversion goes through CIE 1931 XYZ -> sRGB.
off = {}
for w in (450, 480, 500, 550, 580, 650):
    naive, proper = hue(LMS[w]), hue(to_rgb(XYZ[w]))
    off[w] = (naive - proper + 180) % 360 - 180
    print(f"C18 {w} nm: bars as RGB hue ≈ {naive:.0f}°, real hue ≈ {proper:.0f}° (off by {off[w]:+.0f}°)")
assert [(round(hue(LMS[w])), round(hue(to_rgb(XYZ[w])))) for w in off] == [
    (238, 250), (217, 213), (87, 161), (62, 119), (40, 30), (6, 355)]
assert round(off[500]) == -74 and round(off[550]) == -56

# C19: equal-energy white in the same bars is not three equal bars.
white = bars([sum(LMS[w][i] for w in W) for i in range(3)])
assert [round(x, 2) for x in white] == [1.00, 0.82, 0.50]
print(f"C19 equal-energy white: bars L {white[0]:.2f}, M {white[1]:.2f}, S {white[2]:.2f}")

# C16: at the violet end L barely responds and no more than M does. L/M climbs
# back from its low near 460 nm, but stays below white's L/M, i.e. still on
# M's side of white, so "L responding there" cannot by itself make violet reddish.
lm = {w: LMS[w][0] / LMS[w][1] for w in W if w <= 470}
low = min(lm, key=lm.get)
lm_white = white[0] / white[1]
assert low == 460 and round(lm[low], 2) == 0.56
assert round(100 * LMS[400][0], 2) == 0.24 and round(lm[400], 2) == 1.06
assert round(max(lm.values()), 2) == 1.13 and round(lm_white, 2) == 1.22
print(f"C16 L at 400 nm ≈ {100 * LMS[400][0]:.2f}% of its peak, L/M ≈ {lm[400]:.2f}; L/M low ≈ {lm[low]:.2f} "
      f"at {low} nm, at most {max(lm.values()):.2f} at 390-470 nm vs white's ≈ {lm_white:.2f}")
