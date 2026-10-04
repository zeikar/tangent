# 리서치 · 004 마젠타는 왜 무지개에 없을까

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과). 인용문은 모두 원문 텍스트를 내려받아 코드로 대조했다
(공백 무시, PDF는 줄바꿈 하이픈도 무시). 원뿔세포 곡선과 CIE 1931 등색 함수의 5 nm 표가
`verify.py` 안에 있어서, 스토리보드는 곡선을 그 표로 그리면 된다.

토픽이 요청한 판정을 먼저 적는다.

- **핵심 그림은 선다.** 각 세포를 자기 최대치 1로 맞춘 막대(곡선 그림의 표준 방식)로 보면,
  파장 하나로는 "L과 S가 높고 M이 낮은" 모양이 안 나온다(C5). 정규화와 상관없이 성립하는
  더 단단한 형태는 비율 비교다: 마젠타 혼합과 L:S 비율이 같은 단일 파장(약 483 nm)은 S에 견준
  M이 약 5배다. M의 봉우리가 L과 S 사이에 있기 때문이다(C6). M이 없는 눈에서는
  실제로 그 혼합이 단일 파장과 같은 색이 된다(C20).
- **고칠 곳 1: "막대 색을 섞으면 무지개 색".** L·M·S 막대를 빨강·초록·파랑으로 칠해
  섞으면 500 nm에서 색상이 70° 넘게 어긋난다. 색 칩은 표준 변환으로 따로 계산한다(C18).
- **고칠 곳 2: "무지개에서 찾아보세요".** 하늘의 무지개 안쪽에 생기는 과잉 무지개는 옅은
  분홍·자주빛을 띤다(C13). 영상의 "무지개"는 빛을 파장별로 펼친 띠(스펙트럼, 빨주노초파남보)로
  정의해 두고 쓴다.
- **"L세포가 짧은 파장에 반응해서 보라가 붉다": 뺀다(C16).** 데이터와 문헌 모두 받쳐 주지
  않는다. 관찰("보라 끝은 살짝 붉은 기")까지만 쓸 수 있다.
- **단정해도 되는 색상 문장**은 C8, 원뿔세포 비율 설명이 어디까지 정직한지는 C15, 화면
  한계는 C17(영상에서 말할 필요 없음), "보라"의 두 뜻과 낱말 선택은 C12와 Easy to misstate.

## Sources

접속일은 모두 2026-10-03.

**1차 출처 (원뿔세포 곡선, 표준)**

- **[S1]** Andrew Stockman, Lindsay T. Sharpe, "The spectral sensitivities of the middle- and
  long-wavelength-sensitive cones derived from measurements in observers of known genotype",
  *Vision Research* 40, 1711–1737, 2000. <https://doi.org/10.1016/S0042-6989(00)00021-3>
  - 출판사 판 대신 haralick.org에 올라 있는 PDF 사본을 읽었다(머리글 "Vision Research 40
    (2000) 1711–1737" 확인): <https://www.haralick.org/DV/spectral_sensitivities_of_cones.pdf>.
    텍스트는 pypdf로 뽑았다.
- **[S2]** CVRL (Colour & Vision Research Laboratory, UCL Institute of Ophthalmology), 날짜 표기 없음.
  - "Cone Fundamentals" 페이지와 데이터: <http://www.cvrl.org/cones.htm>. 쓴 표는 Stockman &
    Sharpe (2000) 2° 원뿔세포 곡선, 선형 에너지 단위 1 nm(`linss2_10e_1.csv`)와 5 nm(폼 요청,
    `conerequest_ss2.php`), 로그 광자 단위 1 nm. S 열은 615 nm 위로 비어 있다.
  - 설명 페이지: "Stockman and Sharpe (2000) 2-deg cone fundamentals"
    <http://www.cvrl.org/database/text/cones/ss2_10.htm>, "Cone spectral sensitivities"
    <http://www.cvrl.org/database/text/intros/introcones.htm>, "CIE (2012) 2-deg XYZ
    'physiologically-relevant' colour matching functions"
    <http://www.cvrl.org/database/text/cienewxyz/cie2012xyz2.htm>.
- **[S3]** Andrew Stockman, "Cone fundamentals and CIE standards", *Current Opinion in
  Behavioral Sciences* 30, 87–93, 2019. <https://doi.org/10.1016/j.cobeha.2019.06.005>
  UCL Discovery의 저자 원고 PDF를 읽었다:
  <https://discovery.ucl.ac.uk/10079410/1/Cone%20fundamentals%20and%20CIE.pdf>
  (서지는 Crossref로 확인. 기록 페이지는 403).
- **[S4]** CIE, *CIE S 017:2020 ILV: International Lighting Vocabulary*, 2판, 2020-12. 무료 온라인판
  e-ILV의 용어 페이지 <https://cie.co.at/eilvterm/17-22-040> 형식. 읽은 용어: 17-22-040 colour
  <perceptual>, 17-22-067 hue, 17-22-068 unique hue, 17-22-069 binary hue, 17-22-070 Abney
  phenomenon, 17-23-008 metameric colour stimuli, 17-23-011 monochromatic stimulus, 17-23-056
  spectrum locus, 17-23-057 purple stimulus, 17-23-058 purple boundary, 17-23-062 dominant
  wavelength, 17-23-063 complementary wavelength.
- **[S5]** CIE 1931 2° 등색 함수(x̄, ȳ, z̄), 1 nm 표. CVRL 배포본
  <http://www.cvrl.org/database/data/cmfs/ciexyz31_1.csv>. `verify.py`는 380–780 nm를 5 nm 간격으로 쓴다.
- **[S6]** Michael Stokes, Matthew Anderson, Srinivasan Chandrasekar, Ricardo Motta, "A Standard
  Default Color Space for the Internet - sRGB", Version 1.10, W3C, 1996-11-05.
  <https://www.w3.org/Graphics/Color/sRGB.html> 페이지 머리말이 이 문서는 폐기되었고 sRGB는
  IEC 61966-2-1로 표준화되었으며 그때 작은 반올림 오차를 고쳤다고 적는다. 원색·백색점 좌표는 같다.
- **[S7]** W3C, *CSS Color Module Level 4*, Candidate Recommendation Draft, 2026-09-30.
  <https://www.w3.org/TR/css-color-4/> (§6.1 이름 붙은 색 표).
- **[S8]** Isaac Newton, *Opticks*, 4판(1730, 초판 1704). Project Gutenberg eBook #33504
  <https://www.gutenberg.org/ebooks/33504>. 1권 2부 Prop. IV, Prop. VI. 초판 날짜는 책 앞의
  Advertisement I 서명("April 1, 1704").
- **[S9]** Russell L. De Valois, Karen K. De Valois, Luke E. Mahon, "Contribution of S opponent cells
  to color appearance", *PNAS* 97(1), 512–517, 2000. <https://doi.org/10.1073/pnas.97.1.512>
  PMC 전문 <https://pmc.ncbi.nlm.nih.gov/articles/PMC26694/>. PMC가 curl에는 reCAPTCHA 페이지를
  돌려줘서 브라우저로 열고 본문 텍스트를 저장해 대조했다.
- **[S10]** Ralph W. Pridmore, "When Do Short-Wave Cones Signal Blue or Red? A Solution Introducing
  the Concept of Primary and Secondary Cone Outputs", *PLoS ONE* 11(4), e0154048, 2016.
  <https://doi.org/10.1371/journal.pone.0154048> (PMC4841559). 저자 한 명이 자기 모형을 제안하는
  논문이라, 그 모형이 아니라 문헌 정리와 인용된 실험 결과만 쓴다.
- **[S11]** 국립국어원, 『표준국어대사전』 온라인판. 검색 결과 페이지
  `https://stdict.korean.go.kr/search/searchResult.do?searchKeyword=<낱말>`. 읽은 표제어: 보라,
  보라색, 무지개, 마젠타, 자주, 자줏빛, 자홍, 자홍색, 남색, 분홍, 바이올렛("퍼플"은 표제어 없음).

**2차 출처**

- **[S12]** Wikipedia, "Magenta", 2026-09-28 판 (rev 1377314409). <https://en.wikipedia.org/wiki/Magenta>
- **[S13]** Wikipedia, "Violet (color)", 2026-09-24 판 (rev 1376412630).
  <https://en.wikipedia.org/wiki/Violet_(color)>
- **[S14]** Wikipedia, "Spectral color", 2026-09-18 판 (rev 1375573546).
  <https://en.wikipedia.org/wiki/Spectral_color> (문서 전체에 "more citations" 표시가 있다).
- **[S15]** Wikipedia, "Line of purples", 2026-01-08 판 (rev 1331750623).
  <https://en.wikipedia.org/wiki/Line_of_purples> (역시 "more citations" 표시. 정의는 S4로 받친다).
- **[S16]** Wikipedia, "Rainbow", 2026-09-29 판 (rev 1377405754). <https://en.wikipedia.org/wiki/Rainbow>
- **[S17]** Wikipedia, "Color wheel", 2026-09-03 판 (rev 1372935901). <https://en.wikipedia.org/wiki/Color_wheel>
- **[S18]** Wikipedia, "Opponent process", 2026-09-03 판 (rev 1373043884).
  <https://en.wikipedia.org/wiki/Opponent_process>
- **[S19]** Wikipedia, "Cone cell", 2026-08-29 판 (rev 1371973637). <https://en.wikipedia.org/wiki/Cone_cell>
  인용한 봉우리 범위 문장에는 "citation needed"가 붙어 있다.
- **[S20]** Atmospheric Optics, "Supernumeracy Rainbows", 2024-12-16 갱신.
  <https://atoptics.co.uk/rainbows/supers.htm> Les Cowley가 만든 대기 광학 사이트인데, 지금
  페이지는 저자 표기 없는 블로그판으로 다시 쓰여 있다. 원래 판(old.atoptics.co.uk, Wayback)은 열리지 않았다.
- **[S21]** 한국어 위키백과. "CMYK" (rev 42245756, 2026-08-04), "마젠타" (rev 41588164,
  2026-04-02), "보라색" (rev 30252297, 2021-09-11). <https://ko.wikipedia.org/wiki/CMYK> 등.
  "보라색"은 두 뜻을 한 문장에 섞은 예로만 쓴다(Easy to misstate).

**열지 못했거나 읽지 않은 출처**

- CIE 170-1:2006 (원뿔세포 기본 곡선 표준) 원문: 유료. S2·S3의 설명만.
- IEC 61966-2-1 (sRGB 표준) 원문: 유료. S6(1996 제안서)의 원색·백색점 좌표를 쓴다.
- KS A 0011 (물체색의 색이름): 원문을 열지 못했다. 한국어 색이름은 S11만 근거로 한다.
- Oh & Sakata, "Do the short-wave cones signal blueness?", *Color Research & Application* 40,
  323–328, 2015: 읽지 못했다. 결과는 S10의 요약.
- Hurvich & Jameson (1955), Ingling (1977, 1982), Machado et al. (2009, S13이 인용): 읽지 못했다.
- CIE 표준광 D65 분광 분포 표(files.cie.co.at): 404. 그래서 흰빛 계산(C16, C19)은 같은 에너지
  흰빛(모든 파장 같은 세기)으로 했다.

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | 색을 느끼는 원뿔세포는 보통 세 가지이고, 가장 잘 반응하는 파장이 긴 쪽·중간·짧은 쪽이라서 L, M, S라고 부른다. 반응 곡선의 봉우리는 S 약 440 nm, M 약 540 nm, L 약 570 nm다(눈에 들어오는 빛 기준, CIE가 표준으로 삼은 Stockman–Sharpe 곡선). 봉우리 위치는 사람마다 몇 nm씩 다르다. | S1 "They are referred to as long-, middle- and short-wavelength-sensitive (L, M and S), according to the relative spectral positions of their peak sensitivities."; S3 "the Commission Internationale de l' Éclairage (CIE) has sanctioned the cone spectral sensitivity estimates of Stockman & Sharpe [1]"; S3 "Note that the fundamental cone spectral sensitivities express the sensitivity of the cones in terms of the light entering the eye"; S2 "The functions are normalized to peak at unity at the nearest 0.1 nm step."; S19 "The peak wavelengths of L, M, and S cones occur in the ranges of 564–580 nm, 534–545 nm, and 420–440 nm, respectively, depending on the individual." | CVRL 1 nm 표: 에너지 단위 L 570, M 543, S 442 nm, 광자 단위 L 566, M 541, S 441 nm. 10 nm로 반올림하면 둘 다 570, 540, 440. `verify.py`는 5 nm 표에서 ±3 nm 안을 확인 |
| C2 | 원뿔세포 하나는 파장을 모른다. 빛 알갱이(광자)를 흡수하면 파장과 상관없이 같은 반응을 내서, 세포 하나의 반응만으로는 "이 파장의 약한 빛"과 "저 파장의 센 빛"을 가릴 수 없다. 그래서 빛은 세 세포의 반응 세 값으로만 전해지고, 세 값이 같은 두 빛은 파장 구성이 달라도 똑같아 보인다. 파장 하나짜리 빛은 밝기를 바꿔도 세 세포를 같은 비율로 자극한다. | S3 "First, the absorption of a photon is an all-or-nothing event that triggers the same response regardless of photon wavelength."; S3 "light intensity and wavelength are confounded in the photoreceptor output."; S3 "Having three univariant, color-blind cone types with different spectral sensitivities means that lights are represented by just three values: the three cone responses. Pairs of lights that produce the same cone responses must therefore completely match and will thus appear identical (i.e., they will be “metameric”) whatever their wavelength composition."; S2 "The match is determined at the cone level: the total quantal catch produced by the three primaries in each of the three cone types is the same as the quantal catch produced by the spectral test light."; S4 17-23-008 "spectrally different colour stimuli that have the same tristimulus values in a specified colorimetric system" | – (밝기를 k배 하면 세 반응이 모두 k배라 비율은 그대로) |
| C3 | 세 곡선은 넓게 겹친다. 특히 L과 M은 봉우리가 25–30 nm밖에 안 떨어져서, 550 nm(연두) 빛에는 둘 다 최대치의 90% 넘게 반응한다(L ≈ 0.94, M ≈ 0.98). 빨강 빛에도 M이 반응한다: L 대비 M이 620 nm에서 ≈ 0.21, 650 nm에서 ≈ 0.09, 700 nm에서 ≈ 0.06. S는 550 nm부터 사실상 반응하지 않는다(최대치의 0.3% 미만). | S2·S1 곡선 데이터; S3 "However, such measurements are complicated by the overlap of the three cone spectral sensitivities across the visible spectrum" | 5 nm 표에서 그대로 읽음. M은 390–830 nm 어디서나 0보다 크다 |
| C4 | 빛 하나를 빨강 끝에서 보라 끝으로 밀면, 가장 큰 막대가 L → M → S로 넘어간다. 약 555 nm보다 길면 L, 약 490–550 nm는 M, 약 485 nm보다 짧으면 S가 가장 크다. 단, 이건 각 세포를 자기 최대치 1로 맞춘 그림 기준이다. 세 곡선의 높이를 서로 어떻게 맞출지는 관례이고, 맞추는 방식이 바뀌면 경계도 바뀐다. | S2 "The functions are normalized to peak at unity at the nearest 0.1 nm step."; S3 (세 곡선의 절대 배율에 대해) "remain unknown, but are typically chosen to scale the three functions in some way"; S2·S1 곡선 데이터 | 5 nm 표: 555–700 nm L, 490–550 nm M, 390–485 nm S |
| C5 | 파장 하나짜리 빛으로는 "L과 S가 높고 M이 낮은" 막대 모양이 나오지 않는다(C4와 같은 그림 기준). 390–830 nm에서 M이 셋 중 가장 낮은 곳은 보라 끝(약 410 nm보다 짧은 곳)뿐이고, 거기서 L은 S의 4.5%도 안 된다. L과 M이 둘 다 자기 최대치의 0.5%도 안 되는, 사실상 S 혼자 반응하는 구간이다. L과 S가 둘 다 가장 큰 막대의 5% 이상이면서 M이 가장 낮은 파장은 없다. | S2·S1 곡선 데이터 (계산) | 5 nm 표: M이 가장 낮은 파장은 390, 395, 400, 405 nm뿐. 거기서 L/S < 0.045(최대 ≈ 4.4%), L·M < 0.005. 89개 파장 전체에서 조건을 만족하는 곳 없음 |
| C6 | 빨강(630 nm)과 파랑(450 nm) 빛을 화면 마젠타(#ff00ff)와 같은 색상이 되게 섞으면(세기 약 1 : 0.97) 막대는 L ≈ 0.48, M ≈ 0.16, S = 1로 M이 가장 낮다. 이 혼합과 L:S 비율이 같은 단일 파장은 약 483 nm(파랑과 청록 사이)인데, 그 빛은 S 대비 M이 ≈ 0.8로, 혼합(≈ 0.16)의 약 5배다. M의 봉우리가 L과 S 봉우리 사이에 있어서, L과 S를 함께 건드리는 단일 파장은 M을 더 세게 건드린다. 다른 빨강(600–700 nm)과 파랑(440–460 nm)으로 마젠타 색상을 맞춰도 같다: M이 늘 가장 낮고, 같은 L:S의 단일 파장은 약 480–489 nm, 그 빛의 M은 약 3–7배다. 600–700 nm 빨강과 400–465 nm 파랑을 세기 비 1 : 0.001부터 1 : 1000까지 섞은 혼합도, L이 S의 5% 이상이기만 하면(빨강이 조금이라도 보태진 혼합) 모두 같은 L:S의 단일 파장보다 M이 적어서, 세 반응 비율이 같은 단일 파장이 없다. 이 비교는 비율끼리라서 막대를 어떻게 맞춰 그려도 성립한다. L이 S의 5%도 안 되는 거의 순수한 파랑 혼합은 보라 끝 단일 파장들과 비교 방식이 달라져서(그 구간은 L/S가 되돌아가고 데이터도 가장 불확실하다, C16) 이 확인에서 뺐다. | S2·S1 곡선 데이터; S5 등색 함수; S6 sRGB 원색·백색점(표 0.2); S7 "magenta #ff00ff 255 0 255"; S12 "Magenta is associated with perception of spectral power distributions concentrated mostly in two bands: longer wavelength reddish components and shorter wavelength blueish components."; S8 "Lastly, If red and violet be mingled, there will be generated according to their various Proportions various Purples, such as are not like in appearance to the Colour of any homogeneal Light" | 색상은 CIE 1931 → sRGB(선형)의 HSV 색상 300°로 맞춤. 같은 L:S의 단일 파장은 445–615 nm에서 L/S가 단조 증가하는 구간 안에서 찾고(445 nm 아래는 L/S < 0.05), 5 nm 표 사이는 선형 보간. 다른 쌍: 빨강 600–700 nm(10 nm 간격) × 파랑 440–460 nm(5 nm 간격) 55쌍. 격자 21 × 14 × 61개 혼합 중 L/S ≥ 0.05인 14,472개 모두 혼합의 M/S가 단일 파장의 M/S보다 작음(비가 1에 다가가는 건 혼합이 거의 한 빛뿐일 때) |
| C7 | 빨강과 보라(또는 파랑) 빛을 섞으면 비율에 따라 여러 자주·보라빛(purple)이 나오고, 이 색들은 어떤 단일 파장 빛과도 같아 보이지 않는다. 뉴턴이 『광학』(1704)에 이미 적었다. 국제조명위원회(CIE) 표준 용어도 스펙트럼 양 끝(약 380 nm와 780 nm) 빛을 섞은 것을 "purple boundary", 그와 흰색이 만드는 삼각형 안의 색을 "purple stimulus"로 따로 정의한다. 단일 파장 빛은 모두 그 바깥 테두리(spectrum locus)에 있다. | S8 "Lastly, If red and violet be mingled, there will be generated according to their various Proportions various Purples, such as are not like in appearance to the Colour of any homogeneal Light"; S4 17-23-058 "line in a chromaticity diagram, or the plane surface in a tristimulus space, that represents additive mixtures of monochromatic stimuli of wavelengths approximately 380 nm and 780 nm"; S4 17-23-057 "stimulus that is represented in a chromaticity diagram by a point lying within the triangle defined by the point representing the specified achromatic stimulus and the two ends of the spectrum locus which correspond approximately to the wavelengths 380 nm and 780 nm"; S4 17-23-056 "locus, in a chromaticity diagram or in a tristimulus space, of points that represent monochromatic stimuli"; S15 "Except for these endpoints of the line, colors on the line are non-spectral (no monochromatic light source can generate them)." | – (수치는 C6) |
| C8 | 단정해도 되는 문장은 색상(hue) 수준이다: **자주·마젠타 계열(빨강과 보라 사이의 purple) 말고는 모든 색이 "단일 파장 빛 + 흰빛"으로 맞춰진다.** 그 파장을 주파장(dominant wavelength)이라 하고, 자주·마젠타 계열만 주파장이 없어서 보색 파장(complementary wavelength)으로 나타낸다. 흰색·회색·검정, 분홍, 갈색도 파장 하나로는 안 나오지만, 분홍(하얀빛을 띤 엷은 빨강)과 갈색(어두운 주황)의 색상은 스펙트럼에 있다. 화면 색으로 계산하면: 노랑(#ffff00, 빨강+초록 빛)의 주파장 ≈ 570 nm, 빨강 ≈ 611, 초록 ≈ 549, 파랑 ≈ 464, 시안 ≈ 491 nm. 마젠타(#ff00ff)는 주파장이 없고 보색 파장이 ≈ 549 nm(초록)다. | S4 17-23-062 "wavelength of the monochromatic stimulus that, when additively mixed in suitable proportions with the specified achromatic stimulus, matches the colour stimulus considered in the CIE 1931 x, y chromaticity diagram" / "In the case of purple stimuli, the dominant wavelength is replaced by the complementary wavelength."; S4 17-23-063 "wavelength of the monochromatic stimulus that, when additively mixed in suitable proportions with the colour stimulus considered, matches the specified achromatic stimulus"; S14 "Grayscale (achromatic) colors, such as white, gray, and black." / "Any color obtained by mixing a gray-scale color and another real color (either spectral or not), such as brown (a mixture of orange and black or gray)." / "Red-violet colors, which include colors in the line of purples (such as magenta and rose), and other variations of purple and red."; S11 분홍 "하얀빛을 띤 엷은 붉은색"; S12 "Magenta is an extra-spectral color, meaning that no color of the visible spectrum has magenta's hue."; S7 "yellow #ffff00 255 255 0" | CIE 1931 색도도, 백색 D65(S6). 흰점에서 그 색을 지나는 직선이 스펙트럼 테두리(380–780 nm, 5 nm 사이 선형)와 만나는 점. 마젠타는 그 직선이 purple 경계와 만나서, 반대 방향으로 549 nm |
| C9 | "마젠타는 존재하지 않는 색"은 틀린 말이다. 색은 빛의 성질이 아니라 보는 쪽(지각)의 성질이고, 마젠타는 실제 빛(빨강 쪽과 파랑 쪽 두 띠로 된 빛)으로 만들고 잉크로 찍는 색이다. CIE도 그런 자극(purple stimulus)을 정식으로 정의한다. 맞는 말은 "무지개(스펙트럼)에 없는 색", "파장 하나로는 안 나오는 색"이다. | S4 17-22-040 "characteristic of visual perception that can be described by attributes of hue, brightness (or lightness) and colourfulness (or saturation or chroma)"; S4 17-23-057 (C7); S12 "Magenta is associated with perception of spectral power distributions concentrated mostly in two bands: longer wavelength reddish components and shorter wavelength blueish components."; S12 "It is one of the four colors of subtractive ink used in color printing by most color printers, also known as CMYK along with yellow, cyan, and black to make all the other colors and hues." | – |
| C10 | 화면에서 마젠타(#ff00ff)는 빨강과 파랑을 최대로 켜고 초록을 끈 색이다. 빨강과 파랑의 비율을 바꾸면 보라빛 쪽에서 붉은 쪽까지 여러 자주색이 된다. 화면 마젠타는 흰색을 사이에 두고 초록의 맞은편에 있다(보색 파장 = 화면 초록의 주파장 ≈ 549 nm). | S7 "magenta #ff00ff 255 0 255" / "purple #800080 128 0 128"; S21 마젠타 "컴퓨터 화면 등의 RGB 가산혼합에서 빨강과 파랑을 동일하게 혼합했을 때 나타나는 색이며"; S8 "the Colour compounded shall not be any of the prismatick Colours, but a purple, inclining to red or violet, accordingly as the point Z lieth on the side of the line DO towards E or towards C"; S12 "magenta pigments absorb green light" | C8의 계산: 마젠타의 보색 파장 = 초록의 주파장 |
| C11 | 시청자가 "마젠타"를 만나는 곳은 프린터 잉크다. 컬러 인쇄의 네 잉크(CMYK)가 시안, 마젠타, 노랑, 검정이다. 잉크는 종이에서 반사되는 빛을 줄이는 방식이고, 마젠타 잉크는 초록 빛을 흡수한다. 인쇄용 마젠타는 화면 마젠타보다 붉다. 이름은 1859년 이탈리아 마젠타 근처에서 벌어진 마젠타 전투의 승리를 기념해 다시 붙인 염료 이름에서 왔다(원래 이름 fuchsine). 사전 뜻은 "밝은 자주색". | S21 CMYK "CMYK라는 약어는 인쇄에 사용되는 네 가지 색상 성분인 시안, 마젠타, 노랑, 검정(키 플레이트)을 의미한다." / "감색 모델에서 잉크는 흰색이나 밝은 배경에서 반사되는 빛의 양을 줄인다."; S12 "magenta pigments absorb green light"; S12 "The tone of magenta used in printing, printer's magenta, is redder than the magenta of the RGB (additive) model, the former being closer to rose."; S12 "It was renamed to celebrate the French-Sardinian victory under French Emperor Napoleon III at the Battle of Magenta against the larger army of the Austrian Empire on 4 June 1859 near the Italian town of Magenta"; S11 마젠타 "밝은 자주색" | – |
| C12 | 한국어 "보라"는 두 색을 다 부른다. 사전의 보라(색)는 "파랑과 빨강의 중간색"으로, 빛을 섞어 만드는 purple 쪽 뜻이다. 같은 사전의 무지개 풀이 "…파랑, 남색, 보라의 차례"에서 보라는 스펙트럼 끝의 단일 파장 색(violet)이다. 영어는 둘을 나눈다: violet은 단일 파장 스펙트럼 색, purple은 빨강·파랑·보라 빛의 여러 혼합. 관련 사전 풀이: 자주 = "짙은 남빛을 띤 붉은색", 자홍 = "자줏빛을 띤 붉은색", 마젠타 = "밝은 자주색", 남색 = "푸른빛을 띤 자주색". | S11 보라색 "파랑과 빨강의 중간색. 또는 그런 색의 물감." / 보라 "파랑과 빨강의 중간색. 또는 그런 색의 물감.=보라색." / 무지개 "보통 바깥쪽에서부터 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라의 차례이다." / 자주 "짙은 남빛을 띤 붉은색" / 자홍 "자줏빛을 띤 붉은색" / 마젠타 "밝은 자주색" / 남색 "푸른빛을 띤 자주색"; S13 "In optics, violet is a spectral color (a color that can be produced by light of a single wavelength), whereas purple is the color of various combinations of red, blue, and violet light" / "some of which humans perceive as similar to violet." | – |
| C13 | 무지개 일곱 색 "빨주노초파남보"는 뉴턴이 스펙트럼을 일곱으로 나눈 관례(red, orange, yellow, green, blue, indigo, violet)와 같다. 다만 하늘의 실제 무지개는 순수한 스펙트럼보다 색이 옅고, 물방울이 작을 때 주 무지개 바로 안쪽에 생기는 과잉 무지개(supernumerary bow)는 옅은 분홍·자주·초록빛이다. 그래서 정확한 말은 "무지개의 색 띠(빛을 파장별로 펼친 스펙트럼)에는 마젠타가 없다"다. | S8 "the seven Colours, red, orange, yellow, green, blue, indigo, violet"; S16 "the most commonly cited and remembered sequence is Isaac Newton's sevenfold red, orange, yellow, green, blue, indigo and violet"; S11 무지개 (C12); S16 "The colour pattern of a rainbow is different from a spectrum, and the colours are less saturated."; S16 "have pastel colours (consisting mainly of pink, purple and green hues) rather than the usual spectrum pattern."; S16 "The effect becomes apparent when water droplets are involved that have a diameter of about 1 mm or less"; S20 "Supernumerary bows are delicate, closely spaced arcs of predominantly green, pink, and purple hues that appear just inside the primary rainbow." | – |
| C14 | 파장 순서로 펼친 스펙트럼은 빨강 끝과 보라 끝이 있는 띠다. 색상환이 고리로 닫히는 건 그 두 끝의 빛을 섞은 자주·마젠타 계열이 빈틈을 잇기 때문이고, 그 색들은 파장 하나에는 없고 섞인 빛을 눈이 받을 때 생긴다. CIE는 색상을 "지각의 속성"으로 정의하면서 빨강·노랑·초록·파랑이 "닫힌 고리"를 이룬다고 쓴다. 뉴턴의 색 원(1704)도 빨강과 보라 끝을 맞붙이고, 그 이음새 근처에 오는 혼합색은 프리즘 색이 아니라 자주(purple)라고 적었다. 뉴턴의 원에는 자주 구간이 따로 없었고, 나중의 색상환이 빨강과 보라 사이에 자주 계열을 넣었다. | S4 17-22-067 "attribute of a visual perception according to which an area appears to be similar to one of the colours red, yellow, green, and blue, or to a combination of adjacent pairs of these colours considered in a closed ring"; S8 "Let the first Part DE represent a red Colour, the second EF orange, the third FG yellow, the fourth CA green, the fifth AB blue, the sixth BC indigo, and the seventh CD violet." (빨강 DE와 보라 CD가 D에서 만난다); S8 (C10의 purple 문장); S17 "A wedge-shaped gap represents colors that have no unique spectral frequency. These extra-spectral colors, the purples, form from an additive mixture of colors from the ends of the spectrum." / "The original color circle of Isaac Newton showed only the spectral hues" / "Most later color circles include the purples, however, between red and violet" | – |
| C15 | 원뿔세포 비율로 하는 설명은 이만큼 정직하다. **(가) 단정해도 된다:** 두 빛이 같은 색으로 보이는지는 원뿔세포 세 반응으로 정해진다(C2). 그 뒤 신경 경로는 세 값을 비교·조합할 뿐이라(망막에서 L 대 M, S 대 L+M), 세 반응 조합이 단일 파장으로 안 나오면(C5, C6) 그 색도 단일 파장으로는 안 나온다. **(나) 단순화다:** 그 조합이 어떤 색으로 느껴지는지(마젠타라는 느낌, 빨강·초록·노랑·파랑의 정도)는 원뿔세포 다음 단계가 정한다. 망막의 대립 채널 축은 지각의 기본 색상(빨강·초록·노랑·파랑)과 맞지 않고, 원뿔세포 반응이 지각 색상으로 바뀌는 방식은 아직 다 풀리지 않았다. 같은 빛도 주변과 순응 상태에 따라 달라 보인다. 그래서 "세 세포의 반응 조합이 무지개 어디에도 없다"는 정직하고, "뇌가 빈틈을 채운다", "뇌가 지어낸 색"은 근거 없는 비유다. | S3, S2 (C2의 인용); S3 "Color matches are matches made at the cone level that depend on the spectral sensitivities of the L-, M- and S-cones."; S18 "The red–green opponent channel is equal to the difference of the L- and M-cones. The blue–yellow opponent channel is equal to the difference of the S-cone and the average/weighted sum of the L- and M-cones."; S18 "The poles of these cone opponent mechanisms do not correspond to the unique hues of Hering's Opponent Colors Theory and unlike the unique hues, have no privilege in color perception."; S4 17-22-068 "There are four unique hues: red, green, yellow and blue forming two pairs of opponent hues: red and green, yellow and blue."; S10 "A recent paper by Oh and Sakata investigates the “incompletely solved mystery” of how the three cone responses map onto perceived hue, and particularly the S cone’s well-known problematic contribution to blueness and redness."; S4 17-22-040 Note 1 "Perceived colour depends on the spectral distribution of the colour stimulus, on the size, shape, structure and surround of the stimulus area, on the state of adaptation of the observer's visual system, and on the observer's experience of the prevailing and similar situations of observation." | – |
| C16 | 무지개 끝 보라가 살짝 붉은 기를 띤다는 관찰 자체는 써도 된다(CIE 용어 예문 "violet is reddish-blue". 실험에서는 약 470 nm보다 짧아지면서 붉은 느낌이 생겨 점점 커진다). **하지만 "L세포가 짧은 파장에도 반응해서"라는 설명은 근거가 없어 뺀다.** (가) 400 nm에서 L은 자기 최대치의 0.24%만 반응하고 M도 거의 같다(L/M ≈ 1.06). L/M은 460 nm 근처 최저(≈ 0.56)에서 보라 끝으로 가며 다시 오르지만 최대 ≈ 1.13으로, 같은 에너지 흰빛의 L/M(≈ 1.22)보다 낮다. L과 M의 균형만 보면 보라 끝도 흰빛보다 M 쪽이다. (나) 연구 문헌은 짧은 파장의 붉은 느낌을 S세포 신호가 빨강–초록 채널에 보태는 것으로 설명한다. S 신호가 없는 눈(한쪽 눈만 제3색각 이상인 사람의 그 눈)은 L·M이 그대로인데도 스펙트럼의 짧은 쪽 절반을 고르게 청록빛으로 본다. (다) 그 S 설명도 "다 풀리지 않은" 문제로 불리고, 원뿔세포 곡선 자체가 410 nm 아래에서 데이터마다 다르다. | S4 17-22-069 "EXAMPLE Orange is yellowish-red or reddish-yellow; violet is reddish-blue."; S10 "Redness commences at 470 nm and increases with shortening wavelength." (Oh & Sakata 결과의 요약); S9 "Although there is a large literature establishing and discussing the contribution of +So cells to the appearance of red at short wavelengths"; S9 "Also in accord with our data are the reports (23, 24) that unilateral tritanopic observers see the entire short-wavelength half of the spectrum as uniformly greenish-blue in their tritanopic eye."; S10 "The S cone is traditionally held to contribute to blueness and also to short-wavelength redness"; S13 "The reason why to (typical trichromat) humans violet light appears slightly reddish compared to spectral blue (despite spectral red being at the other end of the visible spectrum) is, according to the opponent process hypothesis of color vision, that the S-cone type (i.e. the one most sensitive to short wavelengths) contributes some red to the red-versus-green opponent channel (which at the longer blue wavelengths gets counteracted by the M-cone type)."; S10 (C15의 "incompletely solved mystery"); S1 "While the Smith and Pokorny fundamentals agree with both the Stockman et al. (1993a) and the new fundamentals at middle- and long-wavelengths, they do not agree at short wavelengths." / "The discrepancies below 410 nm are mainly the result of adjustments to the Stiles and Burch (1959) CMFs introduced by the CIE to extrapolate the CMFs beyond their measured range, for which there was little or no justification." | 5 nm 표: L(400) ≈ 0.0024, L/M(400) ≈ 1.06, 390–470 nm에서 L/M 최저 ≈ 0.56(460 nm), 최대 ≈ 1.13. 같은 에너지 흰빛(390–830 nm 합)의 L/M ≈ 1.22. 흰빛과 비교한 L/M의 높낮이는 L·M 곡선의 배율과 상관없다 |
| C17 | 화면(sRGB)은 단일 파장 색을 하나도 정확히 내지 못한다. 390–700 nm 모든 파장이 sRGB 색 범위 밖이라, 영상 속 무지개는 근사치다. 화면은 약 461 nm보다 짧은 쪽(파랑 끝과 보라)을 파랑에 빨강 빛을 조금 섞어 그리고, 노랑은 빨강+초록 빛으로 그린다. 반면 화면 마젠타는 원색 둘로 만드니 sRGB 안에 있다. **판단: 영상에서 말할 필요는 없다.** 주장은 실제 빛과 원뿔세포 반응에 대한 것이고, 화면 색은 그 그림일 뿐이다. 다만 화면 색을 "이게 500 nm 빛의 색"처럼 실물이라고 말하지는 않는다. | S6 표 0.2 "TABLE 0.2 CIE chromaticities for ITU-R BT.709 reference primaries and CIE standard illuminant Red Green Blue D65 x 0.6400 0.3000 0.1500 0.3127 y 0.3300 0.6000 0.0600 0.3290"; S6 "sRGB tristimulus values for the illuminated objects of the scene are simply linear combinations of the 1931 CIE XYZ values"; S6 "In the RGB encoding process, negative sRGB tristimulus values, and sRGB tristimulus values greater than 1.00 are not typically retained."; S13 "Computer and television screens, using the RGB color model, cannot produce spectral violet light; instead, they combine blue light at high intensity with red light at less intensity."; S15 "The boundary of sRGB (pictured) runs approximately parallel to the line, connecting the primaries red and (color wheel) blue, and thus purples near the line are absent from the gamut of sRGB."; S7 "yellow #ffff00 255 255 0" | CIE 1931 → 선형 sRGB(S6 원색·D65로 행렬 유도): 390–700 nm 5 nm마다 음수 채널이 하나 이상. 빨강 채널은 390–460 nm에서 양수, 460–465 nm 사이(≈ 461 nm)에서 0 |
| C18 | 막대를 L = 빨강, M = 초록, S = 파랑으로 칠해 세기대로 섞으면 그 파장의 색이 나오지 않는다. 500 nm에서 색상이 약 74°(청록이어야 할 것이 올리브색), 550 nm에서 약 56°(초록이어야 할 것이 노랑) 어긋난다. 색 칩은 파장(또는 세 반응)에서 표준 변환(CIE 1931 등색 함수 → sRGB)으로 따로 계산해야 한다. 세 원뿔세포가 각각 빨강·초록·파랑을 "보는" 것도 아니다(C1: L의 봉우리 570 nm는 연두·노랑 쪽). | S3 "All sets of CMFs, whether for real or imaginary primaries, must be a linear transformation of these fundamental CMFs"; S6 (sRGB 정의); S1 (C1의 이름 문장) | HSV 색상 비교, 칠한 막대 → 정확한 색: 450 nm 238° → 250°, 480 nm 217° → 213°, 500 nm 87° → 161°, 550 nm 62° → 119°, 580 nm 40° → 30°, 650 nm 6° → 355° |
| C19 | 같은 그림 기준(각 세포 최대치 = 1)에서 흰빛은 세 막대가 같지 않다. 모든 파장이 같은 세기인 흰빛이면 L 1.00, M 0.82, S 0.50이다. | S2·S1 곡선 데이터 (계산) | 390–830 nm 5 nm 표의 열 합 |
| C20 | M세포가 없는 눈(제2색각 이상, deuteranope)에는 C6의 마젠타 혼합과 약 483 nm 단일 파장 빛이 세기만 맞추면 같은 색이다. 그 눈은 L과 S만 비교하는데 두 빛의 L:S가 같으니까. 그래서 "마젠타는 파장 하나로 안 나온다"는 보통의 세 원뿔세포 눈 이야기이고, 그 이유가 바로 M이다. | S2 "protanopes, deuteranopes and tritanopes all possess reduced forms of trichromatic vision, lacking one of the three normal cone types -- the L, M and S, respectively."; S1 "M-cone sensitivities in nine protanopes, and L-cone sensitivities in 20 deuteranopes." (표준 L 곡선이 M 없는 사람에게서 잰 것); S3 (C2의 "same cone responses" 문장) | 483 nm 빛을 ≈ 2.88배로 켜면 L과 S가 혼합과 같고, M은 약 5배 다르다. 이 계산은 M 없는 눈의 L·S 곡선이 표준 곡선과 같다고 가정한다 |

## Easy to misstate

- **"마젠타는 존재하지 않는 색", "가짜 색", "뇌가 지어낸 색" ✗** → "무지개에 없는 색", "파장
  하나짜리 빛으로는 안 나오는 색" ✓ (C9). 색은 원래 보는 쪽의 경험이고, 마젠타는 실제 빛으로
  만든다.
- **"무지개에 없는 색은 마젠타뿐" ✗.** 흰색·회색·분홍·갈색도 파장 하나로는 안 나온다. 단정할
  수 있는 건 색상 수준이다: "빨강과 보라 사이의 자주·마젠타 계열 색상은 어떤 파장에 흰빛을 섞어도
  안 나온다" ✓ (C8). 분홍은 "빨강에 흰빛을 섞은 색"이라 대략 빨강 색상이지만, 흰빛을 섞으면
  색상이 조금 변하기도 해서(애브니 효과, S4 17-22-070 "change in hue produced by decreasing the
  purity of a colour stimulus while keeping its dominant wavelength constant") "정확히 같은 색상" ✗.
- **"무지개"의 범위.** 하늘의 무지개에도 옅은 분홍·자주빛 띠(과잉 무지개)가 생길 수 있다(C13).
  "하늘의 무지개에는 분홍·자주빛이 절대 없다" ✗. 영상의 무지개는 "빛을 파장별로 펼친 색 띠",
  "빨주노초파남보"로 정의해 쓴다 ✓.
- **"보라"는 한 가지 뜻으로만 쓴다 (C12).** 대본에서 보라는 무지개 끝(단일 파장 violet)에만
  쓰고, 섞어서 만든 색은 "마젠타"(필요하면 "자홍색", "자주색")로 부른다. "무지개 끝 보라는 빨강과
  파랑을 섞은 색" ✗: 무지개 끝 보라는 파장 하나짜리 빛이다. 사전 풀이 "파랑과 빨강의 중간색"을
  무지개 보라에 갖다 붙이지 않는다. 한국어 위키백과 "보라색"이 바로 이 실수를 한다(S21 "보라
  (violet)는 색 중 하나로 빨강과 파랑의 중간색이며 이 색상은 가시광선 영역 안에서 볼 수 있는 색상
  중에 가장 파장이 짧으며").
- **"빨강·초록·파랑 세포" ✗** → "L·M·S", "긴·중간·짧은 파장에 잘 반응하는 세포" ✓ (C1).
  L의 봉우리는 빨강이 아니라 연두·노랑 쪽(약 570 nm)이다. 그림에서 막대에 빨강·초록·파랑을
  칠하더라도, 그 색을 섞어 색 칩을 만들지 않는다(C18).
- **"빨강 빛에는 L만 반응한다" ✗** → "빨강 빛에는 L이 가장 세게, M도 조금" ✓ (C3). L과 M은 많이
  겹친다. S는 연두(약 550 nm)부터 빨강까지 거의 반응하지 않는다는 말은 ✓.
- **"단일 파장으로는 M이 가장 낮은 막대가 안 나온다" ✗ (엄밀히).** 보라 끝 약 410 nm 아래에서는
  M이 L보다 아주 조금 낮다(C5). 맞는 말은 "L과 S가 함께 높고 M만 낮은 모양은 안 나온다" ✓. 그
  구간에서 L과 M은 둘 다 0에 가깝다. 막대를 그릴 때 보라 끝에서 L이 눈에 띄게 올라가 보이면 안 된다.
- **막대 모양은 그리는 방식에 달려 있다 (C4, C6).** "L → M → S로 넘어간다", "L·S 높고 M 낮은
  모양"은 각 세포를 자기 최대치 1로 맞춘 그림 기준이다. 어떻게 그려도 맞는 핵심은 비율이다:
  "L과 S를 같은 비율로 건드리는 빛 하나는 M을 훨씬 세게 건드린다" ✓ (C6).
- **"흰빛 = 세 막대가 똑같다" ✗** (이 그림 기준으로는 L 1.00, M 0.82, S 0.50, C19).
- **"빨강과 파랑을 섞으면 마젠타" — 비율이 필요하다.** 비율에 따라 보라빛에서 붉은 자주까지
  나온다(C10). "섞으면 마젠타가 될 수 있다", "알맞게 섞으면" ✓. 화면 마젠타는 둘을 똑같이 최대로.
- **보라가 붉어 보이는 이유를 L세포로 설명하지 않는다 (C16).** 대본에 넣는다면 "보라 끝은 살짝
  붉은 기가 돈다"까지만 ✓. "그래서 무지개 끝이 빨강 쪽으로 돌아온다"처럼 이 붉은 기를 고리의
  근거로 쓰지 않는다: 고리를 닫는 건 섞은 빛(자주·마젠타)이다(C14).
- **"뇌가 빈틈을 채운다" ✗ (C15).** 정직한 말은 "눈의 세 세포가 받는 조합이 무지개 어디에도
  없는 조합이라서", "그 고리는 빛이 아니라 우리 눈이 만든 것" ✓. "원뿔세포 비율이 색을 완전히
  정한다"도 과하다: 같은 빛도 주변과 순응에 따라 달라 보인다. "같은 조건에서"를 생각해 두고,
  단정은 "파장 하나로 그 세 반응 조합이 나오느냐"에만 한다.
- **화면의 무지개는 근사치 (C17).** "화면의 이 색이 진짜 500 nm 빛의 색" ✗. 영상 속 보라 끝은
  화면이 파랑에 빨강을 조금 섞어 그린 것이고, 노랑도 빨강+초록이다. 그래도 화면 노랑은 파장
  하나(≈ 570 nm)와 같은 색상이 있고 화면 마젠타는 없다(C8). "화면 색은 다 섞은 거니 마찬가지 아니냐"는
  반문에 이게 답이다.
- **봉우리 숫자는 "약"을 붙이고 반올림한다.** 출처마다 다르다(S19는 560/530/420 nm대, 에너지·광자
  단위에 따라 1–4 nm 차이, 사람마다 몇 nm). "약 440, 540, 570 nm" ✓, "L은 정확히 564 nm" ✗.
  그린 곡선은 눈에 들어오는 빛 기준(수정체·황반 색소 포함)이다.
- **뉴턴 (C7, C14).** 뉴턴은 빨강과 보라를 섞은 자주색이 어떤 단일 파장 빛과도 다르다고 적고 색 원을
  만들었다. "뉴턴이 마젠타를 발견했다" ✗, "뉴턴 원에 자주 구간이 있었다" ✗ (나중 색상환이 넣었다).
  『광학』은 1704년 초판이다.
- **마젠타라는 이름 (C11).** 전투가 있던 이탈리아 마을 이름 ✓. "꽃 이름" ✗ (꽃 fuchsia는 원래 염료
  이름 fuchsine 쪽). 인쇄 마젠타 잉크는 화면 마젠타보다 붉다. 잉크 이야기를 쓰면 "초록 빛을
  빨아들이는 잉크" ✓.
- **"모든 사람에게" ✗ (C20).** 보통의 세 원뿔세포 눈 기준이다. 색각 이상 비율 같은 숫자는 읽은 출처가
  없으니 쓰지 않는다.
- **마젠타 혼합의 짝 파장 (C6).** "483 nm"는 이 예시(630 nm + 450 nm)의 값이다. 다른 빨강·파랑을
  쓰면 약 480–489 nm로 조금 움직인다(M 차이도 약 3–7배). 대본에 숫자를 쓰지 말고 "파랑과 청록 사이 빛 하나"처럼 쓴다.
