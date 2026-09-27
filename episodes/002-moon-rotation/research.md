# 리서치 · 002 달은 자전할까

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과). 인용문은 모두 원문 텍스트를 내려받아 코드로 대조했다.

## Sources

접속일은 모두 2026-09-27.

**1차 출처 (데이터·논문·기술 문서)**

- **[S1]** NASA NSSDCA (David R. Williams), "Moon Fact Sheet", 2024-01-11 수정.
  <https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html>
- **[S2]** NASA NSSDCA (David R. Williams), "Earth Fact Sheet", 2024-11-15 수정.
  <https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html>
- **[S9]** Caitlin Ahrens (NASA Goddard), "Lunar Length of Day", NASA NTRS
  20205008686, 2020-10-14.
  <https://ntrs.nasa.gov/api/citations/20205008686/downloads/Caitlin_Lunar%20Length%20of%20Day_paper.pdf>
- **[S10]** James G. Williams, Dale H. Boggs, J. Todd Ratcliff (JPL), "Lunar
  Tidal Recession", 47th Lunar and Planetary Science Conference (2016), 초록 1096.
  <https://www.hou.usra.edu/meetings/lpsc2016/pdf/1096.pdf>
  - 1970년 3월–2015년 9월 달 레이저 거리 측정(LLR) 자료 분석. 같은 분석의
    학술지 논문(Williams & Boggs 2016, *Celestial Mechanics and Dynamical
    Astronomy* 126, 89–129)은 Springer와 ADS가 자동 접속을 막아 열지 못했다.
- **[S12]** F. R. Stephenson, L. V. Morrison, C. Y. Hohenkerk, "Measurement of
  the Earth's rotation: 720 BC to AD 2015", *Proceedings of the Royal Society A*
  472: 20160404, 2016. <https://doi.org/10.1098/rspa.2016.0404>
  (오픈 액세스. 본문은 Europe PMC 전문 XML
  <https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5247521/fullTextXML>로 읽었다.)

**NASA 해설 페이지**

- **[S3]** NASA Science (글 Tracy Vogel), "Tidal Locking", 2023-06-06 게시,
  2026-07-23 수정. <https://science.nasa.gov/moon/tidal-locking/>
- **[S4]** NASA Scientific Visualization Studio, "The Moon's Rotation", 2021-06-28.
  <https://science.nasa.gov/resource/the-moons-rotation/>
- **[S5]** NASA Science, "Moon Facts", 2026-02-12 수정. <https://science.nasa.gov/moon/facts/>
- **[S6]** NASA Science, "Moon Phases", 2026-08-03 수정.
  <https://science.nasa.gov/moon/moon-phases/>
- **[S7]** NASA Science, "Moon Viewing Tips", 2026-02-18 수정.
  <https://science.nasa.gov/moon/viewing-tips/>
- **[S8]** NASA SVS (Ernie Wright), "Moon Phase and Libration, 2026", 2025-12-11.
  <https://svs.gsfc.nasa.gov/5587/>
- **[S11]** NASA JPL News, "The Apollo Experiment That Keeps on Giving", 2019-07-24.
  <https://www.jpl.nasa.gov/news/the-apollo-experiment-that-keeps-on-giving/>

**2차 출처**

- **[S13]** Wikipedia, "Libration", 2026-07-13 판 (rev 1363912104).
  <https://en.wikipedia.org/wiki/Libration>
- **[S14]** Wikipedia, "Far side of the Moon", 2026-08-20 판 (rev 1370260826).
  <https://en.wikipedia.org/wiki/Far_side_of_the_Moon>
- **[S15]** Wikipedia, "Tidal locking", 2026-08-31 판 (rev 1372352875).
  <https://en.wikipedia.org/wiki/Tidal_locking>

**열었지만 쓰지 않은 출처**

- OpenStax, *Astronomy 2e* §4.5 "Phases and Motions of the Moon": 내용은 위와
  같지만, 페이지가 이 책을 허가 없이 생성형 AI에 넣지 말라고 적고 있어서 인용하지 않았다.
- 열지 못함: UKHO의 S12 해설 페이지(503), NSSDCA Luna 3 페이지(오류), NASA Space Place(접속 실패).

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | 달은 자전한다. "달은 자전하지 않는다"는 오래된 오해다. 달은 공전과 같은 빠르기로 자전해서(동주기 자전) 늘 같은 반구가 지구를 향한다. | S4 "An enduring myth about the Moon is that it doesn't rotate. While it's true that the Moon keeps the same face to us, this only happens because the Moon rotates at the same rate as its orbital motion, a special case of tidal locking called synchronous rotation."; S3 "Earth's Moon rotates, but it takes precisely as long for the Moon to spin on its axis as it does to complete its monthly orbit around Earth."; S5 "The Moon is rotating at the same rate that it revolves around Earth (called synchronous rotation), so the same hemisphere faces Earth all the time."; S6 "it spins on its axis exactly once each time it orbits our planet" | 2D 모형: 공전 방향으로 한 번 공전에 한 번 자전하면 지구를 향하는 점이 궤도 내내 그대로 |
| C2 | 별을 기준으로 달의 자전 주기와 공전 주기는 둘 다 약 27.3일이다(27.32일). | S1 "Revolution period (days) 27.3217" / "Sidereal rotation period (hrs) 655.720"; S9 "the amount of time the Moon takes to complete one turn on its axis with respect to the stars is 27.3 days"; S9 표 1 "Sidereal 27.321661 Fixed star - fixed star"; S6 "It takes about 27.3 days to complete a revolution" | 655.720 h ÷ 24 ≈ 27.3217 d, 공전 27.3217 d와 0.0001일 안쪽으로 같다 |
| C3 | 보름달에서 다음 보름달(삭에서 다음 삭)까지는 약 29.5일로 27.3일보다 약 2.2일 길다. 그동안 지구와 달이 함께 태양 둘레를 돌아서, 달이 같은 위상으로 돌아오려면 조금 더 돌아야 하기 때문이다. 달 하늘에서 해가 같은 자리로 돌아오는 달의 하루도 29.5일이다. | S1 "Synodic period (days) 29.53"; S6 "(It takes about 27.3 days to complete a revolution, but 29.5 days to change from new moon to new moon.)"; S9 "Since the Earth-Moon system travels around the Sun at the same time, the Moon must travel further to return to the same phase."; S9 "the amount of time it takes for the Sun to return to the same position in the sky is called a synodic day, which is 29.5 days. That extra 2.2 days is the extra angular distance that the Moon must travel to position itself in the same point in the sky"; S9 표 1 "Synodic 29.530589 New moon - new moon"; S2 "Sidereal orbit period (days) 365.256" | 1/(1/27.321661 − 1/365.256) ≈ 29.5306 d (표의 29.530589와 일치), 차이 ≈ 2.2 d |
| C4 | 달이 자전하지 않는다면(별에 대해 방향이 고정) 지구를 향하는 면이 공전하는 내내 바뀌어, 한 번 공전하는 동안 모든 쪽이 한 번씩 지구를 향한다. 반 바퀴(약 13.7일) 뒤에는 지금의 뒷면 쪽이 지구를 향한다. | S15 그림 설명 "At left, tidally locked, the Moon rotates at the same rate it orbits the Earth, keeping the same face toward the planet. At right, not tidally locked, if the Moon did not rotate then the face would change over the course of an orbit."; S3 그림 설명 (자전이 공전보다 빠른 경우) "If you watch the purple dot, you will notice that the entire Moon can be seen from Earth." | 2D 모형: 자전하지 않으면 지구를 향하는 점이 한 번 공전에 정확히 한 바퀴(360°) 돈다. 27.3217 ÷ 2 ≈ 13.7 d 뒤 180° |
| C5 | (계산으로 끌어낸 주장, 이것을 직접 말하는 출처는 읽지 못했다) 햇빛까지 따지면: 달의 모양(위상)은 해·지구·달의 배치로 정해지고 자전과는 상관없다. 자전하지 않는 달은 해가 비추는 쪽이 1년에 한 바퀴만 돈다(그 달의 하루는 1년). 그래서 한 달(보름달에서 다음 보름달까지) 동안 햇빛 속에서 지구에서 보이는 곳은 적도 둘레의 절반 남짓(약 54–58%, 언제부터 세느냐에 따라)이다. 보름달에 보이는 얼굴이 한 달에 약 29°씩 돌아가서, 둘레 전체를 햇빛 속에서 한 번씩 보려면 약 6–7개월이 걸린다. 지금의 달(동주기 자전)은 아무리 기다려도 절반이다(칭동을 빼면). | S6 "The Moon is always half-lit by the Sun. Like Earth, it has a day side and a night side, which change as the Moon rotates."; S5 "As the Moon orbits Earth, different parts are in sunlight or darkness at different times. The changing illumination is why, from our perspective, the Moon goes through phases."; S5 "And a ‘new moon’ occurs when the far side of the Moon has full sunlight, and the side facing us is having its night." (나머지는 계산) | 2D 모형(원 궤도, 적도면), 시작 위상을 15°씩 24가지로 바꿔 가며: 자전 안 함 → 삭망월(29.5306 d) 동안 54–58%, 둘레 전체는 182–205 d(6.0–6.7개월). 보름달 얼굴 이동 360 × 29.53/365.256 ≈ 29.1°/삭망월, 180° 도는 데 ≈ 6.2삭망월. 동주기 자전 → 1년 내내 50% |
| C6 | 늘 "같은 면"은 정확히 같은 면이 아니다. 궤도가 타원이라 공전 속도는 빨라졌다 느려졌다 하지만 자전 속도는 일정해서, 한 달 동안 동쪽과 서쪽 가장자리 너머가 조금씩 더 보인다(경도 칭동, 최대 약 7.9°). 달의 적도면이 공전 궤도면과 약 6.7° 어긋나 있어서(자전축이 궤도면에 수직인 방향에서 약 6.7° 기울어서) 남극·북극 너머도 조금 더 보인다(위도 칭동, 최대 약 6.8°). 이 흔들림을 칭동이라 한다. | S8 "The Moon always keeps the same face to us, but not exactly the same face. Because of the tilt and shape of its orbit, we see the Moon from slightly different angles over the course of a month."; S8 "This wobble is called libration."; S6 "Because the Moon's orbit is not perfectly circular, its distance from Earth and its speed in orbit both change slightly throughout the month. The Moon's rate of rotation around its own axis, though, always stays the same."; S13 "Libration in longitude results from the eccentricity of the orbit of the Moon around the Earth; the Moon's rotation sometimes leads and sometimes lags its orbital position." / "It can reach 7°54′ in amplitude." / "Libration in latitude results from the Moon's axial tilt (about 6.7°) between its rotation axis and orbital axis around Earth." / "It can reach 6°50′ in amplitude."; S1 "Orbit eccentricity 0.0549" / "Obliquity to orbit (deg) 6.68" | 7°54′ ≈ 7.9°, 6°50′ ≈ 6.8°. 6.7° ≈ 5.145°(궤도 경사, S1) + 1.5427°(S13) ≈ 6.69°, S1의 6.68°와 0.01° 안쪽. 이심률만으로 계산한 경도 칭동의 주항은 2e ≈ 6.3°라서, 최대치 7.9°에는 다른 효과도 들어 있다 |
| C7 | 칭동 덕분에 오랜 기간에 걸쳐 모으면 달 표면의 약 59%를 지구에서 볼 수 있다. 뒷면 중 약 18%는 가끔 보이고, 나머지 82%는 1959년까지 아무도 보지 못했다. | S7 "Experienced observers can take advantage of favorable librations to see about 59 percent of the lunar surface."; S13 "slightly more than half (about 59% in total) of the Moon's surface is seen from Earth because of libration"; S14 "In total, 59 percent of the Moon's surface is visible from Earth at one time or another."; S14 "About 18% of the far side is occasionally visible from Earth due to oscillation and to libration. The remaining 82% remained unobserved until 1959, when it was photographed by the Soviet Luna 3 space probe." | 50% + 18% × 50% = 59% (S14의 두 숫자가 서로 맞는지만 확인). 모형: 지구를 향하는 점이 ±7.9° × ±6.8° 안 어디에나 올 수 있다고 하면 ≈ 57.9%, 일주 칭동(≈ 0.95°)을 더하면 ≈ 58.7%로 59%와 어긋나지 않는다(두 흔들림이 동시에 최대인 모서리까지 넣은 상한). 두 흔들림은 약 6년마다 다시 겹친다(S9 표 1의 근점월 27.554551 d, 교점월 27.21222 d의 맥놀이). 한순간에 보이는 것은 ≈ 49.8% |
| C8 | 뒷면은 "어두운 면"이 아니다. 뒷면도 앞면처럼 낮과 밤이 번갈아 오고(대부분의 곳에서 약 2주 낮, 2주 밤), 평균적으로 거의 같은 양의 햇빛을 받는다. 삭(신월) 때는 뒷면이 해를 정면으로 받고 지구 쪽 면이 밤이다. "어두운 면"을 햇빛이 안 드는 면으로 이해하면 틀리고(NASA는 "misleading"), 이 말의 "어두운"은 "보이지 않는"이라는 뜻이다. | S5 "Some people call the far side – the hemisphere we never see from Earth – the ‘dark side’, but that's misleading."; S5 "And a ‘new moon’ occurs when the far side of the Moon has full sunlight, and the side facing us is having its night."; S14 "The far side has sometimes been called the ‘dark side of the Moon’, where ‘dark’ means ‘unseen’ instead of ‘unilluminated’." / "the phrase ‘dark side of the Moon’ does not refer to ‘dark’ as in the absence of light, but rather ‘dark’ as in unseen"; S14 "each location on the Moon experiences two weeks of sunlight while the opposite location experiences night"; S14 "In reality, both the near and far sides receive, on average, almost equal amounts of light directly from the Sun."; S6 "The new Moon rises and sets with the Sun, but is not visible in the daytime sky because the night side (unlit side) of the Moon faces towards Earth." | 달의 하루 29.5 d(C3)의 절반 ≈ 14.8 d ≈ 2주 |
| C9 | 사람이 달 뒷면을 처음 본 것은 1959년 소련 탐사선 루나 3호가 찍은 사진으로다(1959년 10월 7일, 뒷면의 일부). 눈으로 직접 본 첫 사람들은 1968년 12월 달 궤도를 돈 아폴로 8호 우주인이다. | S5 "Humans didn't see the lunar far side until a Soviet spacecraft flew past in 1959."; S14 "On 7 October 1959, the Soviet probe Luna 3 took the first photographs of the lunar far side" / "covering one-third of the surface invisible from the Earth"; S14 "The Apollo 8 astronauts were the first humans to see the far side in person when they orbited the Moon in December of 1968." | – |
| C10 | 두 주기가 같은 것은 우연이 아니라 조석 고정 때문이고, 흔한 일이다. 태양계의 큰 위성은 모두 자기 행성에 조석 고정되어 있다. 명왕성과 위성 카론은 서로에게 고정되어 있다. | S3 "This phenomenon, called ‘synchronous tidal locking,’ sounds like a weird coincidence ― but it's actually quite common. All the solar system's large moons are tidally locked with their planets."; S15 "All nineteen known moons in the Solar System that are large enough to be round are tidally locked with their primaries"; S3 "Pluto and its moon Charon (grey) have already become tidally locked to one another" | – |
| C11 | 조석 고정의 원리. 지구 중력은 달을 지구 방향으로 살짝 늘인다(지구 쪽과 그 반대쪽으로 부푼다). 달이 공전보다 빨리 돌던 때에는 부풀음이 솟았다 가라앉는 데 시간이 걸려서, 부풀음이 자전에 끌려가 늘 지구 방향보다 자전 방향으로 조금 앞서 있었다. 지구 중력이 이 어긋난 부풀음을 제자리로 끌어당기면서 자전이 느려졌고, 자전 한 바퀴가 공전 한 바퀴와 같아지자 부풀음이 더는 움직이지 않아 자전 속도도 더 변하지 않았다. 달은 지금도 지구 쪽으로 살짝 길쭉하다(럭비공 모양). | S3 "Earth's gravitational pull distorts the Moon into a slight football shape even today, but this distortion would have been much more dramatic when the Moon was both closer to Earth and less solid."; S3 "The part of the Moon that was pulled toward Earth would have shifted as the Moon spun, but always at a delay, since it takes time for so much material to rise and then later fall. This means the Moon's bulge was always a little out of alignment with Earth, yet always being pulled toward alignment by gravity."; S3 "As the energy dissipated, the Moon's rotation slowed until a single spin on its axis took the same amount of time as one trip around Earth. In this state, the bulge on the Moon was no longer shifting relative to the Earth, therefore no more energy needed to be dissipated by this particular process, and the spin rate stopped changing."; S15 "The change in rotation rate necessary to tidally lock body B to the larger body A is caused by the torque applied by A's gravity on bulges it has induced on B by tidal forces." / "The body of object B will become elongated along the axis oriented toward A" / "If B's rotation period is shorter than its orbital period, the bulges are carried forward of the axis oriented toward A in the direction of rotation" / "The net resulting torque from both bulges, then, is always in the direction that acts to synchronize B's rotation with its orbital period, leading eventually to tidal locking."; S11 "In a similar way, Earth's gravity tugs on the Moon, causing two tidal bulges of the lunar rock." | – |
| C12 | 달은 태어났을 때 훨씬 빨리 돌았고, 자전은 곧 공전과 맞춰졌다. 큰 위성은 수십만 번 공전하기 전에 이렇게 고정된다. | S3 "The hot, molten object that coalesced from the ejected material would have been spinning wildly"; S3 "The bigger moons synchronize early in their existence, within hundreds of thousands of orbits."; S3 "As energy leaves the system, the moon's rotation very quickly synchronizes with its orbit around its host planet." | – |
| C13 | 지구도 같은 일을 겪는 중이다. 달이 지구 바다에 만든 부풀음은 물이 움직이는 데 시간이 걸려 달 방향과 딱 맞지 않고, 지구 자전 방향(동쪽)으로 조금 앞서 있다. 이 부풀음과 달이 서로 당기는 힘이 지구 자전을 늦추고(하루가 길어진다), 달을 공전 방향으로 끌어 달이 멀어진다. | S3 "The energy propelling it away comes primarily from Earth's oceans, which both bulge out in response to the Moon's gravity and exert a gravitational pull of their own on the Moon. Earth's bulging oceans don't exactly match up with the position of the Moon, they're always a little out of sync because it takes time for all that water to shift and pile up. This interaction does two things: it creates friction that slows Earth's own rotation, and creates forces that change the Moon's orbital speed, causing it to fall farther away into space."; S11 "The highest tide is east of the Moon."; S11 "The gravitational force between the tidal bulges and the Moon pull against and slow Earth's rotation while also pulling the Moon forward along the direction it moves in its orbit about Earth."; S10 "The majority of the terrestrial tidal dissipation takes place in the oceans"; S10 "As a result of the loss of energy and angular momentum, the Earth's spin is decreasing." | – |
| C14 | 달은 해마다 약 3.8 cm씩 지구에서 멀어진다. 아폴로 11·14·15호 우주인이 달에 두고 온 반사경에 레이저를 쏘아, 빛이 돌아오는 시간으로 거리를 재서 얻은 측정값이다(1970–2015년 자료로 38.30 ± 0.09 mm/년. 이 분석에는 아폴로 반사경 3개와 소련 루노호트 탐사차의 반사경 2개, 모두 5개가 쓰였다). 100년이면 약 3.8 m, 아폴로 11호(1969년) 뒤로 2026년까지 약 2.2 m다. | S10 "Ranges are measured by firing a laser pulse from an observatory on the Earth that strikes retroreflectors on the Moon and bounces back to the Earth. The Moon is receding from the Earth by 38 mm/yr due to tides"; S10 "da/dt = 38.30±0.09 mm/yr"; S10 "20,218 ranges extending from March 1970 to September 2015" / "Ranges to 5 retroreflectors at different lunar sites"; S13 "The placement of three retroreflectors on the Moon by the Lunar Laser Ranging experiment and two retroreflectors by Lunokhod rovers"; S11 "Along with the Apollo 11 astronauts, those of Apollo 14 and 15 left arrays behind as well"; S11 "measuring the time that it takes for a laser pulse to bounce off the reflectors and return to Earth"; S11 "lunar laser ranging has accurately shown that the distance between the two increases by 1.5 inches (3.8 centimeters) a year."; S1 "Recession rate from Earth (cm/yr) 3.8"; S3 "The Moon continues to move away from Earth at a rate of about an inch-and-a-half (4 cm) per year" | 38.30 mm ≈ 3.8 cm, 1.5 in ≈ 3.8 cm. 100년 ≈ 3.8 m, 한 달 ≈ 3.2 mm(S11 "0.1 inches (3 millimeters) each month"), 1969–2026년 57년 ≈ 2.2 m |
| C15 | 지구의 하루는 아주 조금씩 길어진다. 조석 마찰만으로 계산하면 100년에 약 2.3–2.4 ms(밀리초, 1000분의 1초)씩이고, 기원전 720년–2015년의 일식·엄폐 기록으로 잰 실제 평균은 100년에 약 1.8 ms(+1.78 ± 0.03)다. 실제가 더 작은 것은 다른 원인이 반대로 작용하기 때문이며, 마지막 빙하기 뒤 극지방 얼음이 줄어 땅이 되튀어 오르는 효과가 그 일부로 꼽힌다. 이 평균 추세 위로 수십 년–수백 년 단위의 들쭉날쭉이 있다. | S12 "the change in the length of the mean solar day (lod) increases at an average rate of +1.8 ms per century. This is significantly less than the rate predicted on the basis of tidal friction, which is +2.3 ms per century. Besides this linear change in the lod, there are fluctuations about this trend on time scales of decades to centuries."; S12 "+1.78±0.03 ms cy"; S12 "This non-tidal acceleration is probably in part associated with the rate of change in the Earth's oblateness attributed to viscous rebound of the solid Earth from the decrease in load on the polar caps following the last deglaciation"; S10 "The length of day is predicted to increase by 2.39 msec each century from tidal dissipation."; S10 "increases the length of day by 2.395 msec each century" | S12 식 (1.3)의 조석 감속 −6.16 × 10⁻²² rad/s² → LOD²/(2π) × 6.16 × 10⁻²² × 1세기 ≈ 2.31 ms. 비조석 +1.5 × 10⁻²²를 더하면 ≈ 1.75 ms(관측 +1.78과 오차 범위 안). 1.8 ms/100년 ≈ 18 µs/년 |
| C16 | 지구가 달에 조석 고정되려면 약 500억 년이 걸린다. 그 전에 태양이 먼저 수명을 다하므로 실제로는 일어나지 않을 것으로 본다. | S3 "About 50 billion years from now ― if the Moon and Earth could somehow avoid the eventual death of the Sun ― the Moon would be so far away, and its orbit so large, that Earth would also tidally lock to the Moon."; S15 "However, Earth is not expected to become tidally locked to the Moon before the Sun becomes a red giant and engulfs both." | – |

## Easy to misstate

- "달은 자전하지 않는다" ✗ → "달도 자전한다. 공전과 같은 빠르기라서 지구에서는 안 도는
  것처럼 보일 뿐" ✓ (C1). 자전은 별을 기준으로 잰다. 지구에 대해서는 늘 같은 쪽을 보이니
  "지구에서 보면 안 도는 것 같다"는 말은 맞고, 그게 바로 동주기 자전이다.
- **자전 주기는 27.3일(별 기준)이다.** "달은 29.5일에 한 바퀴 자전한다", "29.5일에
  지구를 한 바퀴 돈다" ✗. 29.5일은 위상이 한 바퀴 도는 삭망월이자, 해를 기준으로 한 달의
  하루다(C3). 29.5일을 쓸 땐 "보름달에서 다음 보름달까지"라고 쓴다. S5의 "the Moon
  appears to orbit us every 29 days"와 그 이유("rotating on its axis as it orbits the
  Sun")는 따라 쓰지 않는다. 차이의 원인은 지구가 태양 둘레를 도는 것이지 지구의 자전이 아니다.
- "정확히 한 바퀴"는 **평균으로** 맞다(S3 "precisely", S6 "exactly"). 공전 속도는 타원
  궤도 때문에 달라지고 자전 속도는 일정해서, 순간순간 딱 맞지는 않는다(C6). "자전과 공전
  속도가 매 순간 같다" ✗.
- **늘 "같은 면"은 거의 같은 면이다.** "뒷면은 지구에서 전혀 안 보인다", "딱 절반만 보인다"
  ✗ → "뒷면 대부분은 지구에서 안 보인다", "오랜 기간 모으면 약 59%" ✓ (C6, C7). 59%는
  여러 달이 아니라 여러 해에 걸쳐 모은 값이다(두 흔들림이 다시 겹치는 데 약 6년, C7 계산).
  한 번에 보이는 건 절반이 채 안 된다. "한 번에 59%" ✗.
- 위도 칭동의 약 6.7°는 달의 **적도면과 공전 궤도면 사이** 각도(= 자전축과 궤도면에
  수직인 방향 사이)다(S13, S1 6.68°). "자전축이 궤도면에 대해 6.7° 기울었다" ✗: 지구
  자전축을 "공전 궤도면에 대해 66.5°"로 배운 시청자에게는 자전축이 궤도면에 거의 누운
  것으로 들린다. S6은 이를 "The 5 degree tilt of the Moon's orbit"로 설명하는데, 5°는
  궤도가 황도면에 기운 각도라 다른 각도다. 대본에서는 "궤도가 타원이고 자전축이 조금
  기울어 있어서" 정도로 쓴다(S8).
- **"자전을 안 하면 뒷면이 보인다"의 뜻을 좁힌다 (C4, C5).** "자전하지 않으면 뒷면도
  지구 쪽으로 돌아온다", "모든 쪽이 차례로 지구를 향한다" ✓. "자전을 안 했다면 우리는 달
  뒷면도 봤을 것이다" ✓ (기간을 못박지 않으면 맞다). 하지만 "한 달이면 뒷면까지 전부
  보인다"는 햇빛을 따지면 맞지 않는다. 자전하지 않는 달은 해가 비추는 쪽이 한 달 사이 거의
  그대로여서, 한 달에 햇빛 속에서 보이는 곳은 절반 남짓이고 전부 보려면 6–7개월이 걸린다.
  어느 쪽이 밤에 지구를 향할지는 언제부터 세느냐에 달려서, 몇 주 안에 뒷면 쪽이 햇빛 속에
  보이는 달도 있다. 밤인 쪽도 "안 보인다"가 아니라 "햇빛 속에서는 못 본다"이다(지구가
  비추는 빛으로 희미하게 보일 수 있다, S7 "During its crescent phase in the twilight or
  dawn, you can also sometimes see the dark portion of the Moon glowing faintly in the
  sunlight that reflects off Earth, an effect called earthshine."). C5는 계산으로만
  뒷받침되니, 대본이 이 내용을 직접 말하려면 수치 대신 "몇 달에 걸쳐" 정도로 쓴다.
- 그림에서 자전하는 달은 **공전과 같은 방향으로** 돌아야 한다. 반대로 돌면 한 번 공전하는
  동안 지구를 향하는 면이 두 바퀴 돈다(verify.py C1/C4 검사). 자전하지 않는 달은 무늬가
  화면(별) 기준으로 늘 같은 방향을 향한다 ✓.
- **"어두운 면"**: "뒷면은 늘 어둡다", "해가 안 든다" ✗ → "뒷면도 낮과 밤이 있고 햇빛을
  거의 똑같이 받는다" ✓ (C8). 이름 자체를 "틀린 말"이라 하기보다 "오해를 부르는
  이름"(NASA "misleading")이 정확하다. 이 말의 "dark"는 "보이지 않는"이라는 뜻이다(S14).
  "원래는 …라는 뜻이었다"처럼 말의 역사를 단정하지는 않는다(S14는 역사를 다루지 않는다).
  햇빛 양은 "거의 같다"(S14 "almost equal")이지 "정확히 같다"가 아니다. "어느 곳이든
  2주 낮, 2주 밤"도 극지방에는 맞지 않을 수 있으니 "대부분"을 붙인다.
- 루나 3호는 뒷면을 **처음** 찍었지만 **전부** 찍지는 않았다(S14 "covering one-third of
  the surface invisible from the Earth"). "루나 3호가 뒷면 전체를 찍었다" ✗.
- "지구와 달은 서로 조석 고정되어 있다" ✗ (S5의 "The Earth and Moon are tidally
  locked"는 느슨한 표현이다). 고정된 것은 달 쪽뿐이다. 지구가 고정되려면 약 500억 년이
  걸려 태양이 먼저 끝난다(C16). 서로 고정된 예는 명왕성과 카론이다(C10).
- **조석 고정 ≠ 자전이 멈춤.** "달의 자전이 멈췄다", "지구가 달을 붙잡아 못 돌게 했다" ✗
  → "자전이 늦춰져 공전과 같은 빠르기가 됐다" ✓ (C11). 달은 처음에 더 빨리 돌았다(C12).
  "원래 안 돌던 달을 지구가 돌렸다" ✗. 원리를 "무거운 쪽이 지구를 향한다"로 설명하지
  않는다. 읽은 출처는 모두 조석 부풀음으로 설명한다.
- **부풀음의 방향**: 빨리 돌던 달의 부풀음은 지구 방향보다 **자전 방향으로 앞서** 있었다
  (S15 "carried forward of the axis oriented toward A in the direction of rotation").
  S3의 "at a delay"는 시간으로 늦다는 뜻이고, 그 사이 자전이 부풀음을 앞으로 끌고 가서
  위치로는 앞선다. 지구 바다의 부풀음도 달보다 앞(동쪽)에 있다(S11 "The highest tide is
  east of the Moon."). 그림에서 부풀음을 뒤로 처지게 그리면 ✗. "가장 높은 물때는 몇 시간
  뒤" 같은 시간 수치는 지역마다 달라서 쓰지 않는다.
- 부풀음은 **지구 쪽과 그 반대쪽 두 곳**이다(S11 "two tidal bulges", S15 "elongated
  along the axis"). 그림에서 지구 쪽만 볼록하게 그리면 틀린 모양이 된다. 지구 방향으로 길쭉한
  타원(럭비공)으로 과장해 그리는 것이 맞다. 달에는 바다(물)가 없으니 달의 부풀음은 **암석**이
  늘어난 것이다. 지구에서 달을 멀어지게 하는 부풀음은 주로 **지구의 바다**다(C13). 지금 달이
  길쭉한 모양의 원인은 단정하지 않는다. 지금의 조석과 옛날에 굳은 모양이 각각 얼마인지는 읽은
  출처가 다루지 않는다.
- **고정되는 데 걸린 시간**: S3는 큰 위성이 "within hundreds of thousands of orbits"
  (공전 수십만 번 안에) 고정된다고 한다. "수십만 년" ✗ (단위가 공전 횟수다). 달에 대해 몇
  년이 걸렸는지 말하는 출처는 읽지 못했으니 연수는 쓰지 않는다.
- **멀어지는 달은 더 느리게 돈다.** "달이 앞으로 당겨져 더 빨리 돈다" ✗ → "더 높은 궤도로
  올라가 한 바퀴 도는 데 더 오래 걸린다" ✓ (S15 "lifting it into a higher orbit", S10
  "dn/dt = –25.97±0.06", 평균 각속도 n이 줄어든다).
- **멀어지는 속도는 약 3.8 cm/년**(레이저 측정, C14). S5의 "about an inch farther away
  each year"(약 2.5 cm)는 측정값과 맞지 않으니 쓰지 않는다. "4 cm"(S3)는 반올림으로 허용.
  이 속도로 45억 년을 거꾸로 계산하지 않는다. 조석 마찰은 대륙 배치에 따라 크게 바뀌고
  지금 배치가 특히 크다(S10 "The present configuration of continents and oceans is very
  effective at tidal dissipation."). 반사경 "5개"는 1970–2015년 분석에 쓰인 수다. 그 뒤로
  새 반사경이 더 놓였을 수 있으니 "달에 있는 반사경은 5개" ✗.
- **하루가 길어지는 속도는 100년 단위다.** "하루가 해마다 2 ms씩 길어진다" ✗ → "100년에
  약 2 ms", "100년에 약 1.8 ms(실측 평균)" ✓ (C15). 1년이면 약 0.018 ms다. 2.3 ms는
  조석 마찰만으로 **계산한** 값이고 1.8 ms가 **잰** 평균이다. S15의 "atomic clocks show
  that Earth's day lengthens, on average, by about 2.3 milliseconds per century"는 S12와
  맞지 않는다(2.3은 계산값이고, 장기 평균은 원자시계가 아니라 옛 일식 기록으로 쟀다). 따라
  쓰지 않는다. 이 추세 위로 수십 년–수백 년 단위의 들쭉날쭉이 있으니(S12) "평균적으로",
  "오랜 세월에 걸쳐"를 붙인다. 윤초와 연결하지 않는다(읽은 출처가 다루지 않는다).
- 하루가 길어지는 것과 달이 멀어지는 것은 **같은 상호작용의 두 결과**다(C13). "달이
  멀어져서 하루가 길어진다"처럼 한쪽이 다른 쪽의 원인인 것처럼 쓰지 않는다.
- "달이 결국 지구를 떠난다", "지구도 곧 달에 고정된다" ✗ (C16).
- 반올림한 값에는 "약"을 붙인다: 27.3일, 29.5일, 59%, 3.8 cm, 1.8 ms, 13.7일.
