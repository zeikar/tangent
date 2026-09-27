# Topics

Ideas for the next episode. The topic agent
([tangent-topic](../.claude/agents/tangent-topic.md)) adds them and the human
picks one; a picked idea becomes `episodes/<slug>/topic.md`. Earlier rounds
of candidates are in git history (up to d4a76eb).

Made so far: 001 A4 paper ([episodes/001-a4-paper-ratio](../episodes/001-a4-paper-ratio/topic.md)).

## The human's taste

In the human's words where they gave them.

- **Less formulaic.** "뭔가 자꾸 틀에박힌? 아이디어 나오는거 같아서 ㅋㅋ
  에이전트에게 자유를 더 주고싶어" ("the ideas keep coming out kind of
  formulaic; I want to give the agent more freedom") (2026-09-26), after
  several rounds of mostly "why does everyday X do Y" candidates.
- **Not only everyday phenomena.** "실제현상이군. 꼭 안그래도 되니까 더
  뽑아보자. 수학 과학 공학" ("These are real-world phenomena. They don't have
  to be, so let's pick more: math, science, engineering") (2026-09-26). Pure
  math, any science, and engineering are all fine.
- **Common is fine; dull isn't.** "a4 엄청 흔하지 않아? 그냥 흔한것도
  올릴까?" ("Isn't A4 super common? Should I just post common ones too?")
  (2026-09-26). Most Shorts viewers come from the feed and haven't seen the
  existing explanations. The topics below were rejected because the human
  already knew them and wasn't drawn to them, not for being common.
- **Quantum physics appeals.** "난 이런 양자 물리 쪽도 관심있거든" ("I'm into
  this quantum physics kind of stuff too") (2026-09-26), while suggesting
  "자석은 왜 자석일까?" ("Why is a magnet a magnet?").
- **The picture is the explanation** (2026-09-26): an animation the viewer
  watches happen, not a diagram illustrating the narration.

## Shown, not picked

The human has seen these; they weren't turned down one by one. Names only;
the notes are in `git show d4a76eb:docs/topics.md`.

- 2026-09-26, everyday phenomena: propellers bent on a phone camera, wire
  rope, a wobbly table, mains hum dating a recording, excavator push vs.
  pull, QR codes with the middle covered, frozen rice icy inside, selfie
  noses, escalator standing, phones dying in the cold, kettles loudest
  before boiling, the figure-8 compass wave, no wind behind a fan, CSAT
  grade 1 as the top 4%.
- 2026-09-26, quantum and physics: why a magnet is a magnet (no honest 2D
  picture of exchange found; "Pauli lines spins up" is false in general), a
  third polarizer, the Sun's core too cold for fusion, gold's color, glass
  hard yet transparent, glow-in-the-dark stickers.
- 2026-09-26, picture-first: the cusp at the bottom of a mug, phantom
  traffic jams, flocks turning as one, wheels spinning backward on video,
  moiré on photographed screens, coffee-ring stains, toast landing butter
  side down, zebra stripes and leopard spots (Turing patterns).
- 2026-09-26, beyond everyday: straight lines that make a circle (Tusi
  couple), random dots drawing a triangle (chaos game), the fastest slide
  (brachistochrone), prime spirals, Brownian motion, Chladni figures,
  Kapitza's upside-down pendulum, snowflake branches, a 50:1 gear in one
  ring (strain wave), the hanging chain as an arch (catenary), a rotating
  field from three coils, drilling a square hole (Reuleaux).
- Already told in Korean, set aside: the lunar birthday cycle, 11,172 Hangul
  syllables, curved platform gaps, the West Sea's tides, bus bunching,
  round spring wire, tensegrity, Ackermann steering, spaghetti breaking in
  three, why the sky isn't purple, a knife slicing vs. pressing, fusion
  stopping at iron, LED color, liquid mercury, no green stars, remote light
  on a phone camera, the Curie point demo.

## Rejected

- 2026-09-26: "다 아는 얘기 (내가 아는 얘기) 이기도 하고 뭔가 흔한거 같기도
  하고" ("it's something everyone knows (something I know), and it also kind
  of seems common"); later clarified as dull rather than common.
  - Guessing one in a million with twenty questions (binary search, 2^20)
  - Why steel bridges are full of triangles (truss rigidity)
  - The birthday paradox (23 people, 253 pairs)
  - Why honeycombs are hexagonal (tiling the plane, minimal perimeter)

## 2026-09-27

### A cube through a cube (Prince Rupert's cube)

- **Hook:** "정육면체에 구멍을 뚫으면, 똑같은 크기의 정육면체를 통과시킬 수
  있습니다."
- **Picture:** A cube turns until we look straight down its long diagonal, and
  its silhouette becomes a regular hexagon. A square the size of one face
  drops onto the hexagon and fits with room to spare, so a square tunnel
  along that line leaves the cube in one piece, and a second cube slides
  through. The margin is enough for a cube about 6% bigger. Closer: for
  over 300 years no convex solid was proven unable to do this, until the
  "Noperthedron" (2025).
- **Why it surprised me:** It sounds impossible, and the proof is a
  shadow: once the hexagon is on screen, you can see the square fits.
- Sources: Wikipedia "Prince Rupert's cube" (Wallis 1693; Nieuwland's
  optimum 3√2/4 ≈ 1.06, published 1816); Steininger & Yurkevich, arXiv
  2508.18475; Quanta, 2025-10-24. Korean press covered the 2025 result
  (Daum, 2025-10-28), but I found no Korean Short showing the hexagon.
  Hard to draw: 3D in SVG (the studio has no 3D library). A wireframe cube
  is easy; the drilled cube with the second one passing through needs
  hidden-line care.

### The coin bet you can't win (Penney's game)

- **Hook:** "동전 던지기에서 '뒤앞앞'은 '앞앞앞'을 8번 중 7번 이깁니다."
- **Picture:** A strip of coin flips scrolls by. Each time 앞앞앞 shows up
  anywhere but at the very start, the flip just before it has to be 뒤, so
  뒤앞앞 already happened one flip earlier. 앞앞앞 wins only if the first
  three flips are all heads: 1 in 8. Closer: whatever three-flip pattern
  you pick, there's always one that beats it, like rock-paper-scissors.
- **Why it surprised me:** Both patterns are equally likely in any three
  flips, yet one wins 7:1, and one picture of the strip settles it.
- Sources: Penney (1969); Martin Gardner, Scientific American (1974);
  Wikipedia "Penney's game". Easiest idea here to draw.

### Cut the string, the weight goes up (spring paradox)

- **Hook:** "매달린 추를 붙잡고 있는 줄을 끊었는데, 추가 올라갑니다."
- **Picture:** A weight hangs from spring, short string, spring, with two
  slack side strings. Load labels show each spring carrying the whole
  weight. The short string is cut: the side strings go taut, the springs
  now hang side by side, each carries half, each shortens, and the weight
  rises. Closer: the same math is why closing a road can make traffic
  faster (Braess's paradox).
- **Why it surprised me:** Taking a support away lifts the load. The
  label on each spring, before and after, is the entire explanation.
- Sources: Cohen & Horowitz, Nature 352, 699 (1991). Steve Mould made an
  English video and TikTok of it; I found no Korean one. Easy to draw.

### The atom that should collapse (quantum)

- **Hook:** "고전 물리학대로라면, 모든 원자는 100억분의 1초도 안 돼서
  무너져야 합니다."
- **Picture:** A classical electron spirals into the nucleus (the
  predicted ~1.6×10⁻¹¹ s). Then the quantum version: the electron is a
  cloud, and squeezing it shortens its wave, so it wiggles harder. Two
  bars track the squeeze: the electric energy drops, the wiggle energy
  climbs faster. Their sum is a curve with a valley, and the atom sits at
  its bottom, 0.053 nm.
- **Why it surprised me:** "Why doesn't the electron fall in?" has a
  one-graph answer, and the graph isn't a cartoon: scaling the true
  hydrogen ground state this way gives exactly the Bohr radius and
  −13.6 eV.
- Sources: Olsen & McDonald, "Classical lifetime of a Bohr atom" (1.6×10⁻¹¹
  s); Feynman Lectures Vol. III §2-4, "The size of an atom". Hard part:
  keeping "squeezed wave, more energy" honest without formulas on screen.

### One neutron in 150 is late (why a reactor can be steered)

- **Hook:** "원자로를 사람이 조종할 수 있는 건, 중성자 150개 중 1개가 몇 초
  늦게 나오기 때문입니다."
- **Picture:** A chain reaction drawn as a branching tree on a time axis.
  Prompt neutrons branch every ~0.0001 s; about 0.65% leave on long
  dashed arcs that land seconds later. Reactors run so that the prompt
  branches alone always die out, so the tree can only grow as fast as the
  late arcs land. Two power curves: prompt neutrons only, ×20,000 in one
  second; with the late ones, about 1% per second.
- **Why it surprised me:** Control of a reactor hangs on a sliver of
  late neutrons, not on the rods' speed. Without them, no rod could move
  in time.
- Sources: DOE Fundamentals Handbook, Nuclear Physics and Reactor Theory
  (DOE-HDBK-1019); Lamarsh, Introduction to Nuclear Engineering (the
  prompt-only example). Research should pin the numbers to one source,
  since the generation time varies by reactor.

### Always twelve pentagons

- **Hook:** "축구공도, 탄소 분자도, 바이러스 껍데기도, 육각형으로 공을 만들면
  오각형이 꼭 12개 들어갑니다."
- **Picture:** A flat sheet of hexagons can't curve. Swap one hexagon for a
  pentagon and the sheet closes into a cone: a pentagon is a hexagon
  missing a 60° wedge. Any closed ball-shaped solid is missing 720° in all
  (a cube's 8 corners each miss 90°; a tetrahedron's 4 each miss 180°),
  and 720 ÷ 60 = 12.
- **Why it surprised me:** A soccer ball, C₆₀, and a virus shell share one
  number, and the cone makes it arithmetic. Not the rejected honeycomb:
  that was about why flat tiling uses hexagons; this is what curving it
  costs.
- Sources: Descartes' theorem on total angular defect (720°); C₆₀ has 12
  pentagons and 20 hexagons; icosahedral capsids have 12 pentamers (Caspar
  & Klug, 1962). Hard to draw: the hexagon sheet folding into a cone is 3D.

### Two moons that swap orbits (Janus and Epimetheus)

- **Hook:** "토성에는 거의 같은 궤도를 도는 달이 두 개 있는데, 4년마다 서로
  자리를 바꿉니다."
- **Picture:** Top view, the 50 km gap exaggerated. The inner moon is
  faster and gains on the outer one; the pull speeds it up, so it rises,
  and a higher orbit is slower, so it falls behind. The outer moon gets
  the opposite. Replayed in a frame turning with them, each moon traces a
  horseshoe and they never get closer than ~15,000 km.
- **Why it surprised me:** Speeding up makes you slower, and here two
  moons rely on it every four years. The same rule is why astronauts
  can't catch a spacecraft by flying at it.
- Sources: The Planetary Society, "The Orbital Dance of Epimetheus and
  Janus" (50 km, ~15,000 km, Janus ~4× heavier); NASA/JPL PIA08170. Swaps
  in January 2006, 2010, 2014, 2018, 2022; the 2026 date needs checking.
  Easy to draw.

### A bomb found without touching it (quantum)

- **Hook:** "빛을 한 번도 닿게 하지 않고, 그 자리에 폭탄이 있는지 알아낼 수
  있습니다."
- **Picture:** Light splits into two paths and rejoins. The two halves
  cancel at one exit, so that detector stays dark. Put a light-triggered
  bomb in one path. Half the photons set it off. The rest, with nothing
  left to cancel against, reach the dark detector half the time: 1 in 4
  overall. That click means a bomb is there, reported by a photon that
  never touched it.
- **Why it surprised me:** An absence of interaction is still
  information, and the dark exit makes that visible. Kin to the third
  polarizer (shown last round), but this picture shows the wave taking
  both paths.
- Sources: Elitzur & Vaidman (1993); Kwiat et al., PRL 74, 4763 (1995),
  who raised the no-explosion rate toward 100%. Hard part: wave view and
  photon view in 45 s.

### Same numbers, different sum (Riemann rearrangement)

- **Hook:** "같은 숫자들을 순서만 바꿔서 더했을 뿐인데, 합이 달라집니다."
- **Picture:** 1 − ½ + ⅓ − ¼ + … settles at 0.693. Split it into a pile of
  positive cards and a pile of negative ones, each card smaller than the
  last. A walker on a number line aims at any target, 2 say: add
  positives until past it, negatives until below, repeat. The swings
  shrink to nothing and the sum lands on 2. It works because each pile
  alone adds up to infinity.
- **Why it surprised me:** Order never matters for finitely many numbers;
  with infinitely many it can, and the walk shows when.
- Sources: Riemann's rearrangement theorem (1854, published 1868), in any
  real-analysis text. Easy to draw.

**Make first: the cube through a cube.** The strongest "wait, what?" of
the round, and the picture explains it completely: turn the cube, see the
hexagon, the square fits. It's geometry with no "why does everyday X"
shape, the 2025 Noperthedron gives it a fresh ending, and I found no
Korean Short that shows the hexagon. The 3D drawing is the cost. If
quantum comes first, the atom that should collapse: one valley-shaped
graph for a question most people have wondered about.
