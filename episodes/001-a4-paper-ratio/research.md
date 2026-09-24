# 리서치 · 001 A4 용지는 왜 1:√2일까

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과).

## 출처

접속일은 모두 2026-09-24.

- **[S1]** Markus Kuhn, "International standard paper sizes", University of
  Cambridge, 2025-12-08 수정. <https://www.cl.cam.ac.uk/~mgk25/iso-paper.html>
- **[S2]** Wikipedia, "ISO 216". <https://en.wikipedia.org/wiki/ISO_216>
- **[S3]** Wikipedia, "Letter (paper size)".
  <https://en.wikipedia.org/wiki/Letter_(paper_size)>
- 표준 원문은 ISO 216:2007이다. iso.org 페이지가 403을 반환해서 원문은 직접 확인하지
  못했고, S1과 S2의 서술이 서로 일치하는 것으로 대신했다.

## 주장

| # | 주장 | 근거 | 계산 검증 |
|---|------|------|-----------|
| C1 | A 시리즈(A0–A10)의 긴 변 : 짧은 변은 모두 √2 : 1이다(반올림 오차 이내). | S1 "the height-to-width ratio of all pages is the square root of two (1.4142 : 1)"; S2 "same aspect ratio, √2:1, within rounding error" | A0–A10 모두 √2와의 차이가 0.7% 이내. A4는 +0.005% |
| C2 | 짧은 변과 평행하게 반으로 자르거나 접으면 같은 비율이 유지된다. A3를 반으로 자르면 A4 두 장이 되고, A4를 반으로 자르면 A5가 된다. | S1 "cut one parallel to its shorter side into two equal pieces, then the resulting page will have again the same width/height ratio"; S2 "when cut or folded in half widthways, the halves also have the same aspect ratio" | 모든 n에서 A(n)의 절반 = A(n+1) (긴 변은 mm 단위 내림) |
| C3 | 반으로 접어도 비율이 그대로인 직사각형은 √2 : 1 하나뿐이다. 긴 변을 x, 짧은 변을 1이라 하면 x : 1 = 1 : x/2이므로 x² = 2다. | S2 "This ratio has the unique property ..." + 대수 | x = √2 = 1.414214에서 성립 |
| C4 | A4는 210 × 297 mm다. | S1 표, S2 | – |
| C5 | A0의 넓이는 1 m²다(841 × 1189 mm). | S1 "Format A0 has an area of one square meter"; S2 "area of 1 square metre before rounding" | 999,949 mm² = 0.99995 m² |
| C6 | A4는 A0를 네 번 반으로 나눈 크기라 넓이가 1/16 m²다. | S1 "the A4 format has an area of 1/16 m²" | 62,370 mm² (1/16 m² = 62,500 mm²) |
| C7 | 흔한 80 g/m² 복사지 A4 한 장은 약 5 g이다. | S1 "weighs with the common paper quality 5 g per page" | 4.99 g |
| C8 | 치수를 mm 단위로 내림하므로 비율은 √2의 근삿값이다. 297 ÷ 210 = 1.41429, √2 = 1.41421. | S1 "rounded to the next lower integer number of millimeters"; S2 | 표시한 값 그대로 |
| C9 | 1786년 물리학자 리히텐베르크가 편지에서 √2 비율 종이의 장점을 적었다. 독일이 1922년 DIN 476으로 표준화했고(발터 포르스트만), 1975년 국제 표준 ISO 216이 되었다. | S1, S2 | – |
| C10 | 북미(미국·캐나다)와 필리핀, 중남미 일부를 빼면 전 세계가 이 규격을 쓴다. | S1 "used in almost all countries on this planet, with the exception of North America"; S2 | – |
| C11 | 미국 Letter 용지(8.5 × 11 인치)는 비율이 1.294이고, 반으로 접으면 1.545가 되어 모양이 바뀐다. | S3 "8.5 by 11 inches (215.9 by 279.4 mm)" + 계산 | 1.294 → 1.545 |

## 틀리기 쉬운 표현

- "A4의 비율은 **정확히** √2" ✗ → "√2에 맞춰 만든", "거의 정확히 √2" ✓ (C8).
- 접는 방향은 **긴 변을 반으로**, 즉 짧은 변과 평행하게. 반대로 접으면 성립하지 않는다.
- "모양이 그대로" = 닮은꼴. 접힌 절반은 원래 종이를 **90° 돌린** 모양이다.
- 리히텐베르크는 A 규격을 만든 사람이 아니라 √2 비율의 장점을 **기록한** 사람이다.
  표준을 만든 것은 DIN 476(1922)이다.
- A4 넓이 1/16 m²와 5 g은 반올림 전 기준의 근삿값이다. "약"을 붙인다.
