"""Computational checks for the claims in research.md. Run: python3 verify.py

Every number research.md states is asserted at the precision it is written.
"""
import math

# [S1] Moon Fact Sheet, [S2] Earth Fact Sheet, [S9] table 1 (mean months).
SIDEREAL_MONTH = 27.321661        # d, [S9]; [S1] "Revolution period (days) 27.3217"
SYNODIC_MONTH = 29.530589         # d, [S9]; [S1] "Synodic period (days) 29.53"
ROTATION_HOURS = 655.720          # h, [S1] "Sidereal rotation period (hrs)"
SIDEREAL_YEAR = 365.256           # d, [S2] "Sidereal orbit period (days)"
R_MOON, A_MOON, R_EARTH = 1737.4, 384_400, 6371.0   # km, [S1] mean radii, semimajor axis

# C2: rotation and revolution take the same time with respect to the stars.
rot_days = ROTATION_HOURS / 24
assert round(rot_days, 4) == 27.3217 and abs(rot_days - SIDEREAL_MONTH) < 1e-4
assert round(SIDEREAL_MONTH, 1) == 27.3 and round(SIDEREAL_MONTH, 2) == 27.32
print(f"C2 rotation {ROTATION_HOURS} h = {rot_days:.4f} d; revolution {SIDEREAL_MONTH} d")

# C3: the phase cycle (and the Sun's return in the Moon's sky) is longer because
# the Earth-Moon pair moves around the Sun: 1/S = 1/P - 1/Y.
synodic = 1 / (1 / SIDEREAL_MONTH - 1 / SIDEREAL_YEAR)
assert abs(synodic - SYNODIC_MONTH) < 1e-3 and round(synodic, 2) == 29.53
assert round(SYNODIC_MONTH - SIDEREAL_MONTH, 1) == 2.2
print(f"C3 synodic from 1/P - 1/Y ≈ {synodic:.4f} d (table {SYNODIC_MONTH}); "
      f"longer by ≈ {SYNODIC_MONTH - SIDEREAL_MONTH:.1f} d")


# C1, C4, C5: a 2D model seen from above the orbit (the video's picture).
# Angles are longitudes on the Moon's equator in its own body frame, degrees.
# Circular orbit; at t = 0 the Moon is at 180° and the Sun at `sun0`
# (sun0 = 0: full moon, 180: new moon).
def sub_points(t, spin, sun0=0.0):
    """Sub-Earth and sub-solar longitude on the Moon at day t.

    spin = +1: rotates once per orbit in the orbit's direction (synchronous);
    0: never rotates (fixed toward the stars); -1: once per orbit, backwards.
    """
    orbit = 180 + 360 * t / SIDEREAL_MONTH      # Moon's position seen from Earth
    sun = sun0 + 360 * t / SIDEREAL_YEAR        # Sun's direction, from Earth or Moon
    turned = spin * (orbit - 180)               # how far the Moon has rotated
    return (orbit + 180 - turned) % 360, (sun - turned) % 360


def facing(t, spin):
    return sub_points(t, spin)[0]


steps = [SIDEREAL_MONTH * k / 1000 for k in range(1001)]
# C1: synchronous rotation keeps one point facing Earth all orbit long.
assert all(abs((facing(t, +1) - facing(0, +1) + 180) % 360 - 180) < 1e-9 for t in steps)
# C4: without rotation the Earth-facing point runs once around the Moon per
# orbit; half an orbit later the old far side faces Earth.
half = SIDEREAL_MONTH / 2
assert round((facing(half, 0) - facing(0, 0)) % 360, 6) == 180 and round(half, 1) == 13.7
unwrapped = sum((facing(b, 0) - facing(a, 0)) % 360 for a, b in zip(steps, steps[1:]))
assert round(unwrapped, 6) == 360
# Spinning against the orbit would turn the Earth-facing point twice per orbit.
unwrapped_back = sum((facing(b, -1) - facing(a, -1)) % 360 for a, b in zip(steps, steps[1:]))
assert round(unwrapped_back, 6) == 720
print(f"C1 synchronous: Earth-facing point fixed; C4 no rotation: it goes once around "
      f"per orbit, the far side faces Earth after ≈ {half:.1f} d (spinning backwards: twice)")


# C5: with sunlight. A point is seen lit when it faces Earth and the Sun at
# once: the overlap of two half-circles, an arc around their midpoint.
def mark_seen(seen, t, spin, sun0):
    e, s = sub_points(t, spin, sun0)
    d = (e - s + 180) % 360 - 180
    mid, half = s + d / 2, 90 - abs(d) / 2
    for k in range(math.ceil(mid - half - 0.5), math.floor(mid + half - 0.5) + 1):
        seen[k % 360] = True                    # 1° bins, centre k + 0.5 inside the arc


def seen_lit(days, spin, sun0, dt=0.05):
    """Share of the equator seen in sunlight at least once within `days`."""
    seen = [False] * 360
    for i in range(int(days / dt) + 1):
        mark_seen(seen, i * dt, spin, sun0)
    return sum(seen) / 360


def all_seen_by(spin, sun0, dt=0.05):
    """Day by which every point of the equator has been seen lit."""
    seen, t = [False] * 360, 0.0
    while not all(seen):
        mark_seen(seen, t, spin, sun0)
        t += dt
    return t


starts = range(0, 360, 15)                      # the month's starting phase
sync_year = seen_lit(SIDEREAL_YEAR, +1, 0, dt=0.5)
month = [seen_lit(SYNODIC_MONTH, 0, s0) for s0 in starts]
full_days = [all_seen_by(0, s0) for s0 in starts]
assert sync_year == 0.5
assert (round(100 * min(month)), round(100 * max(month))) == (54, 58)
MONTH = SIDEREAL_YEAR / 12
assert 6 * MONTH - 1 < min(full_days) and max(full_days) < 7 * MONTH
# Successive full moons show a face turned by the Sun's drift over a synodic month.
shift = 360 * SYNODIC_MONTH / SIDEREAL_YEAR
assert round(shift) == 29 and round(180 / shift, 1) == 6.2
# Without rotation the Sun circles the Moon's sky once a year (its "day" is a year).
assert round((sub_points(SIDEREAL_YEAR, 0)[1] - sub_points(0, 0)[1] + 180) % 360 - 180, 6) == 0
print(f"C5 seen in sunlight, synchronous: {100 * sync_year:.0f}% (ever); no rotation: "
      f"{100 * min(month):.0f}-{100 * max(month):.0f}% in one synodic month, everything by day "
      f"{min(full_days):.0f}-{max(full_days):.0f} ({min(full_days) / MONTH:.1f}-"
      f"{max(full_days) / MONTH:.1f} months), by start phase; full-moon face turns ≈ {shift:.1f}° a month")

# C6: libration amplitudes [S13] 7°54′ and 6°50′; the 6.7° axis tilt [S13] is
# the 5.15° orbit inclination plus the 1.54° equator tilt; [S1] gives 6.68°.
lon_amp, lat_amp = 7 + 54 / 60, 6 + 50 / 60
assert (round(lon_amp, 1), round(lat_amp, 1)) == (7.9, 6.8)
assert abs(5.145 + 1.5427 - 6.68) < 0.01
# The eccentricity's main term alone, 2e ([S1] e = 0.0549), falls short of 7.9°.
assert round(math.degrees(2 * 0.0549), 1) == 6.3
print(f"C6 libration up to ≈ {lon_amp:.1f}° (longitude), ≈ {lat_amp:.1f}° (latitude)")

# C7: ~59% seen over time. [S14]: 18% of the far side is sometimes seen.
assert 50 + 0.18 * 50 == 59
# Model check: a surface point is ever seen if it lies within the visible cap
# (half-angle acos(R/d), just under 90°) of some sub-Earth point inside the
# libration box ±7.9° x ±6.8°, widened by diurnal libration (asin(R_E/d) < 1°).
cap = math.degrees(math.acos(R_MOON / A_MOON))
diurnal = math.degrees(math.asin(R_EARTH / A_MOON))
assert round(diurnal, 2) == 0.95 and diurnal < 1


def ever_seen(extra=0.0, step=0.25):
    """Seen share of the sphere; integrates one quadrant (the box is symmetric)."""
    cos_cap = math.cos(math.radians(cap + extra))
    lat_b = math.radians(lat_amp)
    seen = total = 0.0
    for i in range(int(90 / step)):
        phi = math.radians((i + 0.5) * step)
        a, w = math.sin(phi), math.cos(phi)
        for j in range(int(180 / step)):
            # Nearest box longitude first, then the best latitude in [-B, B].
            c = w * math.cos(math.radians(max(0.0, (j + 0.5) * step - lon_amp)))
            b = max(-lat_b, min(lat_b, math.atan2(a, c)))
            best = max(a * math.sin(x) + c * math.cos(x) for x in (b, lat_b, -lat_b))
            total += w
            seen += w if best > cos_cap else 0.0
    return seen / total


# The box is an upper bound (its corners need both wobbles at their peaks at
# once), so the model only has to land near 59%, not on it.
box, box_diurnal = ever_seen(), ever_seen(diurnal)
assert round(100 * box, 1) == 57.9 and round(100 * box_diurnal, 1) == 58.7
assert 57 < 100 * box < 100 * box_diurnal < 60
# The two wobbles realign every beat of the anomalistic and draconic months
# ([S9] table 1): about six years, so the full 59% takes years to collect.
beat = 1 / (1 / 27.21222 - 1 / 27.554551) / SIDEREAL_YEAR
assert round(beat) == 6
print(f"C7 50% + 18% of the far side = 59%; libration box ≈ {100 * box:.1f}%, "
      f"with diurnal ≈ {100 * box_diurnal:.1f}% (at one moment ≈ {50 * (1 - R_MOON / A_MOON):.1f}%); "
      f"wobbles realign every ≈ {beat:.1f} yr")

# C8: any spot on the Moon has about two weeks of day, then two of night.
assert round(SYNODIC_MONTH / 2, 1) == 14.8
print(f"C8 half a lunar day ≈ {SYNODIC_MONTH / 2:.1f} d")

# C14: recession 38.30 mm/yr [S10] = 3.8 cm/yr [S1, S11] = 1.5 in [S11].
rate_cm = 38.30 / 10
assert round(rate_cm, 1) == 3.8 and round(1.5 * 2.54, 1) == 3.8 and round(rate_cm) == 4
per_century_m = rate_cm * 100 / 100
assert round(per_century_m, 1) == 3.8
assert round(38.30 / 12, 1) == 3.2                   # mm per month ([S11]: "0.1 inches (3 mm)")
since_apollo = rate_cm * (2026 - 1969) / 100
assert round(since_apollo, 1) == 2.2
# [S5]'s "about an inch" (2.54 cm) is well off the measured value; not used.
assert abs(2.54 - rate_cm) > 1
print(f"C14 {rate_cm:.2f} cm/yr ≈ 3.8 cm; per century ≈ {per_century_m:.1f} m; "
      f"per month ≈ {38.30 / 12:.1f} mm; since Apollo 11 (1969) ≈ {since_apollo:.1f} m")

# C15: length of day. [S12] eq. (1.3): tidal spin-down -6.16e-22 rad/s²;
# dLOD/dt = LOD² / (2π) · |dω/dt|, per Julian century.
LOD, CENTURY = 86400.0, 36525 * 86400.0


def lod_rate(omega_dot):
    return LOD ** 2 / (2 * math.pi) * -omega_dot * CENTURY * 1000   # ms per century


tidal = lod_rate(-6.16e-22)
assert round(tidal, 1) == 2.3                      # [S12] +2.3; [S10] 2.39, 2.395
# Adding the non-tidal +1.5 ± 0.4 (×1e-22 rad/s²) [S12] gives the observed rate.
observed = lod_rate(-6.16e-22 + 1.5e-22)
assert abs(observed - 1.78) < lod_rate(-0.4e-22) and round(1.78, 1) == 1.8
assert round(1.8 / 100 * 1000) == 18                # µs per year
print(f"C15 tidal ≈ {tidal:.2f} ms/century; with the non-tidal part ≈ {observed:.2f} "
      f"(observed +1.78); 1.8 ms/century ≈ {1.8 / 100 * 1000:.0f} µs/yr")
