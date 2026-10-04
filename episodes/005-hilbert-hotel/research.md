# 리서치 · 005 꽉 찬 무한 호텔에 손님이 또 들어갈까

대본에는 아래 표에 있는 주장만 쓴다. 수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과). 무한한 호텔은 코드로 다 볼 수 없어서, `verify.py`는 방
1..N 창에서 규칙이 겹치지 않고 말한 방을 비우는지, 작은 유한 호텔에서는 모든 배정을 다 해
봐서 안 되는지를 확인한다. 무한에 대한 말 자체는 출처가 받친다. 인용문은 모두 원문 텍스트를
내려받아 코드로 대조했다(공백 무시, 줄바꿈 하이픈·장음 s(ſ)·TeX 표기 정리, OCR 오류는
출처마다 적어 둔 것만 고침).

토픽이 요청한 판정을 먼저 적는다.

- **출처: 힐베르트가 맞다. "1924년 강연"은 고친다(C4, C5).** 힐베르트가 1924–25년
  겨울학기 괴팅겐에서 일반 청중을 위해 한 강의 「무한에 대하여」(Über das Unendliche, 주
  1시간)에서 든 예다. 한 번의 강연이 아니라 한 학기 강의이고, Kragh는 호텔 대목을 1925년
  1월로 적는다(그의 초록과 본문 한 문장은 1924년 1월이라 해서 앞뒤가 안 맞는다. 겨울학기의
  1월은 1925년이다). 힐베르트는 이 호텔을 글로 발표하지 않았다. 강의록은 2013년에야 책으로
  나왔다. 널리 알린 것은 가모프의 1947년 책이다. 영상에서 써도 되는 선은 "수학자 힐베르트가
  강의에서 든 이야기", 연도를 붙이면 "1920년대"나 "1925년 무렵"이다.
- **"개수가 같다"는 정의다(C6–C8).** 하나씩 빠짐없이 짝지을 수 있으면 "크기가 같다"고
  정한 것은 칸토어다. 같은 짝짓기를 보고 갈릴레오는 "같다·크다·작다는 무한에 안 맞는다"고
  결론 냈다. 그러니 정직한 말은 두 단계다: "하나도 안 남고 짝지어진다"(사실) → "수학에서는
  이걸 크기가 같다고 한다"(정의). 정의를 말할 짬이 없으면 "짝지을 수 있다"까지만 말하고
  "개수가 같다"는 쓰지 않는다. "짝수는 절반"이라는 느낌도 틀린 게 아니다. 1부터 n까지에서
  짝수의 비율은 1/2로 간다. 그건 크기가 아니라 촘촘함을 재는 다른 잣대다(C18). 그러니 대본은
  그 느낌을 틀렸다고 하지 말고 "짝지어 보면 남는 게 없다"로 넘어간다.
- **유한 호텔 비교는 정직하다. 다만 그림이 보이는 것과 원리가 말하는 것은 다르다(C9, C17).**
  방 10개 호텔에서 한 칸씩 밀면 1번 방이 비는 대신 10번 손님이 밖으로 밀려난다. 이 장면은
  "한 칸 밀기"라는 한 방법이 유한 호텔에서 왜 안 되는지(마지막 방이 있다)와 무한 호텔에서 왜
  되는지(마지막 방이 없다)를 정확히 보여 준다. 그러나 비둘기집 원리는 더 센 말이다. 어떻게
  바꿔 앉혀도 10개 방에 11명은 한 명씩 못 들어가고, 10명이 한 방에 한 명씩 자리만 바꾸면 10개
  방이 다시 다 찬다. 그림이 증명하는 것은 "이 방법은 안 된다"까지다. 대본이 "그래서 유한 호텔은
  어떻게 해도 안 된다"고 말하려면 그건 그림이 아니라 누구나 아는 사실(방 10개에 11명)로 말한다.
- **갈릴레오는 한 줄로 쓸 수 있다(C8).** 『새로운 두 과학』(1638)에서 갈릴레오는 자연수와
  **제곱수**(짝수가 아니다)를 짝지어 "제곱수가 수만큼 있다"고 하면서도 "같다·크다·작다는
  무한에 쓸 수 없다"고 결론 냈다. 19세기에 칸토어는 짝짓기를 크기의 정의로 받아들였다. 책 속
  인물 살비아티의 말이지만 갈릴레오의 주장으로 인용하는 것이 보통이다. 갈릴레오가 처음 본 것은
  아니다(S16은 둔스 스코투스가 1302년 무렵 짝수와 수 전체를 비교했다고 적는다).
- **토픽 문구 하나를 고친다: "셀 수 없이 많을 때"(C19).** 한국어 수학 용어에서 "셀 수 있는
  (가산) 집합"은 바로 자연수와 짝지어지는 집합이고, 자연수와 짝수는 "셀 수 있는" 무한이다.
  "셀 수 없는"은 실수 같은 더 큰 무한을 가리킨다. 그러니 자연수와 짝수에 "셀 수 없이 많다"를
  쓰면 용어와 부딪힌다. "끝까지 셀 수 없을 때", "세다가 끝나지 않을 때"로 바꾼다.
- **데데킨트는 끝말로 쓸 수 있다(C11, C12).** "자기 일부와 빠짐없이 짝지을 수 있으면
  무한"은 데데킨트가 1888년에 내린 무한의 정의다. 이 방향은 조건 없이 참이다. 거꾸로 "무한하면
  자기 일부와 짝지을 수 있다"에는 선택 공리의 약한 형태가 필요하지만, 보통 수학(ZFC)에서는
  참이고 영상이 다루는 자연수에서는 n → n+1로 바로 보이므로 조건이 필요 없다. 영상에서 단서를
  말할 필요는 없다. 다만 "오늘날 무한의 정의"라고 하면 넘친다. 표준 정의는 "유한이 아님"이다.
- **전제는 설명을 흔들지 않는다. 그림에서 주의할 곳은 2n 이동이다(C15).** 손님은 동시에
  옮겨야 한다(차례로 하면 끝나지 않는다). n번 손님은 2n번 방까지 n칸을 가야 해서, 다 같이
  걸어간다고 그리면 모두가 도착하는 순간은 오지 않는다. 홀수 방은 출발하는 순간 비고 어느 방도
  겹치지 않으니 결론은 그대로다. 수학이 말하는 것은 "누가 몇 번 방으로 가는가"라는 배정이다.
  그림은 화살표(배정)로 보이고 "곧 다 도착했다" 같은 말은 피한다. 힐베르트 자신이 무한은
  현실에 없다고 했으니 "상상해 보자"처럼 가정하는 말투면 정직하고, 따로 "생각 실험"이라고
  못 박을 필요는 없다.
- **무한히 많은 버스는 설명란 한 줄로 충분하다(C16).** "원래 손님은 2ⁿ번, 첫 버스는 3ⁿ번,
  둘째 버스는 5ⁿ번 방으로. 소인수분해는 한 가지뿐이라 겹치지 않는다." 힐베르트 강의록 인용과
  가모프 판에는 버스 단계가 없으니 힐베르트의 이야기로 소개하지 않는다.

## Sources

접속일은 모두 2026-10-04.

**호텔 이야기의 출처**

- **[S1]** Helge Kragh, "The True (?) Story of Hilbert's Infinite Hotel", arXiv:1403.0059
  [physics.hist-ph], v2 2014-03-27 (v1 2014-03-01). <https://arxiv.org/abs/1403.0059>
  PDF 텍스트는 pypdf로 뽑았다.
  - 힐베르트 강의록(S2, p. 730)의 호텔 대목을 영어로 옮겨 인용한다. 강의록 원문(독일어)은
    읽지 못했으니 힐베르트의 말은 이 영어 인용으로만 쓴다.
  - 날짜가 엇갈린다. 초록 "a lecture of January 1924"와 3절 끝 "in January 1924", 3절 제목
    "January 1925"와 결론 "in January 1925". 강의는 1924–25년 겨울학기(S1, S2)이니 1925년
    1월이 맞고 1924는 오기로 본다. 1월이라는 날짜 자체는 Kragh에게만 기댄다.
  - Kragh는 처음(v1)에는 가모프가 지어냈다고 봤다가 이 판에서 철회했다(C5).
- **[S2]** William Ewald, Wilfried Sieg (편), *David Hilbert's Lectures on the Foundations of
  Arithmetic and Logic 1917–1933*, Springer, 2013. <https://doi.org/10.1007/978-3-540-69444-1>
  - Springer에서 무료로 열리는 앞부분(pp. I–LVI, 목차·서론)과 뒷부분(pp. 787–1062, 부록·
    힐베르트 강의 목록)만 읽었다. curl은 JavaScript 확인 페이지에 막혀서 브라우저로 받았다.
    강의 본문인 4장(pp. 655–785, 호텔은 p. 730)은 유료라 **읽지 못했다**.
  - 서론의 한 문장은 이 강의를 "Winter Semester of 1923/24"라고 적는데, 같은 책의 목차
    ("‘Über das Unendliche’ (1924/25)")와 강의 목록(WS 1924/25)과 맞지 않아 오기로 본다.
- **[S3]** George Gamow, *One Two Three . . . Infinity: Facts and Speculations of Science*,
  Viking Press, 1947 (개정판 1961). 1961년 개정판을 그대로 다시 찍은 Dover 1988년판 스캔의
  OCR 텍스트를 읽었다: <https://archive.org/details/B-001-001-760>. 호텔 대목은 이 판
  pp. 17–18이다(Kragh는 1947년판 p. 17을 인용한다).
  - OCR 오류 "Nl" → "N1", "republicalion" → "republication"은 고쳐서 대조했다.
  - 같은 장의 짝짓기 설명은 "호텐토트" 사람을 셈을 못 하는 사람으로 그리는 낡은 인종적 비유를
    쓴다. 대본은 이 예를 가져오지 않는다.

**무한의 정의 (1차 출처와 그 번역)**

- **[S4]** Richard Dedekind, *Was sind und was sollen die Zahlen?*, Braunschweig: Vieweg,
  1888 (서문 날짜 1887-10-05). 1888년판 스캔(RCIN, archive.org)의 OCR 텍스트:
  <https://archive.org/details/rcin.org.pl.WA35_13030_4797_Was-sind_5138>
- **[S5]** Richard Dedekind, *Essays on the Theory of Numbers*, W. W. Beman 옮김, Open Court,
  1901 (1893년 2판의 번역, 2판 서문 포함). Project Gutenberg #21016의 TeX 원본:
  <https://www.gutenberg.org/ebooks/21016>
- **[S6]** Georg Cantor, *Contributions to the Founding of the Theory of Transfinite Numbers*,
  Philip E. B. Jourdain 옮김·서론, Open Court, 1915. 원문은 "Beiträge zur Begründung der
  transfiniten Mengenlehre", *Mathematische Annalen* 46 (1895), 481–512와 49 (1897),
  207–246. archive.org 스캔의 OCR 텍스트: <https://archive.org/details/contributionstof00cant>
  - 독일어 원문은 읽지 않았다. 서론에서 Jourdain이 칸토어의 다른 글(1887–88)을 인용한 대목도
    여기서 읽었다(C7).
  - 수식 OCR이 망가져 있어서(ℵ₀ + 1 = ℵ₀가 "No+i=No-"로 나온다) 식은 S12로 확인하고 S6에서는
    문장만 인용한다. OCR 오류 "{Anzahl)" → "(Anzahl)"은 고쳐서 대조했다.
- **[S7]** Galileo Galilei, *Dialogues Concerning Two New Sciences*(『새로운 두 과학』), Henry
  Crew, Alfonso de Salvio 옮김, Macmillan, 1914 (원서 Leiden, 1638). 첫째 날, 번역본 pp. 31–33.
  archive.org 스캔의 OCR 텍스트: <https://archive.org/details/cu31924012322701>. OCR 오류
  "appHcable" → "applicable"은 고쳐서 대조했다. 대화체라 이 대목은 갈릴레오의 대변인 격인
  인물 살비아티(Salviati)의 말이다. 스캔의 숫자 "100까지 10개" 부분은 OCR이 깨져 있어서
  같은 번역의 발췌를 실은 S16에서 인용한다.

**2차 출처**

- **[S8]** José Ferreirós, "The Early Development of Set Theory", *Stanford Encyclopedia of
  Philosophy*, 2007 첫 게재, 2025-12-03 개정. <https://plato.stanford.edu/entries/settheory-early/>
- **[S9]** John L. Bell, "The Axiom of Choice", *Stanford Encyclopedia of Philosophy*, 2008 첫
  게재, 2021-12-10 개정. <https://plato.stanford.edu/entries/axiom-choice/>
- **[S10]** Wikipedia, "Hilbert's paradox of the Grand Hotel", 2026-09-10 판 (oldid 1374220288).
  <https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel>
- **[S11]** Wikipedia, "Dedekind-infinite set", 2026-03-18 판 (oldid 1344103355).
  <https://en.wikipedia.org/wiki/Dedekind-infinite_set>
- **[S12]** Wikipedia, "Cardinal number", 2026-07-20 판 (oldid 1365179595).
  <https://en.wikipedia.org/wiki/Cardinal_number>
- **[S13]** Wikipedia, "Ordinal arithmetic", 2026-09-04 판 (oldid 1373148475).
  <https://en.wikipedia.org/wiki/Ordinal_arithmetic>
- **[S14]** Wikipedia, "Extended real number line", 2026-04-20 판 (oldid 1350054294).
  <https://en.wikipedia.org/wiki/Extended_real_number_line>
- **[S15]** Wikipedia (독일어), "Hilberts Hotel", 2026-01-10 판 (oldid 263224076).
  <https://de.wikipedia.org/wiki/Hilberts_Hotel> 출처 표시가 없는 문단이라 C9, C15의 보조 근거로만 쓴다.
- **[S16]** Wikipedia, "Galileo's paradox", 2025-04-25 판 (oldid 1287341755).
  <https://en.wikipedia.org/wiki/Galileo%27s_paradox> 갈릴레오 대목을 Crew·de Salvio 번역
  (Dover 1954 재판, pp. 31–33)으로 발췌해 싣는다. 둔스 스코투스 이야기는 이 문서의 출처
  (M. W. Parker 2009)를 읽지 않고 이 문서로만 쓴다.
- **[S17]** Wikipedia, "Pigeonhole principle", 2026-08-12 판 (oldid 1369009825).
  <https://en.wikipedia.org/wiki/Pigeonhole_principle>
- **[S18]** Wikipedia, "Natural density", 2026-09-15 판 (oldid 1375106588).
  <https://en.wikipedia.org/wiki/Natural_density>
- **[S19]** 위키백과(한국어), "가산 집합", 2026-07-17 판 (oldid 42130225).
  <https://ko.wikipedia.org/wiki/가산_집합> 한국어 용어("셀 수 있다")를 확인하는 데만 쓴다.

**읽지 못한 것**: 힐베르트 강의록 본문(S2 4장), 힐베르트의 뮌스터 강연 논문 "Über das
Unendliche"(*Math. Ann.* 95, 1926; Kragh의 인용으로만 씀), 칸토어의 1874·1878·1892년 원논문,
볼차노 『무한의 역설』(1851), 하웁트·아우만의 1938년 교재(C5, Kragh의 소개로만 씀).

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | 방이 1, 2, 3, … 끝없이 있고 방마다 손님이 한 명씩 있는 호텔에 새 손님이 오면, 모든 손님을 번호가 하나 큰 방(n번 → n+1번)으로 옮긴다. 그러면 아무도 나가지 않고 1번 방이 빈다. 마지막 방이 없으니 모두 갈 방이 있다. | S1(힐베르트 강의록 인용) "We now assume that the hotel has infinitely many rooms numbered 1, 2, 3, 4, 5, … and that each of the rooms is occupied by a single guest. All that the manager has to do in order to accommodate a new guest is to make sure that each of the old guests moves to a new room with the number one unit larger. In this way room 1 becomes available for the new guest."; S3 "he moves the person previously occupying room N1 into room N2, the person from room N2 into room N3, the person from room N3 into room N4, and so on. . . . And the new customer receives room N1, which became free as the result of these transpositions."; S10 "The infinite hotel has no final room, so every guest has a room to go to. After this, room 1 is empty and the new guest can be moved into that room." | 방 1..10,000: n → n+1은 겹치지 않고 2..10,001번 방을 하나씩 채우며 1번 방이 빈다 |
| C2 | 새 손님이 몇 명(k명, 유한)이 와도 받는다. 한 칸 옮기기를 되풀이하거나 n번 → n+k번으로 옮기면 1~k번 방이 빈다. | S1(힐베르트 강의록 인용) "One can of course make room for any finite number of new guests in the same manner; and thus, in a world with an infinite number of houses and occupants there will be no homeless."; S10 "In general, when k guests seek a room, the hotel can apply the same procedure and move every guest from room n to room n + k." | k = 1, 2, 5, 37에서 n → n+k가 정확히 1..k번 방을 비운다 |
| C3 | 새 손님이 무한히 많이 와도 받는다. n번 손님을 2n번 방으로 옮기면 기존 손님은 짝수 방을 하나씩 빠짐없이 채우고, 홀수 방이 모두(무한히 많이) 빈다. | S1(힐베르트 강의록 인용) "One could, for example, ask the old guest who originally occupied room number n to move to room number 2n. In this way infinitely many rooms with odd numbers would be left free for new guests."; S3 "He moves the occupant of N1 into N2, the occupant of N2 into N4, the occupant of N3 into N6, and so on, and so on" / "Now all odd-numbered rooms become free" | 방 1..20,000: 기존 손님 10,000명이 짝수 방 10,000개를 겹치지 않게 채우고 홀수 방 10,000개가 빈다 |
| C4 | 이 이야기는 힐베르트의 것이다. 1924–25년 겨울학기 괴팅겐에서 일반 청중을 위해 한 강의 「무한에 대하여」(Über das Unendliche, 주 1시간)에서 유한 집합과 무한 집합의 차이를 보이려고 든 예이고, 강의록은 조수 로타어 노르트하임이 정리했다. Kragh는 호텔 대목을 1925년 1월로 적는다. 힐베르트는 같은 자리에서 무한한 무도회 예도 들었고, 그에게는 대수롭지 않은 예였다. | S1 "Hilbert introduced his story about the hotel in unpublished lectures in the winter semester 1924-1925."; S1 "This he made clear in a semi-popular lecture course he gave in Göttingen during the winter semester 1924-1925"; S1 "The lecture notes for the Göttingen winter semester course were prepared and written up by Lothar Nordheim"; S1 "In his Göttingen lectures Hilbert endeavoured to make clear to his audience the crucial difference between finite and infinite sets."; S1 "3. January 1925: The birth of Hilbert's hotel" / "The hotel story was introduced by David Hilbert in lectures that he gave in Göttingen in January 1925" (반대로 S1 초록 "It turns out that Hilbert introduced his hotel in a lecture of January 1924, but without publishing it." 및 "This is what Hilbert had to say about his hotel in January 1924."); S1 "The situation is the same with an infinite dance party where all the gentlemen have asked the ladies to dance. A new lady enters, but the organizer of the dance can easily arrange that she will not be without a partner."; S1 "It was merely an example and one that he attached no particular importance to."; S2 "Chapter 4 Lectures on the Inﬁnite (1924/25, 1931, 1933)" / "‘Über das Unendliche’ (1924/25)" / 강의 목록 WS 1924/25 "Über das Unendliche (allgemeinverständlich), 1st. MI: title as announced (Nordheim, 2 copies)"; S10 "The idea was introduced by David Hilbert in a 1924–1925 lecture" | – |
| C5 | 힐베르트는 호텔을 글로 발표하지 않았다. 같은 강의를 바탕으로 한 1925년 6월 4일 뮌스터 강연(논문 「Über das Unendliche」)에서는 호텔 예를 뺐고, 강의록은 2013년에야 책으로 나왔다. 호텔을 널리 알린 것은 20여 년 뒤 가모프의 1947년 책 『One Two Three … Infinity』다. 가모프는 힐베르트에 관한 이야기라고 소개하며 출처를 "쿠란트가 쓴, 출판되지 않았고 쓰이지도 않은 『힐베르트 이야기 전집』"이라는 농담으로 달았다. Kragh는 가모프가 1928년 괴팅겐에 머물 때 쿠란트나 노르트하임에게 들었을 것으로 추정한다. 1947년 전에는 1938년 미적분 교재(하웁트·아우만)가 힐베르트 이름 없이 낸 연습 문제가 Kragh가 아는 유일한 흔적이다. Kragh는 처음엔 가모프가 지어냈다고 봤다가 철회했다. | S1 "A few months later he repeated the message in a wide-ranging lecture on the infinite given in Münster on 4 June 1925."; S1 "Hilbert's Münster address drew extensively on his previous lecture course, except that it was more technical and omitted many examples. One of them was the infinite hotel."; S1 "These lectures have only recently appeared in print [Hilbert 2013]."; S1 "He did not refer to the infinite hotel in his writings, and it only turned up in print in a book Gamow published in 1947."; S1 "Had the hotel not been resuscitated by Gamow more than two decades later it might well be unknown today."; S3 "This is probably best illustrated by an example taken from one of the stories about the famous German mathematician David Hilbert. They say that in his lectures on infinity he put this paradoxical property of infinite numbers in the following words:"; S3 각주 "From the unpublished, and even never written, but widely circulating volume: “The Complete Collection of Hilbert Stories” by R. Courant."; S1 "24-year-old George Gamow spent the summer months of 1928 as a postdoc in Göttingen" / "there is little doubt that he was informed about the hotel story during his stay in Göttingen, either by Courant or by Nordheim."; S1 "The only allusion to it before 1947 that I know of is from a textbook on calculus published in 1938" / "Without referring to Hilbert by name, the book posed the following problem"; S1 "At the same time it retracts the author's earlier conclusion that the paradox was originally due to Gamow."; S10 "and was popularized through George Gamow's 1947 book One Two Three... Infinity." | 1925 → 1947: 22년 |
| C6 | "개수가 같다"의 수학적 뜻: 두 모임의 원소를 하나씩, 빠짐없이, 겹치지 않게 짝지을 수 있으면(일대일 대응) 두 모임은 크기(기수)가 같다고 정한다. 칸토어의 정의다. 유한한 모임에서는 보통의 개수가 같다는 말과 똑같다. | S6 §1 "if it is possible to put them, by some law, in such a relation to one another that to every element of each one of them corresponds one and only one element" (+ 다음 쪽 "of the other"); S6 §1 "two aggregates M and N have the same cardinal number if, and only if, they are equivalent"; S6 서론 "When an aggregate is finite, the notion of power corresponds to that of number (Anzahl), for two such aggregates have the same power when, and only when, the number of their elements is the same."; S3 "Exactly the same method was proposed by Cantor for comparing two infinities" / "if we can pair the objects of two infinite groups so that each object of one infinite collection pairs with each object of another infinite collection, and no objects in either group are left alone, the two infinities are equal." | – |
| C7 | 자연수와 짝수는 n ↔ 2n으로 빠짐없이 짝지어진다. 그래서 C6의 정의로는 짝수가 자연수만큼 있다(크기가 같다). 짝수는 자연수의 일부이고 1부터 2N까지 세면 딱 절반인데도 그렇다. 홀수 방과 전체 방도 마찬가지다. 칸토어는 부분과 전체의 크기가 같아도 모순이 아니며, 이것을 인정하지 않는 것이 무한수를 받아들이는 데 가장 큰 걸림돌이라고 했다. | S3 "the infinity of even numbers is exactly as large as the infinity of all numbers"; S6 서론(칸토어 인용) "there is no contradiction when, as often happens with infinite aggregates, two aggregates of which one is a part of the other have the same cardinal number. I regard the non-recognition of this fact as the principal obstacle to the introduction of infinite numbers."; S10 "the cardinality of the subset containing the odd-numbered rooms is the same as the cardinality of the set of all rooms"; S12 (n ↦ n+1에 대해) "and thus they have the same cardinality" … "despite the second being a proper subset of the first." | 1..10,000 ↔ 2, 4, …, 20,000: 각 수에 짝수 하나, 거꾸로 m → m/2로 돌아온다. 1..20,000에서 짝수는 정확히 절반 |
| C8 | 짝짓기는 칸토어 전에도 알려져 있었고, "같다"는 결론은 정의를 고른 결과다. 갈릴레오는 마지막 과학 저서 『새로운 두 과학』(1638)에서 자연수와 제곱수를 짝지어(n ↔ n²) "제곱수가 수만큼 있다"고 하면서도, "같다·크다·작다는 무한에는 쓸 수 없고 유한한 양에만 쓴다"고 결론 냈다(갈릴레오의 역설). 그가 든 수로 제곱수는 100까지 10개(1/10), 1만까지 100개(1/100), 100만까지 1000개(1/1000)로 점점 드물어진다. 볼차노(1851)도 무한 집합끼리 짝지을 수 있음을 알았지만 "같다"는 결론은 받아들이지 않았다. 19세기에 칸토어는 짝짓기로 무한 집합의 크기를 비교하는 틀을 세웠고, 그 정의로는 자연수와 제곱수의 크기가 같다. 갈릴레오가 처음은 아니다(S16: 둔스 스코투스, 1302년 무렵, 짝수와 수 전체). | S16 "In his final scientific work, Two New Sciences, Galileo Galilei made apparently contradictory statements about the positive integers."; S7 "for we cannot speak of infinite quantities as being the one greater or less than or equal to another."; S7 "we must say that there are as many squares as there are numbers because they are just as numerous as their roots, and all the numbers are roots."; S7 "neither is the number of squares less than the totality of all numbers, nor the latter greater than the former; and finally the attributes "equal," "greater," and "less," are not applicable to infinite,"; S7 역자 서문 "I have followed the Leyden text of 1638"; S16 (같은 번역 발췌) "Thus up to 100 we have 10 squares, that is, the squares constitute 1/10 part of all the numbers; up to 10000, we find only 1/100 part to be squares; and up to a million only 1/1000 part"; S8 "Bolzano recognized clearly the possibility of putting two infinite sets in one-to-one correspondence" / "However, Bolzano resisted the conclusion that both sets are “equal with respect to the multiplicity of their parts”"; S16 "Galileo concluded that the ideas of less, equal, and greater apply to finite quantities but not to infinite quantities. During the nineteenth century Cantor found a framework in which this restriction is not necessary; it is possible to define comparisons amongst infinite sets in a meaningful way (by which definition the two sets, integers and squares, have "the same size"), and that by this definition some infinite sets are strictly larger than others."; S16 "This is an early use, though not the first, of the idea of one-to-one correspondence in the context of infinite sets." / "In particular, Duns Scotus, about 1302, compared even numbers to the whole of numbers." | √100 = 10, √10,000 = 100, √1,000,000 = 1000. n → n²은 1..10,000에서 겹치지 않는다 |
| C9 | 유한한 호텔에서는 안 된다. 방이 n개면 손님 n+1명에게 방을 하나씩 줄 수 없고, 유한한 모임은 자기 일부(진부분)와 빠짐없이 짝지을 수 없다. 꽉 찬 유한 호텔에서 한 칸씩 옮기면 마지막 방 손님이 갈 방이 없다. | S6 §6 "Every finite aggregate E is such that it is equivalent to none of its parts."; S1(힐베르트 강의 요약) "If a hotel has only a finite number of rooms, all of them occupied, there is no way to accommodate new guests." / "For a finite set a part of the set is always smaller than the total set, but this is not the case for an infinite set"; S17 "In mathematics, the pigeonhole principle states that if n items are put into m containers, with n > m, then at least one container must contain more than one item."; S15 "In einem Hotel mit endlich vielen Zimmern können keine Gäste mehr aufgenommen werden, sobald alle Zimmer belegt sind (Schubfachprinzip)."; S11 "That every Dedekind-infinite set is infinite can be easily proven in ZF" | 방 1–5개 호텔에서 모든 배정을 다 해 봄: n+1명을 한 방에 한 명씩 넣는 배정도, 방 하나를 뺀 나머지와 짝짓는 배정도 없다. 방 1..N에서 n → n+1은 N번 손님을 N+1번(없는 방)으로 보낸다 |
| C10 | 무한한 호텔에서는 "모든 방이 찼다"가 "더는 못 받는다"를 뜻하지 않는다. 역설이라고 불리지만 논리적 모순은 아니고, 직관에 어긋날 뿐 증명되는 결과다. | S1 "What the parable tells us is that the statement “all rooms are occupied” does not imply that “there is no more space for new guests.”"; S1 "This is strange indeed, although it is not, strictly speaking, a paradox in the logical sense of the term."; S10 "Hilbert's paradox is a veridical paradox: it leads to a counterintuitive result that is provably true. The statements "there is a guest to every room" and "no more guests can be accommodated" are not equivalent when there are infinitely many rooms." | – |
| C11 | 데데킨트는 『수란 무엇이며 무엇이어야 하는가?』(1888) §64에서 이 성질을 무한의 정의로 삼았다: 자기 자신의 진부분과 닮은(일대일로 짝지어지는) 시스템은 무한, 그렇지 않으면 유한이다. 각주에 이 정의를 1882년 9월 칸토어에게 알렸다고 적었다. 자연수의 정의에 기대지 않은 첫 무한의 정의다. 성질 자체는 칸토어(1878)와 볼차노(1851)가 먼저 짚었다고 데데킨트가 2판(1893) 서문에서 밝혔고, 그들은 이것을 정의로 쓰지 않았다. | S4 §64 "Ein System S heißt unendlich, wenn es einem echten Theile seiner selbst ähnlich ist (32); im entgegengesetzten Falle heißt S ein endliches System."; S4 각주 "im September 1882 Herrn G. Cantor"; S4 표제지 "Verlag von Friedrich Vieweg und Sohn. 1888."; S5 §64 "A system S is said to be infinite when it is similar to a proper part of itself (32); in the contrary case S is said to be a finite system."; S5 각주 "In this form I submitted the definition of the infinite which forms the core of my whole investigation in September, 1882, to G. Cantor"; S5 2판 서문 "The property which I have employed as the definition of the infinite system had been pointed out before the appearance of my paper by G. Cantor" / "But neither of these authors made the attempt to use this property for the definition of the infinite"; S5 1판 서문 "Harzburg, October 5, 1887."; S11 "Proposed by Dedekind in 1888, Dedekind-infiniteness was the first definition of "infinite" that did not rely on the definition of the natural numbers." | – |
| C12 | 데데킨트 정의의 조건. "자기 일부와 짝지을 수 있으면 무한하다"는 선택 공리 없이(ZF에서) 증명된다. 거꾸로 "무한하면 자기 일부와 짝지을 수 있다"는 선택 공리의 약한 형태가 있어야 증명된다. ZF만으로는 안 되고(무한하지만 데데킨트 유한인 집합이 있는 ZF 모형이 있다), 가산 선택 공리면 충분하며, 실제로 필요한 것은 그보다도 약하다. 선택 공리를 넣은 보통의 집합론(ZFC)에서는 두 정의가 같다. 오늘날 보통 쓰는 무한의 정의는 "어떤 {1, …, n}과도 짝지어지지 않는다(유한이 아니다)"이다. 호텔의 방(자연수)은 n → n+1로 직접 짝지어 보이므로 이 조건과 상관없다. | S11 "That every Dedekind-infinite set is infinite can be easily proven in ZF"; S9 "Every infinite set has a denumerable subset. This principle, again weaker than AC, cannot be proved without it in the context of the remaining axioms of set theory."; S11 "However, there exists a model of Zermelo–Fraenkel set theory without the axiom of choice (ZF) in which there exists an infinite, Dedekind-finite set"; S11 "the equivalence of the two definitions is strictly weaker than the axiom of countable choice (CC)"; S11 "Using the axioms of Zermelo–Fraenkel set theory with the originally highly controversial axiom of choice included (ZFC) one can show that a set is Dedekind-finite if and only if it is finite in the usual sense."; S11 (보통의 정의) "is infinite when it cannot be put in bijection with a finite ordinal" | (C1의 n → n+1 확인이 자연수의 경우) |
| C13 | 무한이 다 같은 크기는 아니다. 칸토어는 실수 전체를 자연수와 빠짐없이 짝지을 수 없다는 것(실수의 크기가 자연수보다 엄격히 크다)을 1874년 논문에서 보였고, 1892년 짧은 논문에서 대각선 논법으로 다시 보였다. 호텔로 말하면, 손님이 실수(예: 0과 1 사이의 모든 수)만큼 오면 방 번호를 하나씩 나눠 줄 수 없다. | S8 "Thus he had shown that there are more elements in R than in N or Q or A, in the precise sense that the cardinality of R is strictly greater than that of N." / "All of these results appeared in an 1874 paper"; S8 "In the same short paper (1892), Cantor presented his famous proof that R is non-denumerable by the method of diagonalisation" | 대각선 논법의 핵심 단계: k = 1..4에서 k자리 0/1 줄 k개로 된 모든 목록(66,066개)에 대해 대각선을 뒤집은 줄은 목록에 없다 |
| C14 | "무한 더하기 1". 크기(기수)로는 ℵ₀ + 1 = ℵ₀이다. 칸토어가 이를 보인 짝짓기(새 원소 → 1, ν → ν+1)가 바로 C1의 한 칸 옮기기다. 하지만 ∞를 보통 수처럼 계산하면 안 된다. 확장된 실수에서도 ∞ − ∞는 정의하지 않고, 순서수(줄 세우기)에서는 3 + ω = ω이지만 ω + 3 ≠ ω이다. | S6 §6 "The Smallest Transfinite Cardinal Number" / "For we can think of this reciprocally univocal correspondence between them" (다음 문장은 OCR이 깨져 있지만 "to the element e^ of the first corresponds the element i of the second, and to the element v of the first corresponds the element j/+ i of the other", 즉 e₀ → 1, ν → ν+1로 읽힌다); S12 "Conversely, this also shows that ℵ 0 + 1 = ℵ 0"; S14 "The expressions ∞ − ∞, 0 × (±∞), and ±∞/±∞ (called indeterminate forms) are usually left undefined."; S13 "Ordinal addition is, in general, not commutative. For example, 3 + ω = ω" / "In contrast ω + 3 is not equal to ω" / "(ω and ω + 3 are equipotent, but not order-isomorphic)" | {e₀} ∪ {1..N} → {1..N+1}이 일대일. 부동소수점(IEEE 754)도 같은 관례: inf + 1 == inf, inf − inf는 NaN |
| C15 | 생각 실험의 전제. (a) 손님은 모두 동시에 옮긴다. 차례로 옮기면 무한히 오래 걸린다. (b) n → 2n에서 n번 손님은 n칸을 가야 해서 이동 거리에 끝이 없다. 모두 같은 속도로 동시에 출발하면 홀수 방은 출발과 함께 비고 어느 방에서도 두 사람이 겹치지 않지만, 모든 손님이 도착을 마치는 순간은 오지 않는다(한 칸에 1의 시간이면 시간 T까지 도착한 손님은 T명). n → n+1에서는 모두 한 칸만 가서 이 문제가 없다. (c) 수학이 말하는 것은 "누가 몇 번 방으로 가는가"라는 배정이고, 걷는 과정이 아니다. 각 손님은 자기 방 번호를 바로 계산할 수 있다. (d) 힐베르트 자신은 무한이 현실 어디에도 없다고 했고, Kragh는 그가 이 이야기를 실제 무한이 현실의 일부가 될 수 없다는 점을 보이려고 썼다고 본다. 가모프는 반대로 무한한 우주의 예로 썼다. | S10 "With one additional guest, the hotel can accommodate them and the existing guests if infinitely many guests simultaneously move rooms."; S15 "Wichtig bei dieser Vorgehensweise ist, dass alle Gäste gleichzeitig die Zimmer wechseln, beispielsweise bei einem vom Portier ausgelösten Gong. Wenn dies nacheinander geschehen würde, würde es bei einer unendlichen Anzahl von Gästen und einer unendlichen Anzahl von Zimmern unendlich lange dauern."; S10 "Doing this one at a time for each coach would require an infinite number of steps, but by using the prior formulas, each guest can calculate their room number and go there in a finite number of steps."; S1(뮌스터 강연 논문, *Math. Ann.* 95, p. 190 인용) "The infinity is nowhere to be found in reality."; S1 "Whereas Hilbert used the story to point out that the actual infinite cannot be part of reality, to Gamow it served as an illustration of the spatially and materially infinite universe." | (b)는 계산: n → n+1은 모두 1칸, n → 2n은 n번 손님이 n칸. 시간 T = 1, 10, 1000까지 도착한 손님은 T명. 모든 도착은 시간 0 뒤이고 홀수 방에는 아무도 들어오지 않는다 |
| C16 | 무한히 많은 버스(설명란 한 줄용). 버스가 무한히 많고 버스마다 손님이 무한히 많아도 받을 수 있다. 예: 원래 n번 손님 → 2ⁿ번 방, 첫째 버스 n번 자리 → 3ⁿ번, 둘째 → 5ⁿ번, c번째 버스 → (c번째 홀수 소수)ⁿ번. 소인수분해는 한 가지뿐이라 겹치지 않는다. 이 방법은 6, 10, 15처럼 소수의 거듭제곱이 아닌 방을 비워 둔다. 빈 방 없이 채우는 배치(삼각수 배치)도 있다. 대부분의 방법은 버스 좌석에 번호가 이미 붙어 있다고 가정한다. S1이 인용한 힐베르트 대목과 S3에는 버스 단계가 없다. | S10 "Most methods depend on the seats in the coaches being already numbered (or use the axiom of countable choice)."; S10 (소수 거듭제곱 방법) "This solution leaves certain rooms empty (which may or may not be useful to the hotel); specifically, all numbers that are not prime powers, such as 15 or 847, will no longer be occupied."; S10 (2ⁿ3ᶜ 방법) "Because every number has a unique prime factorization, it is easy to see all people will have a room, while no two people will end up in the same room."; S10 (삼각수 방법) "In this way all the rooms will be filled by one, and only one, guest." | 원래 손님 12명 + 버스 12대 × 12자리 = 156명이 소수 거듭제곱 규칙으로 모두 다른 방. 6, 10, 12, 15, 847(= 7 × 11²)은 빈다. 2ⁿ3ᶜ도 겹치지 않음(2592 = 2⁵3⁴). 삼각수 규칙은 c + n ≤ 200인 모든 손님으로 1..20,100번 방을 빈틈·겹침 없이 채운다 |
| C17 | 방 10개 호텔과의 비교. 방 10개가 꽉 찬 호텔에서 모두 한 칸씩 옮기면 1번 방은 비지만 10번 손님은 갈 방이 없어 밖으로 밀려난다. 방에 든 사람은 여전히 10명이고, 방 없는 사람이 새 손님에서 10번 손님으로 바뀌었을 뿐이다. 무한 호텔에는 마지막 방이 없어서 밀려나는 사람 없이 1번 방이 빈다. 이 장면이 보여 주는 것은 "한 칸 밀기"가 유한 호텔에서 실패한다는 것이다. 비둘기집 원리는 더 세다. 어떻게 옮겨도 손님 11명에게 방 10개를 하나씩 줄 수 없고, 꽉 찬 유한 호텔의 손님이 한 방에 한 명씩 자리만 바꾸면 모든 방이 다시 찬다(빈 방이 생기지 않는다). 무한 호텔에서는 모두가 방을 얻으면서 빈 방이 생기는 배정이 있다. 손님 전체가 자기 일부인 2, 3, 4, …번 방과 빠짐없이 짝지어지기 때문이다(C11의 그림). 비둘기집 원리라는 이름은 디리클레가 1834년에 다룬 "서랍 원리"(Schubfachprinzip)에서 왔다. | S10 "The infinite hotel has no final room, so every guest has a room to go to. After this, room 1 is empty and the new guest can be moved into that room."; S17 "In mathematics, the pigeonhole principle states that if n items are put into m containers, with n > m, then at least one container must contain more than one item."; S17 "However, adding at least one element to a finite set is sufficient to ensure that the cardinality increases."; S6 §6 "Every finite aggregate E is such that it is equivalent to none of its parts."; S17 "it is commonly called Dirichlet's box principle or Dirichlet's drawer principle after an 1834 treatment of the principle by Peter Gustav Lejeune Dirichlet under the name Schubfachprinzip" | 방 10개를 한 칸씩 밀면 10번 손님 → 11번(없는 방), 2..10번 방이 차고 1번 방이 빈다. 방 1–6개 호텔에서 한 방에 한 명씩 바꿔 앉히는 모든 배정을 해 봄: 언제나 모든 방이 다시 찬다 |
| C18 | "짝수는 자연수의 절반"이라는 느낌은 다른 잣대로는 맞다. 1부터 n까지에서 짝수의 비율은 n이 커지면 1/2로 간다(자연 밀도 1/2). 제곱수의 비율은 0으로 간다. 이 "촘촘함"은 짝짓기로 잰 크기(기수)와 다른 질문이다. 자연수와 제곱수는 크기가 같지만 제곱수는 점점 드물어진다. | S18 "A subset A of positive integers has natural density α if the proportion of elements of A among all natural numbers from 1 to n converges to α as n tends to infinity."; S18 "is the set of all even numbers, then d(A) = 0.5."; S18 "However, the set of positive integers is not in fact larger than the set of perfect squares: both sets are infinite and countable and can therefore be put in one-to-one correspondence. Nevertheless if one goes through the natural numbers, the squares become increasingly scarce." | n = 10, 1000, 10⁶에서 1..n의 짝수는 정확히 n/2개. 제곱수는 10², 10⁴, 10⁶까지 각각 1/10, 1/100, 1/1000 |
| C19 | 한국어 수학 용어에서 "셀 수 있는(가산) 집합"은 자연수와 짝지어지는(자연수로 일대일로 보낼 수 있는) 집합이다. 짝수, 자연수, 정수, 유리수는 셀 수 있는 무한이고, 실수는 "셀 수 없는(비가산)" 집합이다. 그래서 자연수와 짝수를 두고 "셀 수 없이 많다"고 하면 이 용어와 어긋난다. | S19 "가령 짝수의 집합은 무한집합이지만 각 짝수는 자연수에 순서대로 1:1 대응이 가능하므로 가산(셀 수있다)집합이다."; S19 "어떤 집합이 가산 집합인 경우, 그 집합(의 원소의 개수)을 셀 수 있다 혹은 가산 개의 원소가 있다고 정의한다."; S19 "자연수, 정수, 유리수의 집합은 가산집합이고, 실수의 집합은 비가산집합이다." | – |

## Easy to misstate

- **"힐베르트가 1924년 강연에서"** ✗ → "힐베르트가 강의에서 든 이야기", "1920년대 힐베르트의
  강의에서" ✓ (C4). 한 번의 강연이 아니라 1924–25년 겨울학기 강의이고, 호텔 대목은 1925년
  1월(Kragh)이다. 연도를 꼭 쓰면 "1925년 무렵".
- "힐베르트가 논문에 쓴", "힐베르트의 유명한 강연 「무한에 대하여」(1925)에 나온다" ✗. 힐베르트는
  호텔을 발표하지 않았고 뮌스터 강연(1925, 논문 1926)에서는 뺐다 (C5).
- "가모프가 지어낸 이야기" ✗ (Kragh가 철회했다). "가모프가 처음 책에 실었다"도 피한다(1938년
  교재 연습 문제가 있다) → "가모프의 1947년 책이 널리 알렸다" ✓ (C5).
- "힐베르트는 이런 호텔이 있을 수 있다고 봤다" ✗ → 그는 무한이 현실 어디에도 없다고 했다 ✓ (C15).
- "짝수와 자연수는 개수가 같다"를 뜻 없이 단정하지 않는다. "하나도 안 남고 짝지어진다"를 먼저
  보이고 "수학에서는 이걸 크기가 같다고 한다" ✓ (C6, C7). "짝수가 자연수와 같다" ✗(같은 모임이
  아니라 크기가 같다). 가모프의 "In fact in the world of infinity a part may be equal to the whole!"(S3)를
  옮긴 "부분이 전체와 같다" ✗ → "부분이 전체만큼 크다", "부분과 전체의 크기가 같다" ✓.
- "짝수는 자연수의 절반"과 "짝수는 자연수만큼 있다"를 한 문장에 섞지 않는다. 절반은 "1부터 100까지
  세면"처럼 끝이 있는 범위의 말이고, 짝짓기로는 크기가 같다 (C7, C8).
- "칸토어가 짝짓기를 발견했다" ✗. 갈릴레오(1638)와 볼차노(1851)도 짝짓기를 봤다. 칸토어는 그것을
  "크기가 같다"의 정의로 받아들였다 ✓ (C8). "갈릴레오가 처음 발견했다"도 ✗(S16: 그 전에 둔스
  스코투스). "갈릴레오는 짝수로" ✗ → **제곱수**로 ✓.
- "갈릴레오가 틀렸고 칸토어가 바로잡았다" ✗. 갈릴레오는 무한끼리 비교하지 말자고 했고, 칸토어는
  짝짓기를 비교의 기준으로 정했다 → "갈릴레오는 같다·크다를 무한에 쓰지 않기로 했고, 칸토어는
  짝짓기로 크기를 재기로 했다" ✓ (C8).
- "짝수가 절반이라는 생각은 틀렸다" ✗. 촘촘함(비율)으로는 절반이 맞다 (C18). 틀린 것은 "그러니
  짝수가 더 적다"라는, 크기에 대한 결론이다.
- **"셀 수 없이 많을 때는 짝지어 비교한다"** ✗(자연수·짝수는 한국어 용어로 "셀 수 있는" 무한이다)
  → "끝까지 셀 수 없을 때", "세다가 끝나지 않을 때" ✓ (C19). "셀 수 없는 무한"은 실수 쪽 이야기다.
- 방 10개 그림 뒤에 "한 칸 밀기가 안 되니 유한 호텔은 어떤 방법으로도 안 된다"처럼 그림을 증명처럼
  쓰지 않는다. 그림은 한 방법의 실패만 보인다. 일반론은 "방 10개에 11명은 한 명씩 못 들어간다"로
  말한다 (C17). 방 10개 호텔에서 "1번 방이 비니 새 손님이 들어간다" ✗ → 10번 손님이 밀려나서
  방 없는 사람은 그대로 한 명 ✓.
- **"무한은 다 같다"** ✗ → "자연수만큼인 무한끼리는 짝지어진다", "실수는 자연수와 짝지을 수 없다" ✓
  (C13). "무한 호텔은 어떤 손님이든 다 받는다" ✗ → "번호를 붙일 수 있는 손님이면 무한히 많아도
  받는다" ✓.
- **"무한 더하기 1은 무한", "∞ + 1 = ∞"** 을 식으로 쓰지 않는다. ∞는 보통의 수가 아니고, 같은 식으로
  계산하면 "∞ − ∞ = 1" 같은 틀린 결론이 나온다 (C14). → "한 명이 늘어도 짝짓기는 그대로 된다" ✓.
  굳이 쓰면 크기(기수) 이야기라고 밝힌다.
- "꽉 찬 호텔에도 빈 방이 남아 있다" ✗. 빈 방은 없고, 옮기면 생긴다 → "방이 다 찼는데도 더 받을 수
  있다" ✓ (C10).
- "모순이다" ✗ → "직관에 어긋나지만 모순은 아니다" ✓ (C10). "역설"이라는 이름은 써도 된다.
- 손님이 **한 명씩 차례로** 옮긴다 ✗ → **모두 동시에** ✓ (C15). n → 2n을 "다 같이 걸어가서 금방
  자리를 잡았다"처럼 말하지 않는다. 가는 거리가 끝없이 길어진다. "모두 2배 번호 방으로 간다"(배정) ✓.
- "무한한 것은 무조건 자기 일부와 짝지을 수 있다": 보통 수학(ZFC)에서는 참이고 자연수에서는 조건
  없이 참이지만, 엄밀히는 선택 공리의 약한 형태가 필요하다 (C12). 영상에서는 단서 없이 "자기 일부와
  짝지을 수 있다"고 해도 되고, 댓글에서 물으면 C12로 답한다.
- "데데킨트가 이 성질을 발견했다" ✗ → "이 성질로 무한을 정의했다" ✓ (C11). "오늘날 무한의 정의" ✗
  → 표준 정의는 "유한이 아님"이고, 데데킨트의 정의는 보통 수학에서 그것과 같아지는 다른 정의다 (C12).
- 데데킨트 연도는 책이 나온 **1888년** (서문 날짜는 1887년). 칸토어의 실수 증명은 1874년, 대각선
  논법은 1892년(S8). 영상에서는 연도 없이 "칸토어가 증명했다"로 충분하다.
- 무한히 많은 버스 이야기를 "힐베르트의 호텔 이야기"로 소개하지 않는다. 힐베르트와 가모프 판에는
  없다 (C16). 소수 거듭제곱 방법은 방을 남기니 "방을 꽉 채운다"고 하지 않는다.
