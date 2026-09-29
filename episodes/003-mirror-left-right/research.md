# 리서치 · 003 거울은 왜 좌우만 바꿀까

대본에는 아래 표에 있는 주장만 쓴다. 기하·수치 주장은 `verify.py`로 다시 확인할 수 있다
(`python3 verify.py`, 전부 통과). 인용문은 모두 원문 텍스트를 내려받아 코드로 대조했다
(PDF는 텍스트 층에서 공백과 하이픈을 무시하고 대조).

이 주제는 두 층이다. **거울이 하는 일(물리)**은 출처가 모두 같은 말을 하니 단정한다(C1–C3,
C8, C10). **왜 하필 "좌우"로 느끼는지(지각)**는 심리학·철학에서 설명이 다투고 정설이 없으니,
대본은 한 설을 정답으로 고르지 않는다(C5, C6). 그 사이의 C4(돌려 맞춰 보면 좌우만 어긋난다)는
기하라서 논란이 없다.

## Sources

접속일은 모두 2026-09-28.

**1차 출처 (거울 반전 문제의 논문과 연구자가 직접 쓴 글)**

- **[S1]** Yohtaro Takano, "Why does a mirror image look left–right reversed? A hypothesis
  of multiple processes", *Psychonomic Bulletin & Review* 5(1), 37–55, 1998.
  <https://doi.org/10.3758/BF03209456>
- **[S2]** Michael C. Corballis, "Much ado about mirrors", *Psychonomic Bulletin & Review*
  7(1), 163–169, 2000. <https://doi.org/10.3758/BF03210736>
- **[S3]** Tatsuo Tabata, Shuichi Okuda, "Mirror reversal simply explained without recourse to
  psychological processes", *Psychonomic Bulletin & Review* 7(1), 170–173, 2000.
  <https://doi.org/10.3758/BF03210737>
  - S1–S3: Springer가 curl에는 자바스크립트 확인 페이지를 돌려줘서, 브라우저로 기사
    페이지를 연 뒤 같은 세션에서 PDF를 받았다(`/content/pdf/10.3758/<id>.pdf`). 스캔본이라
    텍스트 층에 OCR 오류가 있다(예: "tum" ← turn). 오류가 걸린 문장은 인용하지 않았다.
- **[S4]** 高野陽太郎・田中章浩, 「第3部：高野説 多重プロセス理論による鏡映反転の説明」,
  『認知科学』(Cognitive Studies) 15(3), 536–541, 2008. <https://doi.org/10.11225/jcss.15.536>
- **[S5]** 高野陽太郎, 「『小特集—鏡映反転』企画の経緯」, 『認知科学』 15(3), 496, 2008.
  <https://doi.org/10.11225/jcss.15.496>
- **[S6]** 多幡達夫, 「第2部：多幡説 鏡像の左右逆転・非逆転：物理的局面からの解明」,
  『認知科学』 15(3), 512–515, 2008. <https://doi.org/10.11225/jcss.15.512>
  - S4–S6: 일본인지과학회 학술지의 소특집 「鏡映反転：『鏡の中では左右が反対に見える』のは
    何故か？」(2008). 고가메(小亀)·다하타(多幡)·다카노(高野) 세 사람이 자기 설, 다른 설 비판,
    비판에 대한 답을 한 호에 실었다. J-STAGE 무료 공개. pypdf는 일본어 글꼴 인코딩을 읽지
    못해서 텍스트는 PyMuPDF로 뽑았다.
- **[S7]** Richard Gregory, "Beyond the looking glass" (Jonathan Miller, *On Reflection*
  서평), *Times Higher Education*, 1998-11-27.
  <https://www.timeshighereducation.com/books/beyond-the-looking-glass/161055.article>
  Gregory(브리스틀대 실험심리학 명예교수, *Mirrors in Mind* 저자)가 자기 설을 직접 설명한 글.
- **[S8]** 高野陽太郎, 『鏡映反転――紀元前からの難問を解く』, 岩波書店, 2015-07-15. 출판사
  책 페이지의 소개와 "著者からのメッセージ"만 읽었다(책 본문은 못 읽음).
  <https://www.iwanami.co.jp/book/b261150.html>
- **[S9]** IUPAC, "chirality", *Compendium of Chemical Terminology* (Gold Book), 5th ed.,
  online version 5.0.0, 2025. <https://doi.org/10.1351/goldbook.C01058>
  (Cloudflare가 curl을 막아서 브라우저로 열고 페이지 텍스트를 저장해 대조했다.)

**2차 출처**

- **[S10]** The Physics FAQ (편집 Don Koks), "Do Mirrors Reverse Left and Right?", Eric
  Schmidt, Phil Gibbs, David Richards, Scott Chase의 글을 바탕으로 함. 2015-01-17 수정
  (서버의 Last-Modified). <https://math.ucr.edu/home/baez/physics/General/Mirrors/mirrors.html>
- **[S11]** Christopher S. Baird (West Texas A&M University 물리학 부교수), "Why do mirrors
  flip left to right and not up to down?", *Science Questions with Surprising Answers*,
  2013-01-05.
  <https://www.wtamu.edu/~cbaird/sq/2013/01/05/why-do-mirrors-flip-left-to-right-and-not-up-to-down/>
- **[S12]** Wikipedia, "Mirror image", 2026-03-03 판 (rev 1341408793).
  <https://en.wikipedia.org/wiki/Mirror_image>
- **[S13]** Wikipedia, "Chirality", 2026-08-30 판 (rev 1372137188).
  <https://en.wikipedia.org/wiki/Chirality>
- **[S14]** Wikipedia, "Mirror writing", 2026-09-09 판 (rev 1374110533).
  <https://en.wikipedia.org/wiki/Mirror_writing>
- **[S15]** Wikipedia, "Plane mirror", 2025-10-08 판 (rev 1315689336).
  <https://en.wikipedia.org/wiki/Plane_mirror> 흔한 틀린 표현의 예로만 쓴다(Easy to misstate).

**열지 못했거나 읽지 않은 출처** (아래 내용은 S1–S4가 요약한 만큼만 안다)

- Takano & Tanaka, "Mirror reversal: Empirical tests of competing accounts", *Quarterly
  Journal of Experimental Psychology* 60(11), 1555–1584, 2007: SAGE가 403. 결과는 S4의 요약으로
  인용한다.
- Navon, "The puzzle of mirror reversal: A view from clockland", *Psycoloquy* 12(017), 2001:
  아카이브가 401. Navon(1987)도 읽지 못했다. Navon의 설과 반례는 S1·S2의 요약.
- Haig, "Reflections on inversion and reversion", *Perception* 22, 1993: SAGE가 403. S1의 요약만.
- Gregory, "Mirror reversal", *The Oxford Companion to the Mind*, 1987과 *Mirrors in Mind*,
  1997(책): 읽지 못했다. Gregory의 설은 S7(본인 글)과 S1·S2의 요약.
- Block(1974), Pears(1952), Gardner(*The Ambidextrous Universe*), Morris(1993): 읽지 못했다.
  S1의 요약만.
- 고가메(小亀淳)의 설(S4–S6과 같은 특집 498–511, 516–519, 542–545쪽)과 다하타·다카노의 서로에
  대한 비판(526–535, 546–558쪽): 목차와 영문 초록만 봤다.

## Claims

| # | Claim | Support | Verification |
|---|------|------|-----------|
| C1 | 평면거울은 거울면에 수직인 방향 하나만 뒤집는다. 거울을 마주 보면 그 방향이 앞뒤라서, 거울 쪽을 가리킨 화살표는 거울 속에서 나를 향해 되돌아 나오고, 위를 가리킨 화살표와 오른쪽을 가리킨 화살표는 거울 속에서도 위와 오른쪽을 가리킨다. 마주 본 거울은 좌우도 위아래도 뒤집지 않는다. 이 광학적 사실에는 거울 반전을 다룬 연구자 대부분이 동의한다(S1에 따르면 Haig 1993만 예외). | S10 "there is only one direction singled out for a flat mirror, being the direction perpendicular to its surface." / "So mirrors reverse in-out, and that's all they can ever do." / "The arrow's image runs alongside the real arrow and points in the same direction in both our world and in the mirror world. So the mirror doesn't reverse up-down." / "Again its image runs alongside the real arrow, and this image points to our right, just as the real arrow does."; S2 "A mirror simply reflects about its own plane; or, to put it another way, it reverses the direction of the axes perpendicular to its surface. If you face a mirror it reverses back and front"; S1 "As for the optical property of a mirror, all researchers except Haig (1993) agree that it reverses neither left and right nor up and down" / "They also agree that it is only front and back that are actually reversed by the optical property of a plane mirror." / "When a viewer faces a mirror, therefore, only the front-back axis is reversed."; S3 "A mirror reverses the direction of an object along the axis perpendicular to the mirror in producing its image."; S4 "物体が鏡に映るとき，光学的な変換は，鏡面に垂直な方向だけを反転し，鏡面と平行な方向は反転しない" / "従って，物体が鏡と正対している場合には，鏡は物体の前後方向だけを反転し，上下・左右方向は反転しないことになる．"; S11 "Mirrors do not flip left to right. They flip front to back."; S12 "Thus reflection is a reversal of the coordinate axis perpendicular (normal) to the mirror's surface." / "If one looks in a mirror two axes (up-down and left-right) coincide with those in the mirror, but the third axis (front-back) is reversed." | 반사 법칙(입사각 = 반사각)으로 광선 2000개를 추적: 점 (x, y, z)의 상은 늘 (x, y, −z). 오른쪽·위 화살표는 그대로, 앞 화살표만 반대 |
| C2 | 거울이 하는 일은 어느 방향에 두든 "면에 수직인 방향 뒤집기" 하나다. 그래서 거울 옆에 어깨를 대고 서면 거울은 정말로 좌우를 뒤집고, 바닥에 놓인 거울 위에 서면 위아래를 뒤집는다. | S2 "If you stand on top of it, it reverses up and down. Only if you stand beside the mirror does it actually reverse left and right."; S10 "Now we've gotten the mirror to reverse left-right." / "But in both of these cases the mirror was really just reversing in-out, which is all it can ever do." | 임의의 법선 n으로 반사: n만 −n이 되고 면을 따라가는 방향은 모두 그대로. 법선이 좌우면 좌우, 위아래면 위아래 뒤집기 |
| C3 | 그렇다고 "거울은 아무것도 안 바꾼다"는 틀리다. 앞뒤 한 방향만 뒤집혀도 모양은 거울상이 된다. 오른손의 거울상은 왼손 모양이고, 어떻게 돌리고 옮겨도 원래 오른손과 겹치지 않는다(이 성질이 손대칭, 카이랄성이다. chirality의 어원이 그리스어 "손"). 어느 축 하나를 뒤집어도 같은 모양이 나온다(셋은 서로 회전만큼 차이 난다). 그래서 거울 속 나는 "돌아선 나"가 아니라, 나의 거울상이 나를 보고 선 모습이다. | S9 "The geometric property of a rigid object (or spatial arrangement of points or atoms) of being non-superposable on its mirror image"; S13 "The left hand is a non-superposable mirror image of the right hand; no matter how the two hands are oriented, it is impossible for all the major features of both hands to coincide across all axes." / "The word chirality is derived from the Ancient Greek χείρ (kheír), meaning 'hand', a familiar chiral object."; S3 "The directional reversal in Statement 1 changes an asymmetric object into its enantiomorph" / "This is explained by the fact that the enantiomorph is obtained from an object by the reversal of any arbitrary axis" / "the mirror image of the left hand, for example, has the structure of the right hand irrespective of its orientation relative to the mirror."; S6 "非対称な物体を任意の一方向（上下，前後，あるいは左右のどの座標軸でも，また，座標軸からはずれた方向でもよい）にそって逆向きの形にすると，もとの物体の対掌体になる（立体幾何学的事実；対掌体とは，例えば右手に対する左手のような形態関係にある物体のこと）．"; S12 "Reflection in a mirror does result in a change in chirality, more specifically from a right-handed to a left-handed coordinate system (or vice versa)."; S2 "Every reflection is also equivalent to every other reflection, plus a rotation and translocation." / "Your image in the mirror is not you turned around, it is your enantiomorph, turned around to face you." | 손 모형(손가락·손바닥 방향·엄지)의 손대칭 부호 det: 오른손의 거울상은 왼손과 같은 부호. 정육면체를 돌리는 회전 24가지는 모두 det +1이라 거울상을 되돌리지 못한다. 좌우·위아래·앞뒤 뒤집기는 모두 det −1이고, 서로 반 바퀴 회전만큼 차이 |
| C4 | 좌우가 바뀐 것처럼 보이는 건 거울 속 모습을 나와 견주는 방식에서 나온다. 둘을 견주려면 (머릿속으로든) 한쪽을 돌려 같은 쪽을 보게 맞춰야 한다. 선 사람을 세로축으로 반 바퀴 돌려 맞추면 위와 앞은 맞고 좌우만 어긋난다. 그래서 내가 오른손을 들면 거울 속 사람은 왼손을 든 사람처럼 보인다. 물구나무서듯 가로축으로 돌려 맞추면 좌우 대신 위아래가 어긋나고, 돌지 않고 곧장 걸어 들어가 겹치면 앞뒤가 어긋난다. 이 기하는 논란이 없다(사람이 왜 보통 세로축으로 돌려 맞추는지는 C5, C6). | S2 "to see the enantiomorph in the mirror as a left-right reversal, you have to compare it to yourself, with either you or the enantiomorph turned around so that both face the same way." / "In this case, the act of alignment might be either to mentally turn the enantiomorph around so that it faces the same way that you do, or to imagine one's own body turned around and moved to a frontal position, so that you can then compare your own body to the enantiomorph. These acts of alignment show the reversal to be a left-right one."; S4 "鏡像の腕時計の位置を判断するとき，自分自身の視点ではなく，鏡像の視点をとると，腕時計は「右」にあることになる．" / "この視点変換は，幾何学的には，上下軸を中心とした180°の回転に相当する．3 次元空間でこの回転を行うと，方向枠の左右軸と前後軸が反転する．"; S1 "If the rotation is conducted on a horizontal axis, the multiprocess hypothesis predicts that an up-down reversal will be recognized instead of a left-right one." / "If the viewer imagines walking straight ahead to get into the mirror image, the front and back are reversed instead of the left and right."; S10 "They don't reverse left-right; we do, but only when we mentally place ourselves in our image's shoes in the mirror." | 행렬 항등식: 앞뒤 뒤집기 = (세로축 반 바퀴) × (좌우 뒤집기) = (가로축 반 바퀴) × (위아래 뒤집기). 왼손목 시계: 거울상에서는 x = −0.3(내 왼쪽 그대로), 세로축으로 돌아선 나라면 x = +0.3 |
| C5 | 왜 거울상의 차이를 하필 "좌우"로 느끼는지(C4처럼 비교하는 이유)는 심리학·철학에서 오래 다퉈 온 문제이고 정설이 없다. 1998년 다카노는 반세기 가까이 논의됐지만 만족스러운 답이 없다고 썼고, 2006년 일본인지과학회 심포지엄(도쿄대 야스다 강당)과 2008년 학회지 소특집에서 세 설이 맞붙었다. 다카노는 2015년 책 소개에서도 정설이 없다고 썼다(그 책이 이를 푼다고 주장하면서). | S1 "Although a number of psychologists, philosophers, physicists, and mathematicians have been discussing this mirror reversal problem for nearly half a century, no satisfactory answer has ever been obtained"; S5 "多くの哲学者，数学者，物理学者，心理学者などがこの問題を論じてきたが，その中には，ノーベル賞を受賞した物理学者達の名前も見える．それにも拘わらず，この問題には，未だに定説がないのである．" / "2006 年11 月23 日に東京大学の安田講堂で開催された日本認知科学会の冬のシンポジウム「なぜ鏡の中では左右が反対に見えるのか？」である．"; S8 "にもかかわらず，この問題には，いまだに定説がないのである．" / "その説明は，それを書いている人が正しいと思っている説明ではあっても，決して「万人が認めた定説」ではない．" / "この本の目標は，「鏡映反転」という，紀元前からのこの難問を解決することである．"; S4 "「観察者自身の鏡映反転と文字の鏡映反転は，それぞれ別個の現象である」と考えることになるが，この主張については，否定的な論者が多い"; S12 "but there is still some confusion about the explanation amongst psychologists." | – |
| C6 | 다투는 설명들(대본은 하나를 정답으로 고르지 않는다). (가) 회전설(Gregory): 물건을 거울 쪽으로 돌리거나 내가 돌아서기 때문이고, 보통 (중력 때문에) 세로축으로 돌린다. 비판: 돌린 책은 뒤표지를 보여 줄 뿐 거울상을 보여 주지 않고(S1), 거울상은 돌아선 내가 아니다(S2). (나) 대칭설: 몸이 대략 좌우대칭이라 세로축으로 돌려 맞출 때 가장 잘 맞는다(S1에 따르면 다수설). (다) 좌우축 종속설: 위아래·앞뒤는 몸의 생김새로 먼저 정해지고 좌우는 그 둘이 정해진 뒤에야 정해지는 축이라, 뒤집힘이 좌우로 몰린다(Corballis 2000, Tabata & Okuda 2000. 다하타는 심리가 본질적 이유가 아니라고 본다). (라) 정면 만남 도식(Navon 1987): 마주 선 상대에 대한 기대와 어긋나서. (마) 다중 과정설(Takano 1998): 자기 몸, 글자, 옆 거울의 반전은 원리가 다른 세 현상. 다카노의 실험에서는 이 설의 예측이 가장 잘 맞았다(다카노 자신의 비교). (바) 광학설(Haig 1993): 광학만으로 좌우가 뒤집힌다. 다른 연구자 대부분이 반대. | S7 "The image reversal is produced by rotating the object, or oneself, to face the mirror." / "Mirror images are usually right-left reversed, as we usually rotate things (because of gravity) around a vertical axis."; S1 "Gregory (1987, p. 492) attempted to explain the mirror reversal problem in terms of the physical rotation of an object." / "When a book is rotated, for example, its back cover is seen instead of the enantiomorph of its front cover." / "It is the approximate bilateral symmetry of a human body that causes the rotation about a vertical axis to produce the minimal discrepancy. This symmetry hypothesis is supported by the majority of researchers" / "Navon (1987) assumed that a viewer forms a frontal encounter schema on the basis of frequent typical encounters in which the intrinsically defined fronts of two objects face each other." / "It then proposes a multiprocess hypothesis based on the insight that what is called a mirror reversal is actually composed of three different types of reversal" / "Recently, Haig (1993) maintained that basic optics is sufficient to solve the mirror reversal problem because it is the optical characteristic of a mirror to reverse left and right without reversing up and down."; S2 "The main reason for this, I suggest, is that the top-bottom and back-front axes have functional priority, and the left-right axis cannot be defined until top-bottom and back-front are established." / "Gregory seems persistently to confuse the enantiomorph with the real thing."; S3 "The solution is given by combining the inversion caused by the optical process of mirroring and the definition of the left-right axis." / "The essence of this statement is that left and right cannot be defined until the top-bottom and front-back axes have been defined."; S6 "この説明によれば，鏡像の左右逆転・非逆転の根本的な理由（why）に，心理は本質的なかかわりを持たないことになる．"; S4 "Gregory 説の場合は，差の平均値は42.1%，Corballis とTabata & Okuda 説の場合は41.0%であったのに対し，多重プロセス理論の場合は，僅か5.7%に過ぎなかった．" | – |
| C7 | 거울 속 자기 모습이 좌우가 바뀌어 보인다고 누구나 느끼지는 않는다. 다카노·다나카의 실험에서 학생 102명이 거울을 마주 보고 섰을 때 약 3분의 2(65.7%)는 좌우가 바뀌었다고 했지만 3분의 1(33.3%)은 아니라고 했다. 반면 거울에 비춘 종이 글자(F나 D)는 102명 모두(100%) 좌우가 뒤집혔다고 했다. 도쿄의 대학 4곳 학부생 583명 설문(거울 앞의 자기를 상상하고 답함)에서는 "아무것도 뒤바뀌지 않았다"(46.5%)가 "좌우가 바뀌었다"(43.1%)보다 많았다. | S4 "102 名の学生（男33 名，女69 名）を個別に実験室に招き" / "約3 分の2 (65.7%)の被験者は左右の鏡映反転を認識したが，3 分の1(33.3%) の被験者は認識しなかった．" / "紙に印刷された文字（F またはD）が平面鏡に正対する状況(図1B) では，自分自身の左右鏡映反転を認識しなかった3 分の1 の被験者をも含めて，すべての被験者(100%) が文字の左右鏡映反転を認識したのである．" / "東京の大学4 校において，授業時間中に，計583名（男321 名，女249 名，不明13 名）の学部生に質問紙を配布した．" / "「鏡と向かい合って，そこに映っている自分の姿を見ているところを想像してみてください．" / "「なにも逆になっていない」，つまり，左右の反転を認識しないという回答は46.5%を占め，「左右が逆になっている」という回答の43.1%を上回っていた．" | 67/102 = 65.7%, 34/102 = 33.3% (둘 중 어느 쪽도 아닌 1명). 33 + 69 = 102, 321 + 249 + 13 = 583. 설문 비율은 선택 598개로 나눠도 응답자 583명으로 나눠도 정수 인원이 맞는다(원문은 분모를 밝히지 않는다) |
| C8 | 거울을 바닥에 눕히면(잔잔한 호수도 같다) 면에 수직인 방향이 위아래라서, 뒤집히는 것은 위아래다. 호수에 비친 산과 나무는 거꾸로 서 보이고, 오른쪽에 있던 것은 그대로 오른쪽에 있다. 탁자에 눕힌 거울 위에 글씨 쓴 종이를 세워 들면, 거울 속 글씨는 위아래가 뒤집혀 보이고 좌우는 뒤집히지 않는다. | S10 "Of course, if we lay the mirror down, then the arrow that points into the mirror now points down, and so its image points up. Now we have gotten the mirror to reverse up and down: just think of the upside-down landscape you can see in the surface of a lake."; S1 "Put a mirror on a table and hold a sheet of paper above it so that the paper is roughly perpendicular to the mirror. Then, an alphanumeric character on the paper will look upside down in the mirror, but its left and right sides are not reversed. This inversion occurs when we see ponds and lakes: Mountains, trees, birds, and people all look upside down."; S6 "例えば，下（床）鏡状態で私の鏡像を見るとき，鏡像は重力場に対して倒立している．"; S12 "In the picture of the mountain reflected in the lake (photograph top right), the reversal normal to the reflecting surface is obvious." | 수평 거울(평면 y = 0): 높이 1000 m 봉우리의 상은 1000 m 아래, 오른쪽 500 m의 나무는 그대로 오른쪽 500 m. 세워 든 종이의 글씨는 (u, v) → (u, −v) |
| C9 | 다만 바닥이나 천장 거울로 자기 몸을 볼 때도 사람들은 거울 속 자기를 좌우가 바뀐 사람으로 알아본다고 보고된다(동시에 방에 대해서는 거꾸로 서 있는 것으로 보인다). 누워서 세운 거울을 봐도 좌우 반전으로 느낀다. 바닥 거울이 "좌우 대신 위아래"를 뒤집어 보이게 하는 것은 풍경이나 글씨에 대해서다. | S1 "A viewer recognizes a left-right reversal while looking at the mirror image of his/her own body in a mirror on a ceiling or a floor." / "thus the body image in the mirror on the ceiling or floor looks upside down." / "When a viewer faces an upright mirror while lying down on a floor, the viewer still recognizes a left-right reversal."; S3 "If you have a watch around your left wrist, both of the mirror images in the aforementioned examples have one around the right wrist." (S3의 두 예는 거울을 마주 본 경우와 거울 위에 선 경우) | – (지각 보고. 거울상의 모양은 거울을 어느 방향에 두든 같은 거울상이다, C3) |
| C10 | 종이에 쓴 글씨를 거울에 비추려면 종이를 돌려 거울 쪽으로 향하게 해야 한다. 세로축으로 돌리면(보통 이렇게 한다) 거울 속 글씨는 좌우가 뒤집혀 보이고, 가로축으로 위로 넘기면 위아래가 뒤집혀 보이되 좌우는 뒤집히지 않는다. 뒤집히는 방향은 거울이 아니라 종이를 돌린 방식이 정한다. 종이를 돌리지 않으면(투명한 종이에 쓴 글씨, 오려 낸 글자) 거울 속에서도 똑바로 읽힌다. | S7 "Try looking at a book and then rotate it to face a mirror behind it - but not, as usual, by rotating the book around its vertical axis. Try rotating it around its horizontal axis to face the mirror. Now the book appears in the mirror upside down (which it is) but not right-left reversed. The reversal is given by the rotation of the object: a different rotation gives a different reversal."; S1 "Then the viewer will see the character's mirror image, which is reversed with respect to left and right." / "It thus predicts that only up and down will be reversed when the object is rotated about a horizontal axis, as in this figure. The multiprocess hypothesis makes the same prediction in this respect. Morris admitted that this prediction holds true for the characters." / "The same account can be applied to a character written on a transparent sheet or one that is cut out of a sheet of paper. Both of them look normal (i.e., not reversed) in a mirror because they do not have to be rotated, or we do not have to turn around to see them in the mirror."; S4 "文字を鏡に映すためには，文字を鏡に正対させなければならない．そのためには，通常，上下軸を中心にして，紙を180°回転する．この回転が，実物の文字の左右を反転するのである．"; S12 "If we first look at an object that is effectively two-dimensional (such as the writing on a card) and then turn the card to face a mirror, the object turns through an angle of 180° and we see a left-right reversal in the mirror. In this example, it is the change in orientation rather than the mirror itself that causes the observed reversal."; S11 "If you hold up a word to a mirror so that you can see both the word and its image in the mirror at the same time, you will see that they both read the same direction and there is therefore no right-left flipping." | 격자 위의 F를 종이에 두고: 세로축으로 반 바퀴 → 좌우가 뒤집힌 F, 가로축으로 반 바퀴 → 위아래가 뒤집힌 F(좌우는 그대로), 돌리지 않음 → 원래 F |
| C11 | (계산으로 끌어낸 주장. 출처는 일반 원리만 말한다) 두 경우 모두 거울 글씨다. 위아래가 뒤집힌 글씨는 좌우가 뒤집힌 글씨를 종이 안에서 반 바퀴 돌린 것과 같은 모양이다. 그래서 종이를 어느 쪽으로 돌려 비추든 거울 속 글씨는 제대로 읽히지 않는다. | S2 "Every reflection is also equivalent to every other reflection, plus a rotation and translocation." / "For example, if you write a word on transparent paper and flip it over, the word is now reversed"; S3 "This is explained by the fact that the enantiomorph is obtained from an object by the reversal of any arbitrary axis" | 위아래가 뒤집힌 F = 좌우가 뒤집힌 F를 평면에서 180° 돌린 것. F는 평면에서도 손대칭이 있다(좌우가 뒤집힌 F는 F를 90°씩 어떻게 돌려도 안 나온다) |
| C12 | 오래된 수수께끼다. 기원전 4세기에 플라톤이 이미 이 문제를 다뤘고(다카노. 가장 오래된 답이 플라톤의 『티마이오스』에 있다는 것은 Gregory 1997에 따른 것), 철학자·물리학자·수학자·심리학자가 논해 왔으며 그중엔 노벨 물리학상 수상자도 있다. | S8 "いまから二〇〇〇年以上も前，紀元前四世紀に，哲学者のプラトンがすでにこの問題を論じている．" / "そうした人たちのなかにはノーベル物理学賞の受賞者もいる．"; S5 "この問題に対する最も古い解答は，Gregory (1997) によれば，プラトンの対話編『ティマイオス』に見出されるという．"; S7 "Indeed, reflections and mirrors have confused thinkers from Plato to lmmanuel Kant" (원문 철자 그대로) | 기원전 4세기 → 2026년까지 2300년 이상 |
| C13 | 구급차 앞에 거울 글씨로 쓴 "AMBULANCE"는 앞차 운전자가 백미러로 보면 바로 읽힌다. 거꾸로 보이는 건 고개를 돌려 구급차를 직접 볼 때다. | S14 "A common modern usage of mirror writing can be found on the front of emergency vehicles such as police cars, fire engines and ambulances, where the word “POLICE”, “FIRE” or “AMBULANCE” is often written in very large mirrored text, so that drivers see the word the right way around in their rear-view mirrors."; S12 "For example, emergency vehicles such as ambulances or fire engines often display a label (e.g. “AMBULANCE”) on their front end with the text reversed, so that drivers of vehicles in front of them can read the words right way round in the rear-view mirror."; S11 "It seems to be flipped left to right when you turn your head to look at the ambulance. But that is a result of you turning your head, and not of the mirror." | 좌표 모형: 거울 글씨는 운전자 기준 오른쪽(+x)으로 쓰이고, 백미러는 x를 바꾸지 않으며, 앞을 보는 운전자에게 +x는 오른쪽이라 왼쪽에서 오른쪽으로 읽힌다 |
| C14 | 거울 두 장을 직각으로 맞붙인 모서리 거울에는 좌우가 바뀌지 않은 모습, 곧 남이 보는 내 모습이 보인다. 두 번 반사하면 거울상이 아니라 회전(세로축 반 바퀴)이 되기 때문이다. | S7 "right-left reversal can be cancelled - so the artist can see himself or herself as others see them - by using two mirrors touching at right angles, forming a mirror-corner."; S12 "It is also possible to create a non-reversing mirror by placing two first surface mirrors at 90º to give an image which is not reversed."; S6 "凹面円筒鏡や直角合わせ鏡は，1枚の平面鏡とは異なる像を作る（その理由は2 回反射の幾何光学で説明できる）．" | 직각으로 만나는 두 반사의 곱 = 세로축 반 바퀴 회전(det +1). 손대칭 부호가 그대로라 거울상이 아니다 |

## Easy to misstate

- **물리는 "앞뒤"다.** "거울은 좌우를 바꾼다" ✗ → "거울은 거울면에 수직인 방향을 뒤집는다.
  마주 보면 그게 앞뒤다" ✓ (C1). 교과서와 백과사전에도 흔한 표현이다(S15 "Images formed in
  plane mirrors are laterally inverted."). S12는 이를 "somewhat misleadingly called a “lateral
  inversion”"이라고 한다. 반대로 "거울은 절대 좌우를 안 바꾼다" ✗: 옆에 선 거울은 좌우를
  뒤집는다(C2). "거울을 마주 볼 때"를 붙인다.
- **위치와 모양을 섞지 않는다.** "거울은 아무것도 안 바꾼다", "거울 속 나는 나를 돌려세운 것"
  ✗ (C3). "좌우를 안 바꾼다"는 위치에 대한 말이다: "오른쪽으로 뻗은 손은 거울 속에서도
  오른쪽에 있다" ✓, "거울 속 그 손도 오른손이다" ✗ (모양은 왼손). 훅의 "오른손이 왼손이
  되는데"는 모양으로는 맞는 말이라, 답("좌우를 안 바꿔요")과 부딪히지 않게 대본이 위치 이야기와
  모양 이야기를 구분해야 한다. **앞뒤만 뒤집혀도 오른손 모양이 왼손 모양이 된다**는 것이 이
  주제의 진짜 반전이다(C3, verify.py의 손 모형).
- **그림: 거울 속 사람을 "돌아선 나"로 그리지 않는다.** 거울 속 사람의 시계(또는 든 손)는 내
  시계와 같은 쪽(내 기준 왼쪽이면 왼쪽)에 그린다. 돌아선 나로 그리면 반대쪽에 와서 틀린 그림이
  된다(C3, C4). 화살표 셋 중 위·오른쪽은 같은 방향, 앞만 나를 향한다 ✓.
- **"앞뒤가 뒤집힌다"의 뜻.** 거울 쪽을 가리킨 것이 거울 속에서는 나를 가리킨다는 뜻이다. 거울
  자체에 앞뒤가 있는 게 아니다(S1 "The “reversal of a front-back axis” simply means that a
  plane mirror transforms an optical layout so that the perceived depth in its mirror image is
  reversed."). "코가 뒤통수로 간다" 같은 말은 은유로만(S2의 사고 실험이 그렇게 쓴다).
- **지각의 이유는 단정하지 않는다 (C5, C6).** C4의 기하("세로축으로 돌려 맞추면 좌우만
  어긋난다")는 단정해도 된다. 하지만 "우리 뇌가 거울 속 모습을 돌리기 때문이라는 게 밝혀졌다",
  "정답은 ~다" ✗. "이렇게 비교하면", "흔한 설명은" ✓. 그레고리의 회전설, 대칭설, 다카노의
  다중 과정설 중 어느 하나를 과학의 결론처럼 말하지 않는다. 다중 과정설의 예측이 가장 잘
  맞았다는 S4의 결과는 다카노가 자기 실험으로 한 비교다.
- **"세로축으로 도는 건 중력 때문" ✗를 이유로 단정하지 않는다.** 누워서 거울을 봐도 좌우
  반전으로 느낀다고 보고된다(C9). 서 있는 사람에게는 세로축 = 머리에서 발로 가는 몸의 축이라
  둘이 같지만, 대본에서 이유를 댄다면 "우리는 보통 몸을 세로로 세운 채 돌아서 마주 보니까" 정도로
  쓴다. 그레고리는 "because of gravity"라고 쓰지만(S7) 이것도 한 설이다.
- **모두가 좌우 반전을 느끼는 건 아니다 (C7).** "누구나 거울 속 자기가 좌우가 바뀌었다고
  느낀다" ✗. 한 실험에서 3분의 1은 아니라고 했다. 대신 글자는 모두 뒤집혀 보였다. 수치를
  쓰면 "한 실험에서 학생 102명 중"처럼 범위를 붙인다. 설문(46.5% 대 43.1%)은 상상으로 답한
  것이고 분모(598개 선택인지 583명인지)가 원문에 없다. "일본인의 절반"처럼 넓히지 않는다.
- **바닥 거울은 풍경과 글씨로 보여 준다 (C8, C9).** 호수의 산, 탁자 거울 위에 세운 종이의
  글씨는 위아래가 뒤집혀 보인다 ✓. 그러나 "바닥 거울에 비친 나는 좌우가 안 바뀌고 위아래만
  바뀐다" ✗: 자기 몸은 여전히 좌우가 바뀐 사람으로 알아본다고 보고된다. 호수 장면은 사람 말고
  산이나 나무로 그린다.
- **종이 글씨 (C10, C11).** 종이를 세로축으로(옆으로) 돌리면 좌우, 가로축으로(위로) 넘기면
  위아래가 뒤집힌다 ✓. "위로 넘기면 글씨가 똑바로 보인다" ✗: 위아래가 뒤집혀 보이고, 그것도
  거울 글씨다(좌우가 뒤집힌 글씨를 반 바퀴 돌린 모양). "종이를 안 돌리면 똑바로 읽힌다"는
  투명한 종이나 오려 낸 글자일 때만 ✓ (보통 종이면 거울에 뒷면만 비친다).
- **"2000년 동안 아무도 못 푼 문제" ✗ (과장).** 거울이 하는 일(물리)은 풀려 있다. 다투는 건
  왜 하필 좌우로 느끼느냐다 ✓ (C5). "플라톤도 고민했다" ✓ (C12, 다카노가 Gregory 1997을
  인용). 노벨상 수상자가 논했다는 것은 맞지만 읽은 출처는 이름을 대지 않는다. "파인만이 풀었다"
  같은 이름 붙이기 ✗.
- **Haig 한 사람은 반대했다.** "모든 과학자가 동의한다" ✗ → "대부분이 동의한다" ✓ (C1).
- **구급차 (C13).** 읽은 출처는 영어권 예("AMBULANCE")만 든다. "우리나라 구급차도 …"는 출처가
  없으니 쓰지 않는다.
- 용어: 대본에서 "카이랄성"은 어렵다. "손대칭", "오른손과 왼손 같은 관계"로 풀어 쓴다.
  "거울상"은 C3의 뜻(모양이 거울에 비친 쌍둥이)으로만 쓴다.
