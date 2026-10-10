# 리서치 · 006 2, 3, 4, 82000, 그다음은?

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과, 5초 남짓). `verify.py`는 2, 3, 4, 82000의 진법 표기를
계산하고, 2..100,000과 2..1,000,000을 직접 세고, 5진법으로 0과 1만 쓰는 수를 5^20(≈ 9.5 ×
10^13) 아래에서 모두 만들어 3·4·6진법을 검사하고, 36q 조건과 어림(휴리스틱)의 숫자를 다시
계산한다. "다음 수가 있는지"는 코드로 확인할 수 없어서 출처가 받친다. 인용문은 모두 원문을
내려받아 코드로 대조했다(공백 무시, 유니코드 NFKC 정리(PDF의 합자 ﬁ 등), 따옴표·프라임
모양 통일, PDF 텍스트에서 빠지는 위첨자 기호 ^ 무시).

토픽이 요청한 판정을 먼저 적는다.

- **정의와 항: 토픽 그대로 맞다(C1–C4).** OEIS A258107은 "1보다 큰 수 가운데 2진법부터
  n진법까지 모두 0과 1로만 쓰이는 가장 작은 수"이고, 항은 n = 2, 3, 4, 5에 대한 2, 3, 4,
  82000이다. 2진법에서는 모든 수가 0과 1이라 실제로 걸러 내는 조건은 3진법부터다. 화면에서
  2진법 줄은 늘 켜져 있어야 맞다. 다만 토픽의 두 문장은 고친다. "Where it goes"의 "규칙:
  어느 진법으로 써도 0과 1만"은 "모든 진법"으로 들리니 "2진법부터 5진법까지"로(C5), Insight의
  "82000은 운 좋게 걸린 하나"는 "무작위라고 치면 운이 좋은 편"으로(C14) 쓴다.
- **관련 수열 번호 하나를 고친다(C6, C16).** A146025는 "3·4진법"이 아니라 **2·3·4·5진법**
  모두 0과 1인 수이고, 항은 0, 1, 82000이다. 2·3·4진법(사실상 3·4진법)은 A258981이고,
  82000은 그 목록에서 0을 첫째로 셀 때 27번째(1보다 큰 수로는 25번째)다. 3·4진법만이면
  82000 앞에도 4, 81, 84, 85, 256, … 24개가 있다.
- **다음 항: 아무도 모른다. 기록된 탐색대로라면, 있어도 1100만 자리가 넘는다(C7–C9).**
  6진법까지의 다음 수(a(6))는 2–5진법도 만족해야 하니 A146025의 넷째 항이어야 한다. 그런데 A146025는 82000 다음 수를
  2008년 약 2만 자리, 2013년 5진법 3125자리, 2015년 10진법 1100만 자리까지 찾았지만 못
  찾았다(가장 큰 기록은 Klinkhamer 2015, 일주일 계산, 한 사람의 탐색이고 논문들은 아직
  2^65520까지만 인용한다). 그 뒤 더 큰 탐색 기록은 찾지 못했다. 이 탐색들은 모두 2–5진법
  수(A146025)를 찾은 것이다. 6진법까지 되는 수를 따로 1100만 자리까지 찾은 게 아니라, 5진법까지
  되는 수조차 82000 뒤로 없었으니 6진법까지 되는 수는 있어도 그보다 크다는 논리다.
  "더 없다"는 추측이고 증명은 없다(OEIS의 Sloane 2016, Mondot 2016 코멘트, 논문들의
  "folklore conjecture"). 5진법까지 만족하는 수도 82000 다음은 알려진 게 없다.
- **2026년 코멘트는 있다. 36q 또는 36q+1이 맞다(C10).** 2026년 7월 Devansh Singh가
  A258107에 단 코멘트로, a(6)이 있다면 36q 또는 36q+1 꼴이라는 필요조건이다. 4진법과
  6진법 조건만으로 나오는 간단한 나머지 계산이고, `verify.py`로 확인했다. 후보를 좁힐 뿐
  다음 수를 찾거나 없다는 쪽으로 다가간 결과는 아니다.
- **증명된 것은 "아주 느리게 는다"까지다(C11).** 한 진법만으로도 0과 1인 수는 드물다(5진법만
  해도 n까지 약 n^0.43개, C12). Burrell과 Yu(2021)가 증명한 것은 그보다 센 말로, "4·5진법 둘
  다 0과 1인 수는 1부터 n까지 세면 n의 어떤 거듭제곱보다도 느리게 는다"이고, 저자들은 이것을
  자기들이 아는 한 이 추측의 첫 진전이라 했다. 유한하다는 증명도, 82000 뒤에 없다는 증명도
  아니다.
- **"확률"은 어디까지 정직한가(C12–C15).** 세 층으로 나눈다.
  1. **한 진법 안의 비율은 정확한 세기다.** b진법 d자리 이하의 수 b^d개 가운데 0과 1만 쓰는
     수는 정확히 2^d개다. 자리마다 b개 중 2개, 자리가 늘 때마다 2/b배. 여기엔 가정이 없다.
  2. **진법을 더할 때 실제로 확 준다는 것도 세어서 보일 수 있다.** 2부터 100,000까지
     99,999개 → 3진법 통과 2,046 → 4진법까지 30 → 5진법까지 1(82000). 토픽의 "걸러지는
     그림"은 이 실제 숫자로 그리면 어림이 필요 없다.
  3. **진법끼리 비율을 곱하는 것은 가정이다.** "자릿수가 무작위이고 진법끼리 상관없다고
     치면"이라는 Evans(2015)의 어림이고, 그는 스스로 "느슨한 논증", "미심쩍은 가정"이라
     부른다. 그 어림으로는 5진법까지 1보다 큰 수의 기대 개수가 0.08–0.59라서, 무작위라고
     치면 82000 하나도 운이 좋은 편으로 볼 수 있다(Evans: "might be counted as quite a lucky
     result"). 숫자는 거칠다(같은 모형이 100만까지 3·4진법을 통과할 수를 약 11개로 보지만
     실제는 41개). 그러니 대본에서 "확률"은 "주사위처럼 무작위라고 치면"을 붙인 말로만 쓰고,
     82000이나 다음 수에 확률 값을 붙이지 않는다. 수는 무작위가 아니고 진법끼리도 얽혀 있다
     (6진법 끝자리 1 → 3진법 끝자리 1, C10의 36). 다만 이 얽힘은 모두 6진법이 끼는 경우이고,
     82000을 정하는 3·4·5진법은 공통 소인수가 없어 Evans는 어림이 크게 어긋나지 않을 거라고
     본다(C15).
- **토픽 문장 하나는 조금 고친다.** "자릿수 d인 수 중 0과 1만 쓰는 수가 2^d개"는 "d자리
  이하(0부터 b^d − 1까지)"일 때 맞다. 정확히 d자리인 수로 세면 2^(d−1)개다(C12).
- **그림에 쓸 만한 것(C18).** 82000 바로 앞뒤 100 안에 네 줄 중 세 줄이 켜지는 "아까운"
  수가 일곱 개 몰려 있다(81900, 81901, 81921, 81984, 81985, 82001, 82005). 계수기가
  82000에 다가갈 때 세 줄이 켜졌다 꺼지는 장면을 넣을 수 있다. 계수기는 2부터 센다. 0이나
  1에서 시작하면 네 줄이 다 켜진다.
- **낱말은 맨 아래 「낱말」 절에.** 화면은 "3진법", 말은 "삼진법". 자리올림은 "한 자리가 3이
  되면 윗자리로 1이 올라가요"처럼 풀고, 초등 수학 용어는 "받아올림"이다.
- **Numberphile(2015)은 맥락으로만 확인했다(C19).** 영상 제목·날짜·설명란만 읽었고 영상
  내용은 보지 않았다. 설명란은 James Grime 출연, Thomas Oléron Evans에게서 착안했다고
  적는다.

## Sources

접속일은 모두 2026-10-10. OEIS 항목은 `?fmt=text` 내부 형식으로 받아 대조했다.

**OEIS (1차 기록)**

- **[S1]** OEIS A258107, "Smallest number > 1 whose representation in all bases up to n
  consists only of 0's and 1's.", Bernardo Boncompagni 2015-05-20 등록, 개정 #120
  (2026-07-20). <https://oeis.org/A258107>
  - 2026-07-14 Devansh Singh 코멘트(C10)가 들어 있다. 링크된 Singh의 Google 문서(S13)도
    읽었다. Richard Green의 Google+ 글 링크는 Google+가 닫혀 **열지 못했다**.
- **[S2]** OEIS A146025, "Numbers that can be written in bases 2, 3, 4, and 5 using only
  the digits 0 and 1.", Daniel Mondot 2008-10-26 등록, 개정 #76 (2025-12-26).
  <https://oeis.org/A146025>
- **[S3]** OEIS A258981, "Numbers containing only 1's and 0's in their base-2, base-3, and
  base-4 representations.", Phil Lane 2015-06-15 등록, 개정 #64 (2025-09-22).
  <https://oeis.org/A258981>
- **[S4]** OEIS A263684, "Numbers whose base-4 and base-5 representations have only 0's and
  1's.", Robert Israel 2015-10-23 등록, 개정 #21 (2022-07-30). <https://oeis.org/A263684>
- **[S5]** OEIS A268337, "Numbers which have only digits 0 and 1 in bases 3 and 5.",
  M. F. Hasler 2016-02-01 등록, 개정 #27 (2021-12-13). <https://oeis.org/A268337>

**어림과 탐색**

- **[S6]** Thomas Oléron Evans, "Solution: Covering all the bases", *Mathistopheles* (블로그),
  2015 (그림 파일 2015-04/05, 첫 댓글 2015-05-20). 수열을 퍼즐로 낸 글 "Covering all the
  bases"의 풀이.
  <http://www.mathistopheles.co.uk/maths/covering-all-the-bases/solution-covering-all-the-bases/>
  - 수식은 그림 파일이라 내려받아 눈으로 읽었다: (1/(b−1))(2/b)^(d−1),
    d = ⌊1 + log_b n⌋, p(n,b) = (1/(b−1)!) ∏_{i=2..b} (2/i)^⌊log_i n⌋,
    e(b) = Σ_{n=2..∞} p(n,b),
    (1/(b−1)!) Σ n^α(b) ≤ e(b) < (b/2^(b−1)) Σ n^α(b) (합은 n = 2부터, 그림에는 i = 2로 오기),
    α(b) = 1 − b + Σ_{i=2..b} log_i 2.
  - 본문의 "greater than 10^21"은 그가 확인한 값(6진법 1이 27개 ≈ 2.0 × 10^20)과 맞지 않는
    오기다(10^20이 맞다). 지금은 C7의 탐색 범위가 훨씬 크니 쓸 일이 없다.
- **[S7]** Alex P. Klinkhamer, "Digits of 82000", grencez.dev. 탐색 2015-08-29, 글
  2020-11-29 (2020-12-19 수정). <https://grencez.dev/2015/82000-digits-20150829>
  - 탐색 코드(search82000.js, .c)를 공개했다. 따로 검증한 논문은 찾지 못했다(S8, S9는
    2^65520까지만 인용한다). 한 사람의 컴퓨터 탐색 기록이다.
- **[S8]** Stuart A. Burrell, Han Yu, "Digit expansions of numbers in different bases",
  arXiv:1905.00832v3 [math.NT], 2021-04-23 (v1 2019-05-02); *Journal of Number Theory* 226
  (2021), 284–306. <https://arxiv.org/abs/1905.00832> PDF 텍스트는 pypdf로 뽑았다.
- **[S9]** Daniel Glasscock, Joel Moreira, Florian K. Richter, "Additive and geometric
  transversality of fractal sets in the integers", arXiv:2007.05480v3 [math.NT], 2025-01-08
  (v1 2020-07-10); *J. London Math. Soc.* 109 (2024), e12902.
  <https://arxiv.org/abs/2007.05480> (OEIS는 옛 제목 "Additive transversality of fractal
  sets in the reals and the integers"로 링크한다.)

**맥락**

- **[S10]** Numberphile, "Why 82,000 is an extraordinary number", YouTube, 2015-06-12, 7분 45초.
  <https://www.youtube.com/watch?v=LNS1fabDkeA> 페이지의 제목·게시일·설명란만 읽었고 영상은
  보지 않았다.

**낱말**

- **[S11]** 국립국어원, 『표준국어대사전』 표제어 이진법(二進法), 십진법(十進法), 진법(進法),
  삼진법(三振法). <https://stdict.korean.go.kr/search/searchResult.do?searchKeyword=이진법>
  (같은 주소에서 검색어만 바꿈). 받아올림·자리올림·오진법은 표제어가 없다.
- **[S12]** 국립국어원, 『우리말샘』 표제어 삼진법(三進法), 오진법, 받아올림, 자리올림수.
  <https://opendict.korean.go.kr/search/searchResult?query=삼진법> (같은 주소에서 검색어만
  바꿈). 사진법·육진법은 수학 뜻의 표제어를 찾지 못했다(십육진법만 있다).

**읽었지만 주장에 쓰지 않은 것**

- **[S13]** Devansh Singh, "Some necessary congruence conditions for the possible existence of
  a(6) in OEIS A258107", Google 문서, 2026-06-24 (S1에 링크).
  <https://docs.google.com/document/d/1VHlYp-Q4tbB5JSKJmme0sDzwXccpoGBDSpHzn47jZ3k/edit>
  비공식 메모이고 12q, 12q+1, 12q+6, 12q+7 꼴까지만 좁힌다. 더 좁힌 S1의 36q 코멘트를 쓴다.

**열지 못한 것**

- Andy Bohn, "2, 3, 4, 82000, ?" (<http://andybohn.com/82000/>): 404, 웹 아카이브에도 없다.
- Richard Green, "A Curious Property of 82000" (Google+, S1에 링크): 서비스 종료.

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | OEIS A258107은 "1보다 큰 수 가운데, 2진법부터 n진법까지 어느 진법으로 써도 0과 1만 나오는 가장 작은 수"를 n = 2, 3, 4, …에 대해 늘어놓은 수열이다. 알려진 항은 2, 3, 4, 82000 넷이고, 차례로 2진법까지, 3진법까지, 4진법까지, 5진법까지의 답이다. | S1 "Smallest number > 1 whose representation in all bases up to n consists only of 0's and 1's."; S1 "%S A258107 2,3,4,82000"; S1 "%O A258107 2,1" (첫 항의 번호가 n = 2); S6 "In this sequence, the nth term is the smallest positive integer (other than 1) that can be expressed in all bases from 2 to n using only the digits “1” and “0”." | n = 2..5 각각 직접 탐색: [2, 3, 4, 82000] |
| C2 | 2진법에서는 모든 수가 0과 1로만 쓰인다. 그래서 2진법까지의 답은 2이고, 실제로 걸러 내는 조건은 3진법부터다. 0과 1은 어느 진법에서나 0, 1이라 빼고, 1보다 큰 수만 센다. | S6 "In base 2, every number consists only of “1” and “0”." / "The second term is 2."; S1 "No smaller number, except 1, can be expressed in such bases with only 0's and 1's." | 2..100,000이 모두 2진법 0/1. 0과 1은 2..10진법에서 한 자리 0, 1 |
| C3 | 3은 2진법으로 11, 3진법으로 10이다. 2는 3진법으로 2라서 탈락한다. 4는 2진법 100, 3진법 11, 4진법 10이다. 3은 4진법으로 3이라서 탈락한다. | S6 "2 is ‘2’ in base 3, so that is no good." / "3 is ‘11′ in binary AND ‘10′ in base 3." / "3 is ‘3’ in base 4, so that is no good either." / "4 is ‘100′ in binary, ‘11′ in base 3 and ‘10′ in base 4."; S1 "a(4) = 4 because it is 100 in base 2, 11 in base 3 and 10 in base 4." | 표기 직접 계산 |
| C4 | 82000은 2진법 10100000001010000(17자리), 3진법 11011111001(11자리), 4진법 110001100(9자리), 5진법 10111000(8자리)이다. 1보다 크고 82000보다 작은 수는 모두 3·4·5진법 가운데 적어도 하나에서 2 이상의 숫자가 나온다. 4 다음 항이 갑자기 82000으로, 약 2만 배 뛴다. | S1 "a(5) = 82000: 82000 in bases 2 through 5 is 10100000001010000, 11011111001, 110001100, 10111000, containing only 0's and 1's, while all smaller numbers have a larger digit in one of those bases."; S6 "There are no smaller numbers with the desired property." / "before suddenly jumping four orders of magnitude to 82000"; S2 "82000 = 10100000001010000 (2) = 11011111001 (3) = 110001100 (4) = 10111000 (5)." | 표기와 자릿수 직접 계산. 2..81,999를 모두 검사해 3·4·5진법을 다 통과하는 수 없음. 82000 ÷ 4 = 20,500. S1의 예 12345(2진법 11000000111001, 3진법 121221020, 4진법 3000321, 5진법 343340)도 확인 |
| C5 | 82000이 "모든 진법"에서 0과 1인 것은 아니다. 6진법으로는 1431344이고, 10진법으로는 82000이라 8과 2가 있다. 1보다 큰 어떤 수도 모든 진법에서 0과 1일 수는 없다(수 N은 N보다 큰 진법에서 한 자리 숫자 N이다). | S6 "since 82000 itself is no good (82000 is ‘1431344’ in base 6)"; S7 "Base 6: 1431344" | 6진법 1431344. N = 2..1000에서 N+1진법 표기가 한 자리 N |
| C6 | 2·3·4·5진법 모두 0과 1만 나오는 수(OEIS A146025)로 지금 알려진 것은 0, 1, 82000 셋뿐이다. 1보다 큰 수로는 82000 하나다. | S2 "Numbers that can be written in bases 2, 3, 4, and 5 using only the digits 0 and 1." / "%S A146025 0,1,82000"; S8 "A folklore conjecture in number theory states that the only integers whose expansions in base 3, 4 and 5 contain solely binary digits are 0, 1 and 82000."; S9 "{0, 1, 82000} is exactly the set of non-negative integers that can be written in bases 2, 3, 4, and 5 using only the digits 0 and 1" | 5진법 0/1 수 2^20개(5^20 ≈ 9.54 × 10^13 아래 전부)를 만들어 4·3진법 검사: 0, 1, 82000만 남음 |
| C7 | 82000 다음 수(2–5진법)는 컴퓨터로 여러 번 찾았지만 나오지 않았다. 2008년 Daniel Mondot가 2^65520(≈ 3 × 10^19723, 약 2만 자리)까지, 2013년 James G. Merickel이 5진법 3125자리(≈ 10^2184)까지, 2015년 Alex P. Klinkhamer가 10진법 1100만 자리까지(일주일 계산) 찾았다. 2013년 범위는 2008년보다 작으니(2008년 기록은 2016년에야 OEIS에 적혔다) "점점 더 멀리"로 묶지 않는다. OEIS에 적힌 가장 큰 탐색은 2015년의 1100만 자리이고, 그 뒤 더 큰 기록은 찾지 못했다. | S2 "Originally checked to 2^65520 (or about 3*10^19723) on Nov 07 2008." / "Checked to 3125 (5^5) base-5 digits in just under 1/2 hour" / "_James G. Merickel_, Dec 01 2013" / "Checked to 11 million decimal digits in 1 week using an algorithm that, upon finding that the current guess has non-{0,1} digits in a particular base, increases the guess to only have {0,1} digits in that base." / "_Alex P. Klinkhamer_, Aug 29 2015"; S7 "Date: 2015-08-29 (searched for a number of https://oeis.org/A146025 after 82000 up to 11 million decimal digits)"; S8 "so far, numerical computations have not found any counter-examples up to 2^65520" | 2^65520 ≈ 3.06 × 10^19723 (19,724자리), 5^3125 ≈ 10^2184.3 (2,185자리) |
| C8 | 다음 항 a(6), 곧 2–6진법 모두 0과 1인 1보다 큰 가장 작은 수는 아직 아무도 모른다. 있는지 없는지도 모른다. a(6)은 2–5진법도 만족해야 하니 A146025에 들어가야 하고 82000은 6진법에서 탈락하므로, OEIS에 적힌 탐색(C7)대로라면 a(6)이 있어도 10진법으로 1100만 자리가 넘는 수다. | S6 "Obviously, the sixth term of our sequence would also have to be in Sequence A146025. Therefore, since 82000 itself is no good (82000 is ‘1431344’ in base 6), the sixth term must have over 2000 (base 10) digits, if it exists at all"; S7 "searched for a number of https://oeis.org/A146025 after 82000 up to 11 million decimal digits"; S1 "Thus, if a(6) exists, it must be of the form 36*q or 36*q+1" | S6의 논리(2013년 탐색 범위로 "2000자리 넘는다")에 S7의 2015년 범위를 넣은 것. 5^20 아래에서 2–6진법 모두 0/1인 1보다 큰 수 없음 |
| C9 | "더 없다"는 추측이고 증명은 없다. OEIS는 A146025와 A258107 모두에 "그럴듯한 추측이지만 증명되지 않았다"고 적고, 논문들은 이것을 수학자들 사이에 전해 오는 추측(folklore conjecture)이라 부른다. 수열을 퍼즐로 낸 Evans도 열린 문제라고 했다. | S1 "As with A146025, it is a plausible conjecture that there are no more terms, but this has not been proved."; S2 "It is a plausible conjecture that there are no more terms, but this has not been proved." / "since it is only a conjecture that there are no further terms"; S8 "A folklore conjecture in number theory"; S9 "A related folklore conjecture in number theory"; S6 "I do not think there are any more terms in the sequence, but it is an open problem" | – |
| C10 | 2026년 7월 OEIS A258107에 Devansh Singh의 코멘트가 붙었다(코멘트 날짜 7월 14일, 항목 개정 7월 20일). a(6)이 있다면 36q 또는 36q+1 꼴(q ≥ 1)이라는 필요조건이다. 4진법과 6진법에서 0과 1만 나온다는 조건만으로, 6진법 끝에서 둘째 자리가 0이어야 하고 그래서 6진법 끝 두 자리가 00이나 01이 된다. 후보를 좁히는 조건일 뿐, 다음 수를 찾거나 없다는 쪽으로 다가간 결과는 아니다. | S1 "From _Devansh Singh_, Jul 14 2026" / "Therefore A_6(1) = 0." / "Hence the last two base-6 digits of N are 00 or 01, so N == 0 or 1 (mod 36). Thus, if a(6) exists, it must be of the form 36*q or 36*q+1, where q >= 1." | 6진법 0/1 수 2^16개(6^16 아래 전부) 중 4진법도 0/1인 것은 0, 1, 1296, 1297이고 모두 36으로 나눈 나머지 0 또는 1, 6진법 끝에서 둘째 자리 0. 0..10^6 직접 검사도 같음. 82000 ≡ 28 (mod 36). 36은 6진법 100이지만 4진법 210이라, 조건은 필요조건일 뿐 |
| C11 | 증명된 것은 "아주 느리게 는다"까지다. Burrell과 Yu(arXiv 2019, 학술지 2021)는 4진법과 5진법에서 모두 0과 1만 나오는 수가, 1부터 n까지 세면 n의 아무리 작은 거듭제곱(n^ε, 상수배 무시)보다도 적다는 것을 증명했고, 이것을 자기들이 아는 한 이 추측의 첫 진전이라고 했다. 한 진법만의 "드물다"(5진법만 해도 n까지 약 n^0.43개, C12)보다 센 말이다. 그런 수가 유한하다는 증명도, 82000 뒤에 없다는 증명도 아니다. Glasscock·Moreira·Richter가 이 결과를 일반화했다. | S8 "In this paper, we present the first progress on this conjecture." / "To our knowledge, the following is the first progress on this conjecture." / "the base 4 and 5 expansions of k contain only the digits 0, 1"; S9 "A partial answer to this was given recently by Burrell and Yu [BY], who proved that the set A of non-negative integers that can be written in bases 4 and 5 using only the digits 0 and 1 satisfies" / "generalize the aforementioned result of Burrell and Yu" | – |
| C12 | 한 진법 안에서는 정확히 셀 수 있다. b진법으로 d자리 이하인 수(0부터 b^d − 1까지 b^d개) 가운데 0과 1만 쓰는 수는 정확히 2^d개다. 자리마다 b개 숫자 중 2개만 되니 비율은 (2/b)^d이고, 자리가 하나 늘 때마다 2/b배가 된다. 예: 3진법 한 자리면 3개 중 2개, 열 자리 이하면 59,049개 중 1,024개(≈ 1.7%). 정확히 d자리인 수로 세면 (b−1)·b^(d−1)개 중 2^(d−1)개다. | S6 "the digits of any d-digit positive integer n, expressed in base b, can be considered to be randomly and independently selected from the b possible digits used in that base (with the exception of the first digit, which is additionally constrained not to be zero)" + S6 식(그림) (1/(b−1))(2/b)^(d−1). S6은 이 값을 ‘무작위라고 치면의 확률’로 쓰지만, d자리 수 전체 가운데의 비율로는 가정 없이 정확하다 | b = 3..6, d = 1..7을 전부 세어 2^d, 2^(d−1) 확인. 1024 ÷ 59049 ≈ 1.73% |
| C13 | 진법을 하나씩 더하면 살아남는 수가 확 준다(직접 센 값). 2부터 100,000까지 99,999개 가운데 2진법은 모두 통과하고, 3진법까지 0과 1인 수는 2,046개, 4진법까지는 30개, 5진법까지는 82000 하나다. 2부터 1,000,000까지로 넓혀도 999,999 → 8,190 → 41 → 1(82000)이다. 진법 하나씩 따로 보면 100,000까지 3진법 2,046개, 4진법 510개, 5진법 254개다. | 정의(S1–S3)에서 직접 셈 | `verify.py`가 두 범위를 차례로 걸러 셈 |
| C14 | 왜 드문가의 어림(휴리스틱, Evans 2015). 자릿수가 무작위이고 진법끼리 서로 상관없다고 치면, 수 n이 2–b진법에서 모두 0과 1일 "확률"은 진법마다의 비율을 곱한 것이고 대략 n^α(b)로 준다(α(b) = 1 − b + Σ log_i 2). α(3) ≈ −0.37, α(4) ≈ −0.87, α(5) ≈ −1.44로 진법을 더할 때마다 작아진다. 지수가 −1보다 크면(4진법까지) 이런 수가 끝없이 나올 것으로, 작으면(5진법부터) 몇 개 안 될 것으로 기대한다. 이 어림으로 5진법까지 1보다 큰 수의 기대 개수는 0.08과 0.59 사이라서, 무작위라고 치면 82000 하나가 있는 것도 운이 좋은 편으로 볼 수 있다. 기대 개수는 대부분 작은 수 쪽에 몰려 있다. | S6 "Let’s take an extremely naive view and suppose that the digits of any d-digit positive integer n, expressed in base b, can be considered to be randomly and independently selected from the b possible digits used in that base" / "So, if we further assume that the digits of n in different bases can be considered to be independent (I will come back to these dodgy assumptions!)" / "α(3) ≈ −0.37 > −1. Therefore e(3) = ∞." / "α(4) ≈ −0.87 > −1. Therefore e(4) = ∞." / "α(5) ≈ −1.44 < −1. Therefore, the sum converges" / "should lie between 0.08 and 0.59. In other words, even the fact that there is one number like this (82000) might be counted as quite a lucky result." / "Most of the expectation of finding solutions is concentrated around the lower integers (the bigger n gets, the more digits have to fall our way)" | α 값 재계산. Σ_{n≥2} n^α(5) ≈ 1.89, ÷ 4! ≈ 0.08, × 5/16 ≈ 0.59. 2..200,000에서 997 간격으로 뽑은 n마다 p(n,5)가 두 경계 사이. 모형을 그대로 2..10^80까지 더하면 ≈ 0.21(경계 사이)이고 그중 ≈ 0.20이 n ≤ 1000, 82000 위는 ≈ 0.002(대본용 아님, 확률로 읽히기 쉽다). 같은 식에 b = 6을 넣으면 α ≈ −2.05, 경계 0.005–0.11, 모형 합 ≈ 0.023(우리 계산, S6에 없는 값). 이 값의 99% 넘게가 n ≤ 1000에서 나와 이미 확인된 범위라, a(6)에 대해서는 말해 주는 게 없다. 대본에 쓰지 않는다 |
| C15 | 이 어림은 증명이 아니고, 가정도 맞지 않는다. 수의 숫자는 무작위로 정해지지 않고 진법끼리도 얽혀 있다. 예를 들어 6진법으로 끝자리가 1이면 3진법으로도 끝자리가 1이다(C10의 36 조건도 이런 얽힘이다). 다만 이런 예는 6진법이 끼는 경우이고, 3·4·5진법은 공통 소인수가 없어서 Evans는 이 셋에는 어림이 통할 거라고 본다. 숫자로는 대략만 맞는다. 같은 모형이 2..1,000,000에서 2–4진법을 통과할 수로 약 11개를 내지만 실제는 41개다. 그래서 경향(진법을 더할수록 확 줄고, 5진법부터는 기대 개수가 1 미만)만 쓴다. | S6 "Clearly, there are significant issues with this argument. The digits of a particular number in a certain base are not chosen randomly, nor are they generally independent from one base to another. A number that ends in a “1” in base 6 will also end in a “1” in base 3, for example." / "However, I do have the following loose argument, which I feel is at least suggestive that we may already have found all there is to find." / "After all, 3, 4 and 5 are the only bases that are actually relevant to the argument given above and they have no common factors (unlike 3 and 6 in the example given above)." | 모형 합(2..10^6): 2–4진법 ≈ 11.4(실제 41). 범위 끝을 3^12 − 1, 4^10 − 1, 3^13 − 1로 바꿔도 10–12 대 41. 6으로 나눈 나머지 1 → 3으로 나눈 나머지 1 |
| C16 | 3진법과 4진법만(곧 2·3·4진법) 따지면 이런 수는 계속 나온다(OEIS A258981): 0, 1, 4, 81, 84, 85, 256, 273, … 82000은 이 목록의 27번째(0을 첫째로 셀 때, 1보다 큰 수로는 25번째)이고, 뒤로도 86032, 86277, … 이어진다. 띄엄띄엄 몰려서 나오고 사이에 큰 빈틈이 있다. 끝없이 나오는지는 증명되지 않았다(데이터와 어림은 끝없이 나온다는 쪽이다). 5진법 조건이 붙으면 82000 하나로 확 바뀐다. | S3 "Numbers containing only 1's and 0's in their base-2, base-3, and base-4 representations." / "Note that a(27) = 82000 also contains no digit > 1 in base 5, see A146025." / "there tend to be clusters of these numbers, with very large gaps where a number with this property cannot be found"; S8 "In stark contrast to the setting of Theorem 1.2, there appear to be infinitely many n such that S(n) > 0, and the proof of Theorem 1.2 sheds some light on why the base 5 requirement induces such a dramatic transition." / "It is already interesting to see whether S(n) > 0 for infinitely many n."; S6 "This suggests that there are an infinite number of positive integers expressible using only “1” and “0” in bases 2 through to 4" | 0..263,169 직접 열거 35개가 S3 데이터와 일치, 82000은 27번째, 1보다 크고 82000 이하인 것 25개 |
| C17 | 4진법과 5진법만 따져도 드물다(OEIS A263684). 0, 1, 5, 16400, 16401, 16405, 82000, 82001, 82005가 전부로 보이고, 10^500 아래에는 더 없다. | S4 "%S A263684 0,1,5,16400,16401,16405,82000,82001,82005" / "These appear to be all the terms. There are no more below 10^500." | 5^20 아래 열거가 S4 목록과 일치 |
| C18 | 82000 근처에는 "아깝게" 네 줄 중 세 줄이 켜지는 수가 몰려 있다. 2..100,000에서 3·4·5진법 가운데 정확히 둘을 통과하는 수는 46개이고, 그중 일곱 개가 82000 앞뒤 100 안에 있다: 81900, 81901(3·5진법), 81921, 81984, 81985(3·4진법), 82001, 82005(4·5진법). | 정의에서 직접 셈. S5 "%S A268337 0,1,30,31,756,3250,3276,3280,81255,81256,81280,81900,81901,82000"; S3 "81921,81984,81985,82000"; S4 "82000,82001,82005" | `verify.py`가 2..100,000을 세고 각 수의 통과 진법 확인 |
| C19 | 맥락. 2·3·4·5진법 수열(A146025)은 2008년 Daniel Mondot가 OEIS에 올렸다. 2, 3, 4, 82000 수열은 Thomas Oléron Evans가 2015년 블로그 퍼즐로 냈고, 같은 해 5월 20일 Bernardo Boncompagni가 OEIS A258107로 올렸다. Numberphile 영상 "Why 82,000 is an extraordinary number"(2015-06-12)는 James Grime이 나오고, Evans에게서 착안했다고 설명란에 적는다. | S2 "_Daniel Mondot_, Oct 26 2008"; S1 "_Bernardo Boncompagni_, May 20 2015"; S6 "Although this sequence is not in the rather fabulous On-line Encyclopedia of Integer Sequences [UPDATE: It is now.]"; S10 "Why 82,000 is an extraordinary number" / "2015-06-12" / "This video features Dr James Grime" / "Cheers to Thomas Oléron Evans for inspiring James" | – |
| C20 | b진법은 0부터 b−1까지 b개의 숫자를 쓰고, 한 자리가 b가 되면 그 자리는 0이 되고 윗자리로 1을 올린다. 그래서 3진법은 0, 1, 2만 쓰고 0, 1, 2, 10, 11, 12, 20, …으로 세며, 5진법은 0부터 4까지 쓴다(4 다음이 10). 2진법으로 세면 0, 1, 10, 11, 100이다. | S11 이진법 "숫자 0과 1만을 사용하여, 둘씩 묶어서 윗자리로 올려 가는 표기법. 십진법의 0, 1, 2, 3, 4는 이진법에서는 0, 1, 10, 11, 100이 된다."; S11 십진법 "숫자 0, 1, 2, 3, 4, 5, 6, 7, 8, 9를 써서 10배마다 윗자리로 올려 나아가는 표시법이다."; S12 삼진법 "숫자 0, 1, 2만을 사용하여 모든 수를 표기하는 진법."; S12 오진법 "5를 단위로 하여 수를 나타내는 방법. 숫자를 0~4까지 사용한다." | 0..9의 3진법, 0..4의 2진법, 4..6의 5진법 표기 |

## Easy to misstate

- **"82000은 0과 1로만 쓰이는 유일한 수"** ✗. 0과 1도 그렇고, 3·4진법까지만 따지면 4, 81,
  84, … 많다(C16). → "2진법부터 5진법까지 모두 0과 1인 수 가운데 1보다 큰 수로는 82000
  하나만 알려져 있다" ✓. "유일하다"도 증명이 아니라 지금까지 찾은 결과다(C6, C9).
- **"모든 진법에서 0과 1"** ✗ → "2진법부터 5진법까지" ✓. 82000은 6진법 1431344, 10진법
  82000이다. 1보다 큰 어떤 수도 모든 진법에서 0과 1일 수 없다(C5).
- **"2, 3, 4, 82000은 각각 2·3·4·5진법에서 0과 1인 수"** ✗ → "2진법**부터** 그 진법**까지**
  모두" ✓. 4는 4진법에서만이 아니라 2·3·4진법 모두에서 0과 1이다(C1).
- **"다음 수는 없다", "없다는 게 증명됐다"** ✗. **"다음 수가 있는데 아직 못 찾았다"** ✗(있는지도
  모른다). → "아직 아무도 못 찾았고, 있는지도 몰라요", "없을 거라는 추측만 있어요" ✓
  (C8, C9).
- **"컴퓨터로 끝까지 확인했다"** ✗ → "1100만 자리까지 찾아봤다" ✓(C7). 1100만은 수의
  크기가 아니라 **자릿수**다. "1100만보다 크다" ✗ → "1100만 자리가 넘는 수" ✓. 이 탐색은
  2015년 한 사람이 돌린 것(코드 공개)이지 증명이 아니다. "수학자들이 1100만 자리까지
  증명했다" ✗.
- **1100만 자리 탐색은 2–5진법 수를 찾은 것이다.** "6진법까지 되는 수를 1100만 자리까지
  찾았다" ✗ → "5진법까지 되는 수조차 82000 뒤로 1100만 자리까지 없었어요. 6진법까지 되는 수는
  있어도 그보다 커요" ✓(C7, C8). 이 범위도 기록된 탐색을 믿을 때의 이야기다.
- **"확률이 0.08–0.59"** ✗. 그건 어림으로 낸 **기대 개수**다(C14). "82000이 나올 확률은
  몇 %", "다음 수가 있을 확률은 0" ✗. 수는 무작위가 아니니 "확률"은 "무작위라고 치면"을
  붙여서만 쓴다(C15). "82000은 운 좋게 걸린 수"도 같은 틀 안에서만 쓴다: "무작위라고 치면
  운이 좋은 편" ✓.
- **"진법이 하나 늘 때마다 확률이 정확히 2/b배"** ✗. 2/b는 **자리 하나**의 비율이다. 수
  전체로는 그 진법의 자릿수만큼 곱해지고(C12), 진법끼리 곱하는 것은 가정이다(C15).
  → "자리마다 b개 숫자 중 0과 1, 두 개만 돼요" ✓.
- **"어림이 정확히 맞는다"** ✗. 모형은 2–4진법을 통과할 수를 100만까지 약 11개로 보지만
  실제는 41개다(C15). 경향만 쓴다. 걸러지는 그림의 숫자는 어림이 아니라 C13의 **실제로 센
  값**을 쓴다.
- **"3·4진법까지 만족하는 수는 끝없이 많다"** ✗(증명 안 됨) → "계속 나와요", "82000까지만
  해도 25개" ✓(C16).
- **"드물다는 게 증명됐다"**는 반만 맞다. 4·5진법 둘 다 0과 1인 수가 n^ε보다 적다는 것은
  증명됐지만, 유한하다는 것은 증명되지 않았다(C11). 영상에서는 이 결과 자체를 꺼내지 않는
  편이 안전하다. 꺼낸다면 "아주 느리게 는다는 것까지만 증명됐다"로 말한다.
- **2026년 코멘트를 "큰 진전"이라 하지 않는다.** 후보를 36q, 36q+1로 좁히는 간단한
  필요조건이다(C10). Devansh Singh의 신분은 확인하지 않았으니 "수학자" ✗ → "OEIS에 누군가",
  "한 기여자" ✓.
- **A146025는 3·4진법이 아니다**(토픽 오기). A146025 = 2–5진법(0, 1, 82000), A258981 =
  2–4진법, A263684 = 4·5진법, A268337 = 3·5진법.
- **2진법 줄은 늘 켜져 있다.** 2진법 줄이 켜졌다 꺼졌다 하는 그림은 틀린다(C2). 계수기는
  2부터 센다. 0과 1에서는 네 줄이 다 켜져서 "82000에서 처음 다 켜진다"는 그림과 어긋난다.
- **누가 82000을 찾았는지는 모른다.** "Numberphile이, Evans가, Grime이 82000을 발견했다" ✗.
  OEIS에 이 성질이 처음 기록된 것은 2008년 Mondot의 A146025다(C19). 그 전 기록은 찾지 않았다.
- **4 → 82000은 "약 2만 배"** ✓(×20,500). Evans의 "four orders of magnitude"를 "만 배"로 옮기면
  조금 작다(C4).
- **Evans의 "10^21보다 크다"는 쓰지 않는다.** 그가 확인한 값은 ≈ 2.0 × 10^20이라 오기이고,
  지금은 1100만 자리라는 훨씬 큰 범위가 있다(S6 메모, C7).
- **82000의 자릿수는 진법마다 다르다.** 2진법 17자리, 3진법 11자리, 4진법 9자리, 5진법
  8자리(C4). 네 줄을 오른쪽 끝(1의 자리)에 맞춰 쌓으면 길이가 다른 게 자연스럽다.

## 낱말

- **진법 이름.** 화면은 숫자로 "2진법·3진법·4진법·5진법·6진법", 말은 "이진법·삼진법·
  사진법·오진법·육진법". 『표준국어대사전』에는 이진법(『정보·통신』)과 십진법·진법(進法)(『수학』)이 있고,
  삼진법(三進法)·오진법은 『우리말샘』에 있다. 사진법·육진법은 수학 표제어를 찾지 못했다.
  쓰임이 흔한 말이라 써도 되지만 화면에는 숫자로 함께 띄운다.
- **귀로 헷갈리는 말.** 『표준국어대사전』의 "삼진법"은 **삼진아웃 법(三振法)**뿐이고, "사진법"은
  사진(寫眞), "오진법"은 오진(誤診)처럼 들릴 수 있다. 자막에 "3진법"처럼 숫자로 띄우면
  문제없다. "n진법"은 "엔진법"으로 읽혀 어색하니 말로는 피한다.
- **자리올림.** 초등 수학 용어는 "받아올림"이다(『우리말샘』 『수학』: "6+7=6+(4+3)=10+3=13과
  같이 먼저 10을 만들어 윗자리로 올리는 방법이다."). "자리올림"은 사전에 단독 표제어가 없고
  컴퓨터 용어 "자리올림수"(carry)로만 있다(『우리말샘』: "어떤 자리의 숫자의 합이 그 자리에서
  나타낼 수 있는 가장 큰 수를 넘어 다음 상위 자리로 보내지는 수."). 사전의 진법 뜻풀이는
  "윗자리로 올려 간다"를 쓴다(이진법: "둘씩 묶어서 윗자리로 올려 가는"). 쉬운 말로는
  "3진법은 2 다음이 10이에요", "한 자리가 3이 되면 0이 되고 윗자리로 1이 올라가요",
  "자리가 넘어가요"가 계수기 그림과 맞는다.
- **진법과 진수.** "5진법으로 쓰면 10111000"이 자연스럽다. "5진수"는 그렇게 쓴 수를 말한다.
- **긴 숫자열은 읽지 않는다.** 10100000001010000 같은 줄은 화면에 두고, 말은 "0과 1만
  나와요"로 한다. "0과 1"은 "영과 일"로 읽는다.
