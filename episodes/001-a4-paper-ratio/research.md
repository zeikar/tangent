# 리서치 · 001 A4 용지는 왜 1:√2일까

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과).

## Sources

접속일은 모두 2026-09-25.

**1차 출처 (표준 원문)**

- **[S4]** ISO (ISO/TC 6), ISO 216:2007 *Writing paper and certain classes of
  printed matter — Trimmed sizes — A and B series, and indication of machine
  direction*, 제2판, 2007-09-15. SIST(슬로베니아 표준협회)의 미리보기 PDF:
  <https://preview.sist.si/sist-preview/36631/c0883203ea25445c9992bb09343620c5/ISO-216-2007.pdf>
  - 미리보기에는 본문 1–6쪽(§1부터 §7.1 a)까지)만 있다. §7.1 b)–c)(150 mm를
    넘는 치수의 허용 오차), 부속서 A, 참고문헌은 빠져 있다.
  - 식 (1)의 √ 기호는 PDF 텍스트에서 빠져 있어서 페이지 이미지로 확인했다.
  - 표준은 소수점으로 쉼표를 쓰고(0,841 m), **짧은 변을 x, 긴 변을 y**라고 쓴다.
  - iso.org 페이지(<https://www.iso.org/standard/36631.html>)는 여전히 403을 반환한다.

**2차 출처**

- **[S1]** Markus Kuhn, "International standard paper sizes", University of
  Cambridge, 2025-12-08 수정. <https://www.cl.cam.ac.uk/~mgk25/iso-paper.html>
- **[S2]** Wikipedia, "International standard paper sizes", 2026-09-18 판.
  <https://en.wikipedia.org/wiki/International_standard_paper_sizes>
  예전 제목은 "ISO 216"이었고, <https://en.wikipedia.org/wiki/ISO_216>은
  2026-01-07부터 이 문서로 넘어간다.
- **[S3]** Wikipedia, "Letter (paper size)", 2026-07-20 판.
  <https://en.wikipedia.org/wiki/Letter_(paper_size)>
- **[S7]** Detlef Borchers, "Zahlen, bitte! DIN 476 - Die Geburt des
  wichtigsten Papierformats der Welt", heise online, 2023-03-21.
  <https://www.heise.de/hintergrund/Zahlen-bitte-DIN-476-Die-Geburt-des-wichtigsten-Papierformats-der-Welt-7555112.html>

**복사기 매뉴얼 (C12 근거)**

- **[S5]** Ricoh, MP C2050/C2550 (Aficio MP C2050/C2550) Operating Instructions,
  *Copy and Document Server Reference* → "Preset Reduce/Enlarge", © 2008.
  <http://support.ricoh.com/bb_v1oi/pub_e/oi_view/0001036/0001036377/view/copy/unv/0048.htm>
  원문의 화살표(→)는 이미지 글자다.
- **[S6]** Canon, *imageRUNNER 2545i / 2530i / 2525 / 2520 e-Manual* →
  "Enlarging / Reducing Images" (날짜 표기 없음).
  <https://oip.manual.canon/USRMA-0621-zz-CS-enGB/contents/CS2545_copy_0209_enlargingreducingimages.html>

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | A 시리즈(A0–A10)는 모두 닮은꼴이고, 긴 변 : 짧은 변은 설계상 √2 : 1이다. mm 치수로 계산한 비율은 √2와 0.7% 안쪽으로 다르다. | S4 §4.1 "All the sizes in each series are geometrically similar to one another (the principle of similarity)"; S4 식 (1) "y : x = √2 : 1 = 1,414"; S1 "the height-to-width ratio of all pages is the square root of two (1.4142 : 1)"; S2 "have the same aspect ratio, √2:1, within rounding error" | 표 1 기준 A0–A10 모두 √2와의 차이가 0.7% 이내. 가장 큰 것은 A8·A10(≈ +0.63%)과 A9(≈ −0.62%), A4는 ≈ +0.005% |
| C2 | 짧은 변과 평행하게 반으로 나누면 바로 아래 크기가 된다. A3를 반으로 자르면 A4 두 장, A4를 반으로 자르면 A5 두 장이다. 크기 번호는 A0에서 몇 번 나눴는지를 뜻한다. 나눈 절반도 비율이 같다. | S4 §4.1 "each size is achieved by dividing the size immediately above it into two equal parts, the division being parallel to the shorter side (the halving principle)"; S4 §5.1 "the number indicates the number of divisions that have been made (according to the rules of 4.1), starting from the basic size which has been given the number 0"; S1 "cut one parallel to its shorter side into two equal pieces, then the resulting page will have again the same width/height ratio"; S2 "when cut or folded in half widthways, the halves also have the same aspect ratio" | 표 1의 모든 n에서 A(n)의 절반 = A(n+1) (긴 변을 반으로 나누고 mm 아래는 버림) |
| C3 | 반으로 나눠도 비율이 그대로인 직사각형은 √2 : 1 하나뿐이다. 긴 변을 x, 짧은 변을 1이라 하면 x : 1 = 1 : x/2이므로 x² = 2다. | S4 §4.1 "This requirement, combined with that explained in the preceding paragraph, gives the following equation for the sides x and y of a given size" + 식 (1) "y : x = √2 : 1" (닮음 + 반으로 나누기 → √2); S2 "This ratio has the unique property that when cut or folded in half widthways, the halves also have the same aspect ratio" + 대수 | x = √2 ≈ 1.414214에서만 성립 |
| C4 | A4는 210 × 297 mm다. | S4 표 1 "A4 210 × 297"; S1 표 | – |
| C5 | A0는 넓이가 1 m²가 되도록 정한 크기다(설계값). 넓이 1 m²와 비율 √2 : 1을 함께 만족하는 변은 짧은 변 ≈ 0.841 m, 긴 변 ≈ 1.189 m이고(표준 표기 "x = 0,841 m", "y = 1,189 m"), 표에서는 841 × 1189 mm로 준다. 이 mm 치수로 계산한 넓이는 ≈ 0.99995 m²다. | S4 §4.3 "The basic size of the A series (A0) has an area of 1 m2"; S4 §4.3 "Equations (1) and (2) give the following lengths of the sides for the basic size of the A series: x = 0,841 m y = 1,189 m"; S4 표 1 "A0 841 × 1 189"; S1 "Format A0 has an area of one square meter"; S2 "A0 is defined so that it has an area of 1 square metre before rounding to the nearest 1 millimetre" | 식 (1)·(2)의 해 x = 2^(−1/4) ≈ 0.840896 m, y = 2^(1/4) ≈ 1.189207 m → mm로 반올림하면 841 × 1189. 841 × 1189 = 999,949 mm² ≈ 0.99995 m² |
| C6 | A4는 A0를 네 번 반으로 나눈 크기라 넓이가 약 1/16 m²다. | S4 §4.1 "Consequently, the areas of two successive sizes are in the ratio 2:1"; S4 §5.1 (번호 = 나눈 횟수, C2); S1 "the A4 format has an area of 1/16 m²" | 설계 1/16 m² = 62,500 mm², 표 치수 210 × 297 = 62,370 mm² |
| C7 | 흔한 80 g/m² 복사지 A4 한 장은 약 5 g이다. | S1 "Usual typewriter and laser printer paper weighs 80 g/m²." / "weighs with the common paper quality 5 g per page"; S2 "A standard A4 sheet made from 80 g/m2 paper weighs 5 grams (0.18 oz), as it is 1⁄16 (four halvings, ignoring rounding) of an A0 page" | 80 g/m² × 0.06237 m² ≈ 4.99 g |
| C8 | 설계 비율은 √2 : 1이지만 표준의 치수는 mm 정수라서, 실제 치수의 비율은 √2의 근삿값이다. A4는 297 ÷ 210 ≈ 1.41429, √2 ≈ 1.41421. A0는 설계 치수를 mm로 반올림했고(≈ 840.9 → 841), 그 아래 크기는 위 크기의 긴 변을 반으로 나누고 mm 아래를 버렸다. | S4 식 (1) "y : x = √2 : 1"; S4 표 1 (모든 치수가 mm 정수, "Dimensions mm"); S1 "The standardized height and width of the paper formats is a rounded number of millimeters."; S1 "using the above values only at n = 0, and then progressively dividing these values by two to obtain the smaller sizes, each time rounding the result to the next lower integer number of millimeters"; S2 "before rounding to the nearest 1 millimetre" | 2^(−1/4) m ≈ 840.896 mm → 841 (반올림. 내림이면 840). 이후 크기는 C2의 "반으로 나누고 버림"과 표 1이 일치. 설계값을 크기마다 따로 내림하면 A1이 594 × 840이 되어 표와 어긋난다 |
| C9 | 1786년 물리학자 리히텐베르크가 편지에서, 당시 흔한 종이가 이미 √2 비율이라는 것과 그 비율의 장점을 적었다. 1798년 프랑스 법이 이미 같은 비율의 용지 몇 가지를 정했지만 곧 잊혔다. 독일이 1922년 DIN 476으로 표준화했고(발터 포르스트만), 1975년 국제 표준 ISO 216이 되었다. | S1 "a letter that the physics professor Georg Christoph Lichtenberg ... wrote 1786-10-25 to Johann Beckmann. In it, Lichtenberg explains the practical and aesthetic advantages of the sqrt(2) aspect ratio, and of his discovery that paper with that aspect ratio was commonly available at the time"; S7 "Lichtenberg hatte im Mathematikunterricht entdeckt, dass die von ihm benutzten Papiere durch das Format 1 : √2 bestimmt sind"; S1 "a law on the taxation of paper that defined several formats that already correspond exactly to the modern ISO paper sizes" / "The French format series never became widely known and was quickly forgotten again."; S1 "reinvented ... in Germany by Dr. Walter Porstmann. They were adopted as the German standard DIN 476 in 1922"; S7 "Am 18. August 1922 wurde Porstmanns Werk als DIN 476 "Papierformate" veröffentlicht."; S1 "It finally became both an international standard (ISO 216) as well as the official United Nations document format in 1975"; S4 머리말 "This second edition cancels and replaces the first edition (ISO 216:1975)" | – |
| C10 | 북미(미국·캐나다)와 필리핀, 중남미 일부를 빼면 전 세계가 이 규격을 쓴다. | S1 "it is today used in almost all countries on this planet, with the exception of North America"; S2 "used around the world except in North America, the Philippines and parts of Latin America"; S4 §1 NOTE "In some countries, particularly in North America, different sizes of cut-size office papers are commonly used." | – |
| C11 | 미국 Letter 용지(8.5 × 11 인치)는 비율이 ≈ 1.294이고, 반으로 접으면 ≈ 1.545가 되어 모양이 바뀐다. | S3 "It measures 8.5 by 11 inches (215.9 by 279.4 mm)" + 계산; S1 "the U.S. format series has two different alternating aspect ratios 17/11 = 1.545 and 22/17 = 1.294" | 11 ÷ 8.5 ≈ 1.294 → 8.5 ÷ 5.5 ≈ 1.545 |
| C12 | 이웃한 A 크기는 변의 길이가 √2배(≈ 1.414배), 넓이가 2배 차이 난다. 그래서 A 용지용 복사기에는 대개 확대 141%(A4 → A3, A5 → A4)와 축소 71%(A3 → A4, A4 → A5) 버튼이 있다. 141% ≈ √2, 71% ≈ 1/√2 ≈ 0.707이다. A3 → A4를 70%로 표시하는 기종도 있다. | S1 "Copying machines designed for ISO paper sizes usually provide special keys for the following frequently needed magnification factors: 71% sqrt(0.5) A3 → A4 ... 141% sqrt(2) A4 → A3 (also A5 → A4)"; S1 "By setting the magnification factor on the copying machine to 71% (that is sqrt(0.5)), or by pressing the A3→A4 button that is available on most copying machines"; S5 "141% (Area ratio 2 times): A4 → A3, A5 → A4" / "71% (Area ratio 1/2 times): A3 → A4, A4 → A5"; S6 "141% A4 → A3" / "70% A3 → A4" | 표 1의 이웃 크기끼리 변 길이 비는 모두 √2와 1% 이내(420 ÷ 297 ≈ 1.4141, 297 ÷ 210 ≈ 1.4143). 100√2 ≈ 141.4 → 141. 100/√2 ≈ 70.71 → 반올림 71, 내림 70 |
| C13 | 모든 A 크기는 모양이 같아서, 한 A 크기에 맞춘 페이지를 다른 A 크기로 옮길 때 가로세로를 같은 배율로 키우거나 줄이면 그대로 꼭 맞는다. 잘리는 곳도 남는 여백도 없고, 한쪽만 늘일 필요도 없다. 남는 틈은 mm 반올림 탓뿐이라 변 길이의 1.3% 미만이고, A3·A4·A5 이웃끼리는 1 mm 미만이다. 미국 규격은 비율이 번갈아 달라서, 레터(8.5 × 11 인치)를 레저(11 × 17 인치)로 키우면 긴 쪽에 약 70 mm 여백이 남는다. | S1 (A4 잡지 두 쪽을 71%로 A4 한 장에 복사하는 예) "both A4 pages of the journal article together will fill exactly the A4 page produced by the copying machine. ... No wasted paper margins appear, no text has been cut off"; S2 "In scaled photocopying, for example, two A4 sheets reduced to A5 size fit exactly onto one A4 sheet, and an A4 sheet in magnified size onto an A3 sheet; in each case, there is neither waste nor want."; S1 "Not only the operation of copying machines in offices and libraries, but also repro photography, microfilming, and printing are simplified by the 1:sqrt(2) aspect ratio of ISO paper sizes."; S1 "you cannot reduce or magnify from one U.S. format to the next higher or lower without leaving an empty margin"; S5 인치판 "129%: 8 1/2 × 11 → 11 × 17" | 표 1의 모든 A 크기 쌍: 남는 틈이 변 길이의 ≈ 1.24% 이하. A3 ↔ A4 ↔ A5: 최대 ≈ 0.69 mm. 레터 → 레저: 배율 ≈ 129%, 긴 쪽 여백 ≈ 70 mm(17인치 변의 ≈ 16%) |
| C14 | mm 반올림 때문에 생기는 차이는 1 mm도 안 된다. 설계 치수와 표 치수의 차이는 A0–A10 모두 0.7 mm 미만이고, A4는 설계 ≈ 210.2 × 297.3 mm와 약 0.3 mm 다르다. 표준이 허용하는 오차(150 mm 이하 ±1.5 mm, 150–600 mm ±2 mm)보다 훨씬 작다. | S1 계산식 표(A n의 너비 2^(−1/4−n/2) m, 높이 2^(1/4−n/2) m); S4 §7.1 "the tolerance for a given sheet size is the range outside of which a sheet cannot be regarded as being of a given size"; S4 §7.1 a) "for dimensions ≤ 150 mm: — upper limit +1,5 mm — lower limit −1,5 mm"; S1 "The allowed tolerances are ±1.5 mm for dimensions up to 150 mm, ±2 mm for dimensions above 150 mm up to 600 mm, and ±3 mm for dimensions above 600 mm."; S2 "±2.0 mm for dimensions in the range 150 to 600 mm" | A4: 2^(−2.25) m ≈ 210.22 mm, 2^(−1.75) m ≈ 297.30 mm, 차이 ≈ 0.30 mm. A0–A10 중 가장 큰 차이 ≈ 0.65 mm(A5·A6). 210 × √2 ≈ 296.98 mm (297과 ≈ 0.02 mm 차이) |

## Easy to misstate

- **반올림한 소수에는 = 대신 ≈를 쓴다.** "297 ÷ 210 = 1.41429", "√2 = 1.41421" ✗ →
  "297 ÷ 210 ≈ 1.41429", "√2 ≈ 1.41421" ✓. 141% ≈ √2, 71% ≈ 1/√2 ≈ 0.707,
  ≈ 0.99995 m², ≈ 4.99 g, ≈ 1.294 모두 같다. 정확한 값(210, 297, 1/16 m² =
  62,500 mm²)에만 =를 쓴다. 표준 원문도 "√2 : 1 = 1,414"라고 쓰지만 따라 쓰지 않는다.
- "A4의 비율은 **정확히** √2" ✗ → "√2에 맞춰 만든", "거의 정확히 √2" ✓ (C8).
- 설계값과 실제 치수를 섞지 않는다. "A0의 넓이는 1 m²", "비율은 √2"는 **설계값**이고
  표의 mm 치수는 그 근삿값이다. "설계 비율은 √2, 실제 치수는 mm 단위라 조금 달라요" ✓.
  단, 그 차이는 A4에서 약 0.3 mm이니 "눈에 띄게 다르다" ✗ (C14).
- "모든 치수를 mm 아래 **버림**했다" ✗ → A0는 반올림(≈ 840.9 → 841), 그 아래 크기는
  반으로 나누고 버림 ✓ (C8). S2의 "halving the area of the (unrounded) preceding
  paper size and rounding down"은 표 1과 맞지 않는다(A1이 594 × 840이 됨).
- 접는 방향은 **긴 변을 반으로**, 즉 짧은 변과 평행하게. 반대로 접으면 성립하지 않는다.
- "모양이 그대로" = 닮은꼴. 접힌 절반은 원래 종이를 **90° 돌린** 모양이다.
- 기호: 표준 원문(S4)은 **짧은 변이 x, 긴 변이 y**다. 대본의 x(긴 변)와 반대이니 원문
  식을 화면에 그대로 옮기지 않는다.
- 141%는 **변의 길이**가 1.41배라는 뜻이다. 넓이로는 약 2배(1.41² ≈ 1.99)다. "넓이가 1.41배" ✗.
- "복사기에는 모두 71% 버튼이 있다" ✗ → "A3 → A4 축소 버튼(보통 71%, 기종에 따라
  70%)" ✓ (C12). 71%는 1/√2 ≈ 70.71%보다 조금 커서, A3를 꽉 채운 원본은 A4보다
  ≈ 1 mm 크게 나온다. "mm까지 딱 맞는다" ✗ → "꼭 맞는다", "거의 딱 맞는다" ✓.
- "A 용지는 확대해도 모양이 안 변한다" ✗ (어떤 도형이든 같은 배율로 키우면 모양은
  그대로다) → "A4를 141%로 키우면 A3 용지에 꼭 맞는다" ✓ (C13). 요점은 모양이 아니라
  **다른 A 용지에 딱 맞는다는 것**이다.
- 리히텐베르크는 √2 비율 종이를 고안하거나 A 규격을 만든 사람이 아니다. 당시 종이가
  이미 그 비율이라는 것을 알아채고 장점을 **편지에 적은** 사람이다. "리히텐베르크가
  √2 비율 종이를 고안했다" ✗ (S7은 그를 이 형식의 발견자로 부르는 통념을 "falsch"라고 한다).
- 같은 비율의 용지 규격은 1798년 프랑스 법이 먼저 정했다. A0 = 1 m²에서 시작하는
  A·B·C 체계를 표준으로 만든 것은 DIN 476(1922)이다. "√2 용지 규격은 독일이 처음" ✗.
- 리히텐베르크의 편지 날짜는 출처마다 다르니(S1 10월 25일, S7 10월 17일) "1786년"까지만 쓴다.
- DIN 476 연도는 **1922년**(S1, S7). S2 현재판은 1921년이라고 적고 있어서 C9의
  근거에서 뺐다.
- A4 넓이 1/16 m²는 반올림 전 **설계값**이고, 실제 210 × 297 mm 종이는 62,370 mm²로
  조금 작다. 5 g도 근삿값(≈ 4.99 g)이다. 둘 다 "약"을 붙인다.
