# Topic pool

The channel's topic pool. The topic agent fills it and the human picks
([docs/briefs/topic.md](briefs/topic.md)). A picked topic becomes
`episodes/<slug>/topic.md`.

Made so far: 001 A4 paper ([episodes/001-a4-paper-ratio](../episodes/001-a4-paper-ratio/topic.md)).

## Channel taste (from the human's words)

- Common topics are fine: "a4 엄청 흔하지 않아? 그냥 흔한것도 올릴까?"
  ("Isn't A4 super common? Should I just post common ones too?")
  (2026-09-26). Most people watch Shorts from the feed, so many viewers
  haven't seen the existing explanations. What comes first is the human's
  interest and a picture that explains it better than existing videos. The
  four rejected topics were turned down less for being common than because
  the human already knew them and wasn't drawn to them.
- A topic that took off in English science Shorts and YouTube but doesn't
  exist in Korean yet earns a bonus. English view counts serve as evidence
  of demand (2026-09-26).
- So each candidate is checked from both sides: the English response (views
  and links) and Korean coverage (YouTube search with the region set to
  Korea).
- The human is also interested in quantum physics: "난 이런 양자 물리 쪽도
  관심있거든" ("I'm into this quantum physics kind of stuff too")
  (2026-09-26, while suggesting "자석은 왜 자석일까?" ("Why is a magnet a
  magnet?") themselves).

## 002 candidates (2026-09-26)

What was searched: Korean and English STEM Shorts that did well for their
channel's size, the popular-Shorts rankings of big English channels (Know
Art, 3Blue1Brown, Steve Mould, Veritasium, and others), Korean autocomplete,
Naver Knowledge iN searches, and Korean news. View counts are as shown on
the search page that same day. English was searched with the region set to
the US, Korean with the region set to Korea. Reddit was blocked, so it
wasn't checked.

"English" is the top view count of an English video giving the same
explanation; "Korean" is the top view count of a Korean video giving the
same explanation (none = not found). The order puts big-in-English,
absent-in-Korean first.

| Rank | Candidate | Field | English | Korean |
| ---- | ---- | ---- | ---- | ------ |
| 1 | Propellers look bent on a phone camera | tech | 17M (Short) | 325 |
| 2 | Steel wire rope bends | engineering | 30M (Short) | none |
| 3 | Fixing a wobbly table without a napkin | math | 60M (Short) | none |
| 4 | Mains hum dates a recording | tech | 5.84M (long video) | none |
| 5 | Excavator arms push harder than they pull | engineering | 14M (Short) | none |
| 6 | QR codes read with the middle covered | math | 5.48M (Short) | 1.8K |
| 7 | Frozen rice stays icy in the middle | science | 16M (Short) | 2K |
| 8 | Selfies make your nose look bigger | math | 600K (long video) | 5K |
| 9 | Escalators: stand on one side or both | engineering | 300K (long video) | none (news is mostly the debate) |
| 10 | Phones die in the cold at 30% | tech | 340K (long video) | 2.5K |
| 11 | Kettles are loudest just before boiling | science | 150K (long video) | 6.4K |
| 12 | Map apps ask for a figure-8 wave | tech | 35K (Short) | none |
| 13 | No wind behind a fan | science | weak | none |
| 14 | CSAT grade 1 is the top 4% | math | Korea only | none |

By field: math 4, science 3, tech 4, engineering 3.

Pattern in the Shorts that did well: they show the hidden principle inside
an object everyone handles, and the title overturns a belief viewers didn't
know they held ("Why springs are NOT made from I-beams"). Putting the
phenomenon's name in the title flops (on the same topic, "가브리엘의 나팔"
(Gabriel's Horn) got 1.9K and "수학계 최고의 미친 도형?!" (the craziest
shape in math?!) got 1.94M). Many hit Shorts from small Korean channels
retell an English original in Korean. That means English demand carries
over to Korean.

Production, all candidates: `studio/src/components` has no graph parts yet
(axes, curves, area shading, points). More than half the candidates need
them, so what 002 builds keeps getting used in later episodes.

### 1. Propellers look bent on a phone camera (tech)
- **Title draft:** 폰으로 찍으면 프로펠러는 왜 휘어 보일까?
- **Hook:** "비행기 창밖 프로펠러를 폰으로 찍으면, 곧은 날개가 엿가락처럼 휘어 있어요."
- **Key picture:** A phone sensor doesn't take a photo all at once; it reads
  it one row at a time from top to bottom (rolling shutter). While the
  straight blade turns, the scan line moves down and each row captures the
  blade at a different moment; stacked together, they make bent blades and
  blades that break off. This one picture is the whole explanation, and all
  of it can be drawn in code.
- **Evidence:** English: [Know Art "Why Your Photos Are Wonky And Deformed"](https://youtube.com/shorts/9nJYT4fuTjg)
  17M (900K subscribers), [SmarterEveryDay's rolling shutter explainer](https://youtu.be/dNVtMmLlnoE)
  4.45M. Korean autocomplete "롤링셔터 젤로현상" (rolling shutter jello
  effect), English autocomplete "why do propellers look weird on camera".
- **Korean coverage:** The only Korean explanation is [one Short with 325 views](https://youtube.com/shorts/zqN3Gb2zhNI).
  The top Korean search result is the English original Short (73K).
- **Production:** New: a rotating bar, and a canvas that the scan line
  stamps and stacks row by row (computed per frame). Uses almost none of the
  existing parts.
- **To verify:** How long a phone sensor takes to read one frame (reported
  as a few ms to tens of ms).

### 2. Steel wire rope bends (engineering)
- **Title draft:** 강철인데 와이어로프는 왜 휘어질까?
- **Hook:** "엘리베이터를 매단 줄은 강철인데 휘어요. 같은 굵기의 쇠막대는 꿈쩍도 안 하는데요."
- **Key picture:** Compare cross-sections: one thick circle, and the same
  area split into many thin circles. What resists pulling is the area, so
  the two are equal. Bending stiffness scales with the fourth power of the
  diameter, so splitting into n strands gives 1/n (when the strands slide
  past each other). 7×19 = 133 strands is 133 times more flexible.
- **Evidence:** English: [Know Art "Why Steel Cables Are Able To Bend"](https://youtube.com/shorts/AC3Iz3U_864)
  30M. The numbers were checked in code: n·(d/√n)⁴ = d⁴/n.
- **Korean coverage:** None. A Korean search turns up only wire knot and
  fastening tips (780K, 660K).
- **Production:** New: an array of circle cross-sections, a bending bar.
  Reused: Equation (d⁴, 1/n), Dimension (diameter).
- **To verify:** Where a real rope's stiffness falls between "one solid
  piece" and "strands sliding separately".

### 3. Fixing a wobbly table without a napkin (math)
- **Title draft:** 흔들리는 테이블, 냅킨 말고 고치는 법?
- **Hook:** "카페 테이블이 덜컹거릴 때 냅킨 접지 마세요. 돌리기만 하면 멈춥니다."
- **Key picture:** Rotate the table by θ and plot the height f(θ) of the
  lifted leg. Its sign is opposite at 0° and 90°, so it crosses 0 somewhere
  in between (intermediate value theorem).
- **Evidence:** English: [Know Art Short](https://youtube.com/shorts/mHA-emoi2PI) 60M,
  long videos [1.7M](https://youtu.be/47YbLU7-J1M), [1.17M](https://youtu.be/OuF-WB7mD6k).
  Korean autocomplete "테이블 흔들림 고정" (fixing a wobbly table).
  [Baritompa et al., arXiv math/0511490](https://arxiv.org/abs/math/0511490).
  Conditions: the legs are the same length and the floor slopes gently.
- **Korean coverage:** No Korean explanation (search turns up
  [a fixing-bracket tip](https://youtube.com/shorts/tD3ukTqKe18) at 770K and
  the like). But for some search terms the Know Art Short also shows up in
  Korea under a translated title, so some viewers may have seen it.
- **Production:** New: graph. The rotating table is 3D, so it needs a Manim
  insert or a simplified 2D side view. The heaviest of the candidates.

### 4. Mains hum dates a recording (tech)
- **Title draft:** 녹음 속 '웅~' 소리로 녹음한 날을 안다?
- **Hook:** "녹음 파일에 깔린 전기의 '웅~' 소리. 이 소리로 언제 녹음했는지 알아낼 수 있어요."
- **Key picture:** The grid's 60 Hz wobbles slightly with load, and it
  wobbles the same way across the whole country. Slide the frequency curve
  of the hum in a recording along the grid's log; where it matches is when
  the recording was made (ENF analysis).
- **Evidence:** English: [Tom Scott "The hidden background noise that can catch criminals"](https://youtu.be/e0elNU0iOMY)
  5.84M. [ENF analysis](https://en.wikipedia.org/wiki/Electrical_network_frequency_analysis)
  (UK police cases). Korean autocomplete "변압기 웅 소리" (transformer
  hum), "형광등 웅 소리" (fluorescent light hum).
- **Korean coverage:** None. In Korean there is only a technical video on
  what causes transformer noise ([9K](https://youtu.be/2ZV65kwjgWc)).
- **Production:** New: a waveform, a graph that aligns two wobbling
  frequency curves.
- **To verify:** How much Korea's grid frequency wobbles, and whether a
  record of it is public.

### 5. Excavator arms push harder than they pull (engineering)
- **Title draft:** 포크레인 팔은 밀 때와 당길 때 힘이 같을까?
- **Hook:** "포크레인 팔을 움직이는 유압 실린더. 같은 기름, 같은 압력인데 밀 때가 당길 때보다 훨씬 세요."
- **Key picture:** Two cylinder cross-sections. On the push side the oil
  presses on the whole piston circle; on the pull side, only on the ring
  left after the rod's cross-section. Force = pressure × area. If the rod's
  diameter is 70% of the piston's, the ring is 51%, so the pulling force is
  about half. In return, pulling is faster (same flow, smaller volume).
- **Evidence:** English: [Know Art "Hydraulic Cylinders Push Harder Than They Pull"](https://youtube.com/shorts/gjCfbgKbAbc)
  14M. The numbers were checked in code (1 − 0.7² = 0.51).
- **Korean coverage:** None. In Korean only Pascal's principle videos come
  up ([excavator, 557K](https://youtu.be/KavGmr2L_cI), EBS 63K). Pascal's
  principle itself is textbook material, but they don't cover the difference
  between pushing and pulling force.
- **Production:** New: circle and ring cross-sections, arrows. Reused:
  PaperRect (cylinder body), Equation (F = PA), Dimension (diameter).

### 6. QR codes read with the middle covered (math)
- **Title draft:** QR코드는 가운데를 가려도 왜 읽힐까?
- **Hook:** "가게 QR코드 한가운데 로고가 박혀 있어도, 폰은 아무 문제 없이 읽어요."
- **Key picture:** Two points fix one line. Put the data as points on a
  polynomial curve and write down extra points. Even if some are erased or
  wrong, the remaining points bring back the same curve (Reed–Solomon).
  Level H recovers up to about 30%.
- **Evidence:** English: [3Blue1Brown "Error correction is incredible"](https://youtube.com/shorts/yZMw2rOKYwE)
  5.48M (it shows up in Korean search too), [Hamming codes](https://youtu.be/X8jsijhllIA) 3.03M.
  [QR error correction levels (qrcode.com)](https://www.qrcode.com/en/about/error_correction.html).
  Korean autocomplete "QR코드 오류 복원 원리" (how QR code error recovery
  works).
- **Korean coverage:** There are several small Korean Shorts ([1.8K](https://youtube.com/shorts/XSje-5RmoxU),
  [1.5K](https://youtube.com/shorts/_AOc2h0HVtg), and others; they even name
  error correction). None found that explains it with the polynomial
  picture.
- **Production:** New: a grid of QR modules, a graph of points and a curve.
  Reused: Equation.

### 7. Frozen rice stays icy in the middle (science)
- **Title draft:** 냉동밥 데우면 왜 가운데만 꽁꽁 얼어 있을까?
- **Hook:** "냉동밥을 전자레인지에 돌리면 가장자리는 뜨거운데 가운데는 아직 얼음이죠."
- **Key picture:** Water molecules (+/− bars) swing with the microwave's
  electric field and give off heat. Molecules in ice are locked in a lattice
  and can barely swing. So ice absorbs microwaves poorly, and the water at
  the edges, which melts first, takes all the energy and gets hotter still.
  Defrost mode runs in bursts to give the heat time to spread.
- **Evidence:** English: ["Why Ice Doesn't Melt In The Microwave"](https://youtube.com/shorts/ecRW4z89Ids)
  16M. Naver Knowledge iN has the same question ([1](https://kin.naver.com/qna/detail.naver?dirId=1114&docId=58154563),
  [2](https://kin.naver.com/qna/detail.naver?dirId=130504&docId=393777465)).
- **Korean coverage:** Several small Shorts give the same explanation
  ([1.2K](https://youtube.com/shorts/6VzaGMMC1g0) and others;
  [YTN](https://youtu.be/YRLfsaRZqgg) 2K). None found that carries it through
  to the feedback loop in frozen rice.
- **Production:** New: swinging dipole arrows, a lattice, temperature color.
- **To verify:** How deep 2.45 GHz penetrates ice and water.

### 8. Selfies make your nose look bigger (math)
- **Title draft:** 셀카 찍으면 왜 코가 커 보일까?
- **Hook:** "셀카 속 내 코, 거울로 볼 때보다 커 보이죠. 기분 탓이 아니라 실제로 30% 커요."
- **Key picture:** A face outline seen from above, the camera, and
  projection lines. Size on screen is inversely proportional to distance. At
  30 cm the nose tip is noticeably closer than the cheekbones and ears. Back
  off to 1.5 m and that ratio approaches 1. It's not the lens, so zooming in
  from farther away fixes it.
- **Evidence:** English: ["Why selfies can make your nose look bigger"](https://youtu.be/9zumV39nm60)
  600K, [Know Art "Why Perspective Exists At All"](https://youtube.com/shorts/IXY1IGaaCb0)
  4M. [Ward et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5876805/):
  at 30 cm the nose base is about 30% wider than at 1.5 m. Naver Knowledge
  iN has the same question several times
  ([example](https://kin.naver.com/qna/detail.naver?dirId=5010601&docId=419837392)).
- **Korean coverage:** There is [one video](https://youtu.be/NjZnBiHdPcU)
  with the same explanation (a translated research news story, 5K). A
  [beauty video](https://youtu.be/sVrsxa_9w1M) (390K) only mentions
  "distortion".
- **Production:** New: projection lines, a face-profile curve. Reused:
  Dimension (distance), Equation.

### 9. Escalators: stand on one side or both (engineering)
- **Title draft:** 에스컬레이터, 한 줄 서기가 더 빠를까?
- **Hook:** "정부가 이번 주 에스컬레이터 '두 줄 서기' 캠페인을 접었어요. 그럼 사람을 더 많이 나르는 건 어느 쪽일까요?"
- **Key picture:** Dots (people) on two lanes of steps. The standing lane
  has one person per step. The walking lane leaves two or three steps
  between people, and the taller the escalator, the fewer people walk, so it
  empties out. On a throughput-vs-height graph, standing on both sides wins
  above about 18 m (London's Holborn trial, +30%).
- **Evidence:** English: ["The Messy Science of Escalator Etiquette"](https://youtu.be/as8s6QQcjp0)
  300K, [Short](https://youtube.com/shorts/7ziQ6EDEtH0) 18K.
  [Seoul Shinmun 2026-09-23](https://www.seoul.co.kr/news/society/2026/09/23/20260923500112)
  ("일률적인 두 줄 서기 캠페인과 규제는 더 이상 추진하지 않는다" (blanket
  stand-on-both-sides campaigns and regulation will no longer be pursued),
  confirmed),
  [Londonist (Holborn trial)](https://londonist.com/london/transport/the-results-of-the-holborn-standing-escalator-trial-are-in).
- **Korean coverage:** Plenty of Korean news ([KLAB](https://youtu.be/oX79Spwi86I) 150K,
  [KBS](https://youtu.be/VaoecS5cet8) 26K). It centers on the safety and
  etiquette debate; no throughput calculation showing that the answer
  changes with height was found. It has to be made before the news cools
  off.
- **Production:** New: dots flowing on steps, a graph.

### 10. Phones die in the cold at 30% (tech)
- **Title draft:** 배터리 30%인데 추우면 왜 폰이 꺼질까?
- **Hook:** "추운 데서 30% 남은 폰이 툭 꺼졌는데, 따뜻한 데 오니 다시 30%예요."
- **Key picture:** Plot a lithium-ion cell's voltage against its charge:
  the curve is nearly flat from 20 to 80%, with a cutoff voltage line below.
  The phone can't measure the charge directly; it estimates it from voltage
  and current. In the cold the internal resistance rises, so under load the
  voltage drops by I×R and falls below the cutoff line. The charge is still
  all there.
- **Evidence:** English: ["Why Does Cold Weather Kill Your Phone?"](https://youtu.be/i2nelj3apTI)
  340K, [Short](https://youtube.com/shorts/YqafvIhtqmI) 17K. Naver Knowledge
  iN has the same question ([1](https://kin.naver.com/qna/detail.naver?dirId=1070402&docId=434575331),
  [2](https://kin.naver.com/qna/detail.naver?dirId=1070402&docId=382305080)).
  It becomes timely from November.
- **Korean coverage:** Many small Korean Shorts on the same topic ([2.5K](https://youtube.com/shorts/dHAKIrrhjGQ),
  [1.2K](https://youtube.com/shorts/rPEiKoFguJ4), and others). None found
  that explains it with the voltage curve.
- **Production:** New: a graph with a curve, a horizontal line, and a moving
  point. Reused: NumberLine (charge %), Equation (V = V₀ − IR).

### 11. Kettles are loudest just before boiling (science)
- **Title draft:** 주전자 물은 왜 끓기 직전이 제일 시끄러울까?
- **Hook:** "전기포트가 제일 시끄러운 건 물이 끓을 때가 아니라 끓기 직전이에요."
- **Key picture:** Lay a temperature gradient over a kettle cross-section,
  hot at the bottom and less hot at the top. Bubbles rise from the bottom,
  collapse in the cooler layer, and crackle. Once all the water reaches
  100 °C, the bubbles make it to the surface and it goes quiet. Beside it,
  a loudness curve whose peak comes before the boil.
- **Evidence:** English: ["Why is a kettle louder BEFORE it boils?"](https://youtu.be/fszYVWNmJ0Q)
  150K. Aljishi & Tatarkiewicz, *Am. J. Phys.* 59, 628 (1991) (not read).
  Naver Knowledge iN has the same question ([1](https://kin.naver.com/qna/detail.naver?dirId=1115&docId=53798745),
  [2](https://kin.naver.com/qna/detail.naver?dirId=60601&docId=357707666)).
- **Korean coverage:** A Korean Short gives the same explanation: ["물이 끓기 직전에 가장 시끄러운 진짜 이유"](https://youtube.com/shorts/d3YwM1EeGRM)
  (the real reason water is loudest just before it boils) 6.4K.
- **Production:** New: a cross-section shape, bubble particles, a loudness
  curve graph.

### 12. Map apps ask for a figure-8 wave (tech)
- **Title draft:** 지도 앱은 왜 폰을 8자로 흔들라고 할까?
- **Hook:** "지도 앱이 가끔 '휴대폰을 8자로 흔들어 주세요'라고 하죠. 흔들면 뭐가 달라질까요?"
- **Key picture:** Turn the phone every which way and plot the compass
  sensor's readings as dots, and they form a circle (a sphere in 3D). But
  its center is off the origin, because magnets and metal in the phone add a
  fixed field that turns with the phone (hard iron). Waving in a figure 8
  samples every direction; find the circle's center and subtract it.
- **Evidence:** English: ["Why is a figure of 8 used in phone GPS compass calibration?"](https://youtube.com/shorts/x6Edsv7RN8o)
  35K, a Short on how to calibrate 330K. [NXP AN4246](https://www.nxp.com/docs/en/application-note/AN4246.pdf).
  Korean autocomplete "네이버 지도 나침반 보정" (Naver Map compass
  calibration), "갤럭시 나침반 보정" (Galaxy compass calibration).
- **Korean coverage:** None. In Korean there are only Garmin watch
  calibration how-to videos (top 3.9K).
- **Production:** New: a point cloud, circle fitting, a center shift.
  Reused: Equation, Note.

### 13. No wind behind a fan (science)
- **Title draft:** 선풍기 뒤에서는 왜 바람이 안 나올까?
- **Hook:** "선풍기는 뒤에서 빨아들인 공기를 앞으로 뿜어요. 그런데 뒤에 손을 대 보면 바람이 거의 없죠."
- **Key picture:** Put two flow fields side by side. The intake side is
  arrows converging from every direction, so speed falls off with the square
  of distance and fades fast. The outflow side bunches into a single jet
  that travels far. With a candle at the same distance, blowing puts it out
  and sucking doesn't.
- **Evidence:** The English response is weak (["Why You Can't Suck Out a Candle"](https://youtu.be/w08B4okwZjQ)
  1.4K). But people in Korea ask it a lot: Naver Knowledge iN has more than
  8 separate posts of the same question
  ([example](https://kin.naver.com/qna/detail.naver?dirId=613&docId=47304797)).
- **Korean coverage:** Close to none. There is one Short, ["선풍기 뒤쪽 바람이 없는 이유?"](https://youtube.com/shorts/s7HaKPQrtkg)
  (why is there no wind behind a fan?) (5.7K, content not checked).
- **Production:** New: streamline and particle-flow animation. Reused:
  Equation (1/r²), Note.

### 14. CSAT grade 1 is the top 4% (math)
- **Title draft:** 수능 1등급은 왜 하필 4%일까?
- **Hook:** "수능 1등급은 상위 4%, 2등급은 11%, 3등급은 23%까지. 이 숫자, 누가 정했을까요?"
- **Key picture:** Slice a bell-shaped normal distribution into bands 0.5σ
  wide (only the two ends open), and the band areas come out to
  4·7·12·17·20·17·12·7·4%. It's the stanine, made by the US Army Air Forces
  in World War II to turn a score into one digit that fits in a single
  column of a punch card. The numbers were checked in code (4.0, 6.6, 12.1,
  17.5, 19.7%).
- **Evidence:** It's a Korea-only subject, so there's no evidence of English
  demand. People do ask: [Naver Knowledge iN "수능 1등급이 4% 이내인 이유"](https://kin.naver.com/qna/detail.naver?dirId=1121&docId=328981873)
  (why CSAT grade 1 is the top 4%). It's timely ahead of the CSAT
  (November). [Stanine](https://en.wikipedia.org/wiki/Stanine),
  [Namuwiki on the 9-grade system](https://namu.wiki/w/%EB%82%B4%EC%8B%A0%C2%B7%EC%88%98%EB%8A%A5%209%EB%93%B1%EA%B8%89%EC%A0%9C).
- **Korean coverage:** None. A [video](https://youtu.be/Zeyx-ZJRG5k) with
  the same title has 155 views and no answer. "스테나인" (stanine) turns up
  only teacher certification exam lectures.
- **Production:** New: a normal distribution curve, interval shading.
  Reused: NumberLine (σ ticks), Equation and Note (percentage labels).
- **To verify:** A primary source that KICE (which sets the CSAT) followed
  the stanine.

### Top three

1. **Propeller rolling shutter.** 17M in English, and no Korean
   explanation. The picture of the scan line stamping out a bent blade is
   the explanation itself, so it suits code animation best.
2. **Wire rope.** 30M in English, and no Korean explanation. It comes down
   to one split of a circular cross-section and the d⁴/n calculation, so the
   math lands cleanly, as in 001.
3. **Wobbly table.** The biggest English demand (60M), and no Korean
   explanation. The hook is a fix you can try the very next day. But the 3D
   makes it the heaviest to produce.

## Quantum and physics candidates (added 2026-09-26)

The human suggested "자석은 왜 자석일까?" ("Why is a magnet a magnet?"), so
that angle was checked, and more quantum and physics candidates were found
by the same criteria (verified in English, absent in Korean, one picture to
draw in code, outside Korean school textbooks). Explanations already known
in Korea, like domain alignment (high-school Physics I) or the Curie
temperature demo, counted as "exists". Each candidate notes where cutting it
down to 45 seconds makes it wrong. This batch is all science, as requested,
so across the whole pool (20 candidates) science exceeds the brief's 1/3
cap.

| Rank | Candidate | English | Korean |
| ---- | ---- | ---- | ------ |
| 1 | Why a magnet is a magnet (exchange interaction) | the question 990K (Feynman), no Short with this explanation | the question 5.21M (Feynman, Korean-subtitled), no Short with this explanation |
| 2 | A third polarizer lets light back through | 500K (Short) | none |
| 3 | The Sun's core is too cold for fusion | 2.08M (67 s video) | 188K (56 min documentary), Shorts 1.3K |
| 4 | Gold is yellow while other metals are silver | 126K | 12K |
| 5 | Glass is hard yet transparent | 5.02M | 72K, Short 53K |
| 6 | Glow-in-the-dark stickers glow for hours | 1.33M | 66K |

Magnets (exchange interaction) rank first. Demand for the question itself is
proven in both languages (the Feynman video's Korean-subtitled version alone
has 5.21M). Yet no Korean Short gives the explanation that "the force lining
up the atoms isn't magnetic". A single comparison of numbers, 2,600 times,
becomes the picture and is verified in code. It's also a field the human
showed interest in directly. Even against the top three of the earlier pool,
it deserves the front spot.

### Q1. Why a magnet is a magnet (science)
- **Title draft:** 자석은 왜 자석일까?
- **Hook:** "철을 770 °C로 달구면 자석에 안 붙어요. 그럼 식은 철 속에서는 뭐가 원자들을 한 방향으로 붙잡고 있을까요?"
- **Key picture:** Two log-scale bars. The magnetic energy between the
  atomic magnets of neighboring iron atoms is worth about 0.4 K. Yet iron
  holds its alignment up to 1043 K (770 °C). The magnetic force is 2,600
  times too weak. What really holds it is the electric repulsion between
  electrons plus the Pauli principle: electrons with parallel spins can't be
  in the same place, so they stay apart and the repulsion energy drops
  (exchange interaction).
- **Numbers (checked in code):** Fe atomic magnetic moment 2.22 μB, bcc
  lattice constant 2.8665 Å.
  - Between nearest neighbors (2.482 Å), μ₀μ²/(4πr³) = 2.8×10⁻²⁴ J =
    0.20 K; head-to-tail (×2), 0.40 K.
  - Second-nearest neighbors (2.866 Å): 0.13 K.
  - The upper bound on the whole block's magnetic energy, μ₀M²/2, comes to
    1.6 K per atom (M = 1.75×10⁶ A/m, matching the measured 1.71×10⁶).
  - k_B·T_C = 90 meV. That's 2,600 times the nearest pair and 640 times the
    upper bound.
- **Second angle, the Bohr–van Leeuwen theorem:** With classical physics
  alone, magnetization is zero at thermal equilibrium, so magnets couldn't
  exist (Feynman Lectures Vol. II, ch. 34). In English it's lecture videos
  of around 1K views; in Korean a [42-minute documentary](https://youtu.be/2XRKMLCIfjs)
  (14K) mentions it, and that's about it, so the evidence of demand is weak.
  It's a partition-function argument, which is also hard to show as a
  picture in 45 seconds. Better as one line in the Q1 script than as its own
  topic.
- **Evidence (English):** The question itself is big: [Feynman's magnets interview](https://youtu.be/MO0r930Sn_8)
  990K, [the Fun to Imagine original](https://youtu.be/Q1lL-hXO27Q) 350K,
  [minutephysics "MAGNETS: How Do They Work?"](https://youtu.be/hFAOXdXZ5TM)
  4.6M (not checked whether it covers exchange interaction), [Curie point demo Short](https://youtube.com/shorts/h7R-0T0Qw0c)
  15M. Shorts that say "it isn't magnetism" have 750 views or fewer.
- **Korean coverage:** The question is well known: [Feynman, Korean-subtitled version](https://youtu.be/3smc7jbUPiE)
  5.21M. The Curie temperature demo already exists too: ["철을 변화시키는 온도, 770도의 비밀"](https://youtube.com/shorts/RC1hZWwv1SA)
  (the temperature that changes iron: the secret of 770 degrees) has 1.86M,
  and explains it with domain alignment (textbook level). Unrealscience's
  episodes with Prof. Kab-Jin Kim, [476K](https://youtu.be/FU29W6B1eeE) and
  [1.52M (2.5 hours)](https://youtu.be/zi9eq-v0VNE), cover spin; whether they
  get as far as exchange interaction is unchecked. No Korean Short
  explaining exchange interaction was found.
- **45-second trap:**
  - Generalizing to "the Pauli principle makes spins line up" is wrong.
    Pairing up the opposite way, as in the hydrogen molecule, is more common
    (covalent bonds, antiferromagnetism). In iron, cobalt, and nickel the
    parallel side just wins because of the electron configuration.
  - Iron's magnetism is band magnetism of itinerant electrons (Stoner), so
    "exchange between two neighboring atoms" is an analogy.
  - The force that holds a magnet to the fridge is itself magnetic. What
    isn't magnetic is the force that lines up the atoms.
- **Production:** New: log bars, spin arrows, a picture of two electrons'
  distance and repulsion. Reused: Equation, NumberLine (log scale).

### Q2. A third polarizer lets light back through (science)
- **Title draft:** 편광 선글라스 겹치면 까매지는데, 한 장 더 끼우면?
- **Hook:** "편광 필터 두 장을 90도로 겹치면 새까매져요. 그런데 그 사이에 한 장을 더 끼우면 빛이 다시 나와요."
- **Key picture:** Each time the arrow for light's vibration direction
  passes a filter, only its shadow (projection) on the filter's axis
  remains. Straight from 0° to 90°, the projection is 0. By way of 45°,
  cos²45 × cos²45 lets through 1/8 of the incoming light. The more finely
  the filters are split, the closer it gets to 1/2 (checked in code: 5
  filters 30%, 100 filters 49%).
- **Evidence:** English: ["How Can MORE Filters Mean MORE Light?!"](https://youtube.com/shorts/P9hOvdTAHLg)
  500K, [Three Polarizing Sheets](https://youtube.com/shorts/gpDZavcYvd4) 81K,
  [long video](https://youtu.be/5SIxEiL8ujA) 420K.
  [minutephysics on Bell's theorem](https://youtu.be/zcqZHYo7ONs), which
  starts from the same experiment, has 8.04M.
- **Korean coverage:** In Korean there are only general polarizing-film demos
  (top 14K); the three-filter paradox isn't there.
- **45-second trap:**
  - Saying "it only works because of quantum mechanics" is wrong. Classical
    waves (Malus's law) explain it completely. Put in quantum terms, it has
    to be "the probability that one photon passes is cos²", a different
    reading of the same formula.
  - Getting to Bell's inequality needs entangled photon pairs, too much for
    45 seconds.
  - Not all sunglasses are polarized.
- **Production:** New: disc filters, projection arrows. Reused: Equation
  (cos²θ). The math is as clean as 001's.

### Q3. The Sun's core is too cold for fusion (science)
- **Title draft:** 태양 중심 1,500만 도, 핵융합하기엔 모자라다?
- **Hook:** "태양 중심은 1,500만 도. 그런데 계산해 보면 이 온도로는 양성자끼리 붙을 수가 없어요."
- **Key picture:** The energy hill between two protons (Coulomb barrier).
  The thermal energy is 1.35 keV, but the barrier is 0.5–1.4 MeV, hundreds
  to a thousand times higher. The classical odds of getting over are around
  10⁻²³¹ (at 2 fm, computed in code). In quantum mechanics the wave seeps
  into the hill and a little leaks out the other side (tunneling).
- **Evidence:** English: [minutephysics "How the Sun works: Fusion and Quantum Tunneling"](https://youtu.be/gS1dpowPlE8)
  2.08M (67 s), [Short](https://youtube.com/shorts/vwtF7Ve5nn0) 175K.
- **Korean coverage:** In Korean a [56-minute documentary](https://youtu.be/YKPHLpetJk0)
  (188K) covers it, and Shorts are at 1.3K or below. That the Sun turns
  hydrogen into helium is itself in the earth science textbook.
- **45-second trap:**
  - The main reason the Sun burns slowly for billions of years isn't
    tunneling but the weak interaction. p + p → d needs one proton to turn
    into a neutron, which is rare.
  - The actual reactions happen at the Gamow peak (a few keV), where fast
    protons in the tail of the distribution overlap with tunneling. "Even at
    the average temperature, tunneling does it" is inaccurate.
- **Production:** New: an energy-curve graph, a wave shrinking inside the
  barrier.

### Q4. Gold is yellow while other metals are silver (science)
- **Title draft:** 금속은 다 은색인데 금은 왜 노랄까?
- **Hook:** "은, 알루미늄, 철… 금속은 거의 다 은색인데 금만 노래요."
- **Key picture:** A reflectance-vs-wavelength graph. Silver's absorption
  starts in the ultraviolet (about 3.7 eV), so it reflects all visible
  light. Gold's absorption edge comes down to blue (about 2.4 eV, 520 nm),
  so it absorbs blue and reflects only yellow and red. The edge comes down
  because of relativistic effects in heavy atoms: the 6s level drops and 5d
  rises.
- **Evidence:** English: [Up and Atom](https://youtu.be/p_4zihzPClY) 126K.
  Shorts are around 1K.
- **Korean coverage:** In Korean the [KAOS 54-second video](https://youtu.be/2G0SCZnKg2k)
  (12K) gives the same explanation, and there are a few documentaries with a
  few thousand views.
- **45-second trap:**
  - "The 1s electrons move at 58% of the speed of light and get heavier"
    (79/137) is a Bohr-model analogy. Describing them as balls in orbit
    gives the wrong picture; the real effect is a shift in energy levels.
  - Copper is reddish too, but its relativistic effect is small.
    Generalizing to "colored metals are colored because of relativity" is
    wrong.
  - Gold doesn't give off yellow light; it absorbs blue light.
- **Production:** New: a reflectance-curve graph, two energy levels.

### Q5. Glass is hard yet transparent (science)
- **Title draft:** 유리는 딱딱한데 왜 투명할까?
- **Hook:** "돌도 쇠도 빛을 막는데, 모래를 녹여 만든 유리는 빛이 그냥 지나가요."
- **Key picture:** An electron energy ladder. The next rung up for an
  electron in glass (SiO₂) is about 9 eV higher. Visible photons are
  1.8–3.1 eV, not enough, so they aren't absorbed and pass through. Some
  ultraviolet is absorbed.
- **Evidence:** English: [TED-Ed "Why is glass transparent?"](https://youtu.be/VwRLIt6jgdM)
  5.02M, ["Glass is Solid… So Why Is It Clear?"](https://youtu.be/FnDP1sjKGfU) 1.69M.
- **Korean coverage:** It already exists in Korean: [사물궁이 잡학지식 "유리는 왜 투명하고 잘 깨질까?"](https://youtu.be/CkqxHhdmlZk)
  (why is glass transparent and easy to break?) 72K,
  [이과형's Short "당신이 몰랐던 투명의 비밀!"](https://youtube.com/shorts/0-zr8BVL5xo)
  (the secret of transparency you didn't know!) 53K (content not checked).
- **45-second trap:**
  - "Light passes through the gaps between atoms" is wrong.
  - "It's transparent because it's amorphous" is wrong too; quartz crystal
    is transparent as well. What being amorphous does is remove scattering
    at crystal grain boundaries.
  - "You don't tan through a window" is an overstatement. Window glass
    blocks UVB but lets most UVA through.
- **Production:** New: an energy ladder, photon arrows.

### Q6. Glow-in-the-dark stickers glow for hours (science)
- **Title draft:** 야광 스티커는 불을 꺼도 왜 한참 빛날까?
- **Hook:** "불 끈 방 천장의 야광 별, 몇 시간이나 빛나죠. 빛을 어디에 저장해 둔 걸까요?"
- **Key picture:** An energy-level diagram. Electrons raised by light get
  stuck in "trap" levels made by defects, then room-temperature heat frees
  them one by one and they give off light. The brightness curve falls fast
  at first, then slowly. Warming it makes it glow brighter and for less
  time.
- **Evidence:** English: [Mystery Science](https://youtu.be/5sZIysEQWxw) 1.33M (for children),
  [How Do Toys Glow in the Dark?](https://youtu.be/PkO9xFd_BqM) 388K.
- **Korean coverage:** In Korean, [은근한 잡다한 지식](https://youtu.be/DzmpNuW1yU0) 66K.
- **45-second trap:**
  - The textbook "forbidden triplet transition" explanation is about
    organic phosphorescence. Today's glow stickers (SrAl₂O₄:Eu,Dy) work by
    heat releasing electrons from defect traps.
  - It's different from glow sticks (chemiluminescence).
  - Mixing it up with the radium (radioactive) glow of old watches is wrong.
- **Production:** New: energy levels with traps, a decay curve.

## On hold: already covered in Korean (2026-09-26)

Seen in the same search but dropped from the 002 candidates because they
already exist in Korean. Under the rule that common topics are fine (channel
taste), they can become candidates again.

- A lunar birthday lines up with the solar calendar every 19 years: common
  knowledge, widely known in Korea.
- Hangul can write 11,172 syllables: trivia that comes up every Hangul Day.
- The gap at curved platforms (chord and arc): a Korean Short with the same
  explanation, [18K](https://youtube.com/shorts/I4xc6yj5c1M).
- Why only the West Sea has a large tidal range (amphidromic points): the
  basic explanation is textbook, and the English response is weak too.
- Why buses bunch up: the English response is weak, and there are two
  recent Korean videos.
- Why spring wire has a round cross-section: a Korean Short, [61K](https://youtube.com/shorts/TWilFR5UicE).
- Tensegrity table: in Korean, [KLAB 1.19M](https://youtu.be/CcK7uibMDQo) and
  many more.
- Ackermann steering: a Korean Short, [280K](https://youtube.com/shorts/Osxm9bUU-UA).
- Why spaghetti won't break in two: several small Korean Shorts (top 7.4K)
  and YTN.
- Why the sky isn't purple: in Korean, [43K](https://youtu.be/XP_2XPniyVk).
- A knife cuts better slicing than pressing: a Korean Short, [2.41M](https://youtube.com/shorts/FO6FOOpukls).
- Why fusion in stars stops at iron: it's in the earth science textbook, and
  there's also a Korean explanation of the binding energy curve,
  [82K](https://youtu.be/lQzbRMaJp1E). The English response is weak too
  (direct searches top out under 10K).
- LED color is set by the band gap: the light-emitting diode unit of
  Physics I, and Veritasium's blue LED video in Korean has [587K](https://youtu.be/zlskLctQeAQ).
- Why mercury is liquid (relativity): a Korean Short, [190K](https://youtube.com/shorts/zh2-vcgC4lg).
- Why there are no green stars: a Korean Short, [200K](https://youtube.com/shorts/lK5x9d9PR1M).
- Why a remote's light shows only on a phone camera: several small Korean
  Shorts (top 1.2K) give the same explanation.
- The demo of iron not sticking to a magnet at 770 °C (Curie temperature): a
  Korean Short, [1.86M](https://youtube.com/shorts/RC1hZWwv1SA). Used only
  as Q1's hook.

## Rejected

- 2026-09-26, the human's reason: "already known, common in Korea too". The
  human's original words were "다 아는 얘기 (내가 아는 얘기) 이기도 하고
  뭔가 흔한거 같기도 하고" ("it's something everyone knows (something I
  know), and it also kind of seems common").
  - Guessing one in a million with twenty questions (binary search, 2^20)
  - Why steel bridges are full of triangles (truss rigidity)
  - The birthday paradox (23 people, 253 pairs)
  - Why honeycombs are hexagonal (tiling the plane, minimal perimeter). A Korean [960K Short](https://youtube.com/shorts/zW_9Taq--40).
