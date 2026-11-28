(function(root){
  'use strict';
  // Each entry follows this app's on-screen symbol, rather than inventing a
  // universal resource alphabet. A symbol may mean something else in another game.
  const catalog={
  "distilled": [
    [
      "◉",
      "돈",
      "시장 구입과 증류소 운영에 사용하는 화폐입니다."
    ],
    [
      "★",
      "점수",
      "게임 종료 시 가장 높은 최종 점수를 목표로 합니다."
    ],
    [
      "💧",
      "물",
      "증류에 사용하는 기본 재료입니다."
    ],
    [
      "◇",
      "효모",
      "증류에 사용하는 기본 재료입니다."
    ],
    [
      "🌾",
      "곡물 당분",
      "술 제조법에서 요구하는 당분 종류입니다."
    ],
    [
      "✿",
      "식물 당분",
      "술 제조법에서 요구하는 당분 종류입니다."
    ],
    [
      "●",
      "과일 당분",
      "술 제조법에서 요구하는 당분 종류입니다."
    ],
    [
      "✦",
      "알코올",
      "증류 단계에서 당분에 따라 추가합니다."
    ],
    [
      "▱",
      "풍미",
      "숙성한 술의 향과 가치에 영향을 줍니다."
    ],
    [
      "▣",
      "술병",
      "판매할 때 사용할 술병입니다."
    ],
    [
      "▰",
      "금속 술통",
      "제조법에 맞는 숙성·증류 용기입니다."
    ],
    [
      "▥",
      "나무 술통",
      "제조법에 맞는 숙성 용기입니다."
    ],
    [
      "◒",
      "진흙 술통",
      "제조법에 맞는 숙성 용기입니다. 본판과 확장 모두에서 사용합니다."
    ],
    [
      "♛",
      "브랜드 라벨",
      "판매한 술의 라벨과 보상을 확인합니다."
    ],
    [
      "▲",
      "제조법 큐브",
      "습득한 제조법과 레벨을 표시합니다."
    ],
    [
      "⚙",
      "증류소 업그레이드",
      "장비·전문가의 지속 능력을 확인합니다."
    ],
    [
      "♜",
      "증류업자",
      "개인의 시작 자원·능력·시그니처 제조법을 확인합니다."
    ],
    [
      "▤",
      "카드",
      "재료·물품 등 카드 정보를 표시합니다."
    ]
  ],
  "tkid": [
    [
      "■",
      "스코틀랜드 추종자",
      "파란 큐브. 지역의 세력과 내 궁정 지지자를 나타냅니다.",
      "#79b9dd",
      "cube"
    ],
    [
      "■",
      "웨일스 추종자",
      "빨간 큐브.",
      "#ef9491",
      "cube"
    ],
    [
      "■",
      "잉글랜드 추종자",
      "노란 큐브.",
      "#edcb7c",
      "cube"
    ],
    [
      "⚑",
      "지원",
      "해당 세력 추종자를 지역에 배치합니다."
    ],
    [
      "♧",
      "소집",
      "공급처에서 각 세력의 추종자 1개씩을 미확정 지역에 배치합니다."
    ],
    [
      "⇄",
      "기동",
      "서로 다른 두 미확정 지역의 추종자를 1개씩 맞바꿉니다."
    ],
    [
      "⇆",
      "우회 기동",
      "인접한 두 미확정 지역에서 추종자를 1개와 2개 교환합니다. 불가능하면 1개씩 교환합니다."
    ],
    [
      "◇",
      "협상",
      "미해결·봉인되지 않은 지역 카드 두 장의 순서를 교환한 뒤 한 장을 봉인합니다."
    ],
    [
      "♜",
      "세력 지배",
      "해당 지역의 분쟁 결과를 나타냅니다."
    ]
  ],
  "cm": [
    [
      "■",
      "붉은 가문 기사",
      "기사 세력의 색입니다. 플레이어의 성 색과 구별하세요.",
      "#be6053",
      "cube"
    ],
    [
      "■",
      "푸른 가문 기사",
      "기사 세력의 색입니다.",
      "#587fa8",
      "cube"
    ],
    [
      "■",
      "초록 가문 기사",
      "기사 세력의 색입니다.",
      "#70956a",
      "cube"
    ],
    [
      "■",
      "노란 가문 기사",
      "기사 세력의 색입니다.",
      "#d6b75b",
      "cube"
    ],
    [
      "■",
      "분홍 가문 기사",
      "기사 세력의 색입니다.",
      "#bc829c",
      "cube"
    ],
    [
      "♜",
      "성",
      "그 색 플레이어가 소유한 성입니다."
    ],
    [
      "♛",
      "황제",
      "도착한 영토의 지배권을 판정합니다."
    ],
    [
      "1–5",
      "순서 원반",
      "이번 라운드의 순서와 황제 최대 이동 거리를 정합니다."
    ],
    [
      "♟",
      "궁정·예비 기사",
      "궁정의 기사는 세력 지배권을, 예비 기사는 배치 가능한 수를 나타냅니다."
    ],
    [
      "♛",
      "왕관",
      "주사위의 왕관 눈은 원하는 가문 기사 1명을 선택합니다."
    ]
  ],
  "container": [
    [
      "■",
      "보라색 컨테이너",
      "공장·항구·배·해외 섬의 위치와 개수를 확인하세요.",
      "#956ca1",
      "cube"
    ],
    [
      "■",
      "베이지색 컨테이너",
      "색별 가치는 내 가치 카드에서 확인합니다.",
      "#c5ae7e",
      "cube"
    ],
    [
      "■",
      "갈색 컨테이너",
      "색별 가치는 내 가치 카드에서 확인합니다.",
      "#92674c",
      "cube"
    ],
    [
      "■",
      "흰색 컨테이너",
      "색별 가치는 내 가치 카드에서 확인합니다.",
      "#e5dfd1",
      "cube"
    ],
    [
      "■",
      "검은색 컨테이너",
      "색별 가치는 내 가치 카드에서 확인합니다.",
      "#40474b",
      "cube"
    ],
    [
      "$",
      "현금",
      "매입·입찰·생산·대출 상환에 쓰는 돈입니다."
    ],
    [
      "⚙",
      "공장 기계",
      "기계당 해당 색 컨테이너를 생산합니다."
    ],
    [
      "▥",
      "창고·항구",
      "다른 공장에서 매입한 화물의 보관 장소입니다."
    ],
    [
      "⛴",
      "배",
      "선적 화물을 운반합니다."
    ],
    [
      "⚓",
      "항구",
      "정박과 화물 매입 장소입니다."
    ],
    [
      "▦",
      "해외 섬",
      "배송 경매를 통해 획득한 컨테이너를 보관합니다."
    ],
    [
      "♜",
      "은행",
      "은행 포함 게임에서 공장·창고 경매와 자금을 확인합니다."
    ]
  ],
  "manila": [
    [
      "₱",
      "페소",
      "경매·주식·조력자 배치에 쓰는 돈입니다."
    ],
    [
      "⛵",
      "배",
      "항해 주사위만큼 전진합니다."
    ],
    [
      "♟",
      "조력자",
      "승선·항구·조선소 등 배치한 장소에 따라 보상을 받습니다."
    ],
    [
      "⚓",
      "항구",
      "도착한 배의 보상을 처리합니다."
    ],
    [
      "⚒",
      "조선소",
      "도착하지 못한 배의 보상을 처리합니다."
    ],
    [
      "⚔",
      "해적",
      "해적 칸과 항해 회차에 따라 승선·약탈합니다."
    ],
    [
      "▤",
      "주식",
      "해당 상품의 종료 시 시세만큼 가치가 있습니다."
    ],
    [
      "⚄",
      "주사위",
      "각 상품 배의 이번 항해 이동 수입니다."
    ]
  ],
  "hellas": [
    [
      "◇",
      "대리석",
      "건설 비용입니다. 상대의 보유량은 게임 중 비공개입니다."
    ],
    [
      "◎",
      "반지",
      "게임 종료 시 점수에 영향을 줍니다."
    ],
    [
      "⌂",
      "집",
      "해안 또는 내륙에 배치하는 건물입니다. 위치에 따라 대리석 비용이 달라집니다."
    ],
    [
      "♜",
      "궁전",
      "해안 도시의 점수와 연결에 영향을 줍니다."
    ],
    [
      "▦",
      "광장",
      "건물과 연결된 도시를 확장합니다."
    ],
    [
      "▥",
      "신전 기둥",
      "신전의 배치 수와 점수 조건을 확인합니다."
    ],
    [
      "♟",
      "일꾼",
      "현재 이용할 채석장의 위치를 표시합니다."
    ],
    [
      "★",
      "점수",
      "최종 결과에서 도시·신전·조각상 등을 합산합니다."
    ]
  ],
  "redcathedral": [
    [
      "■",
      "목재",
      "운송·건설·문 장식에 쓰는 자재입니다.",
      "#b78059",
      "cube"
    ],
    [
      "■",
      "벽돌",
      "건설 자재입니다.",
      "#e78676",
      "cube"
    ],
    [
      "■",
      "석재",
      "건설·아치 장식에 쓰는 자재입니다.",
      "#abc4cc",
      "cube"
    ],
    [
      "◆",
      "금",
      "건설·십자가 장식에 쓰는 자재입니다.",
      "#f9d549",
      "diamond"
    ],
    [
      "◆",
      "녹색 보석",
      "장식에 추가해 명성 점수를 얻는 보석입니다.",
      "#69d4a7",
      "diamond"
    ],
    [
      "◆",
      "보라 보석",
      "장식에 추가해 명성 점수를 얻는 보석입니다.",
      "#c391e2",
      "diamond"
    ],
    [
      "◉",
      "루블",
      "시장 이동·전문가 고용 등 비용입니다."
    ],
    [
      "★",
      "명성 점수",
      "승점을 나타내는 점수입니다."
    ],
    [
      "공로",
      "공로 점수",
      "건설 완료 등의 보상으로 받는 점수 트랙입니다."
    ],
    [
      "⚑",
      "깃발",
      "플레이어가 확보한 성당 구역입니다."
    ],
    [
      "▤",
      "허가증",
      "확장 계약자 파견 비용이며 창고와 별도입니다."
    ],
    [
      "◆",
      "다이아몬드",
      "확장에서 추가하는 보석입니다.",
      "#97d6df",
      "diamond"
    ]
  ],
  "ostia": [
    [
      "▤",
      "허가증",
      "항해와 일부 비용에 씁니다."
    ],
    [
      "▰",
      "목재",
      "조선·건설 등에 쓰는 자원입니다."
    ],
    [
      "🌾",
      "밀",
      "주문 등에 쓰는 자원입니다."
    ],
    [
      "⬟",
      "석재",
      "건설 등에 쓰는 자원입니다."
    ],
    [
      "◆",
      "금",
      "무역과 자유 교환 등에 쓰는 자원입니다."
    ],
    [
      "⚓",
      "선박",
      "항구에서 분배하거나 해도에서 항해합니다."
    ],
    [
      "▥",
      "건물",
      "건설 수와 건물 점수 배율을 확인합니다."
    ],
    [
      "⚱",
      "항아리",
      "포상 배율에 따라 종료 점수를 얻습니다."
    ],
    [
      "✦",
      "포상",
      "건물·선박·항아리 점수의 배율을 높입니다."
    ],
    [
      "♞",
      "야생동물",
      "동물 수집과 세트 점수에 쓰입니다."
    ],
    [
      "♘",
      "이국동물",
      "동물 수집과 세트 점수에 쓰입니다."
    ],
    [
      "⚔",
      "무기",
      "해적 항구를 통과하거나 약탈할 때 씁니다."
    ],
    [
      "♜",
      "후원자",
      "선택한 후원자의 고유 혜택입니다."
    ]
  ],
  "hanami": [
    [
      "✿",
      "벚꽃",
      "주변 타일 영향력을 비교해 획득합니다."
    ],
    [
      "▣",
      "등불",
      "주변 타일 영향력을 비교해 획득합니다."
    ],
    [
      "▲",
      "주먹밥",
      "주변 타일 영향력을 비교해 획득합니다."
    ],
    [
      "✦",
      "고양이",
      "벚꽃·등불·주먹밥 세 종류 모두에 영향을 주는 타일입니다."
    ],
    [
      "≋",
      "배",
      "물 위에 배치하는 타일입니다."
    ],
    [
      "↯",
      "빠른 타일",
      "일반 배치와 함께 사용할 수 있는 빠른 타일입니다."
    ],
    [
      "↷",
      "이동",
      "기존 내 타일을 옮기는 효과입니다."
    ],
    [
      "＋",
      "뽑기",
      "공급에서 타일을 보충합니다."
    ],
    [
      "▰",
      "덮기",
      "기존 타일을 덮는 효과입니다."
    ],
    [
      "↗",
      "복사",
      "선택한 타일의 효과를 따라갑니다."
    ]
  ],
  "rebirth": [
    [
      "☀",
      "에너지 농장",
      "연결된 같은 종류 농장으로 점수를 얻습니다."
    ],
    [
      "♧",
      "식량 농장",
      "연결된 같은 종류 농장으로 점수를 얻습니다."
    ],
    [
      "⌂",
      "정착지",
      "주변 농장과 지역 조건을 확인합니다."
    ],
    [
      "♜",
      "성·원형 탑",
      "지도 종류에 따라 다수 경쟁 또는 방문 보상을 뜻합니다."
    ],
    [
      "✦",
      "대성당",
      "스코틀랜드 지도의 목표 장소입니다."
    ],
    [
      "▤",
      "비공개 임무",
      "종료 시 조건을 달성하면 추가 점수입니다."
    ],
    [
      "★",
      "점수",
      "최종 승리를 정하는 점수입니다."
    ]
  ],
  "etchinstone": [
    [
      "●",
      "물",
      "속성 일치 시 공격·방어 효과를 확인합니다.",
      "#80c8eb"
    ],
    [
      "▲",
      "불",
      "속성 일치 시 공격·방어 효과를 확인합니다.",
      "#f39c88"
    ],
    [
      "ϟ",
      "번개",
      "속성 일치 시 공격·방어 효과를 확인합니다.",
      "#f4d76f"
    ],
    [
      "◆",
      "그림자",
      "속성 일치 시 공격·방어 효과를 확인합니다.",
      "#c5b2e9"
    ],
    [
      "⚔",
      "공격",
      "적의 난도와 비교하는 수치입니다."
    ],
    [
      "➜",
      "이동",
      "여정 난도·시간과 비교하는 수치입니다."
    ],
    [
      "↟",
      "선공",
      "적의 선제 피해를 피할 수 있는지 확인합니다."
    ],
    [
      "＋",
      "증폭",
      "선택한 행동 수치를 높이는 카드 역할입니다."
    ]
  ],
  "teotihuacan": [
    [
      "●",
      "카카오",
      "주요 행동 비용·일꾼 임금 등에 사용합니다.",
      "#c7a185"
    ],
    [
      "▰",
      "목재",
      "건물·조각상·피라미드 등에 쓰는 자원입니다.",
      "#d0ae88"
    ],
    [
      "⬟",
      "석재",
      "건설에 쓰는 자원입니다.",
      "#c6d1d2"
    ],
    [
      "◆",
      "금괴",
      "기술·신전·조각상 등에 쓰는 자원입니다.",
      "#f1cd6d"
    ],
    [
      "⚄",
      "일꾼 주사위",
      "눈은 일꾼의 힘이며 성장하면 눈이 증가합니다."
    ],
    [
      "★",
      "승점",
      "게임 종료 시 가장 높은 점수를 목표로 합니다."
    ],
    [
      "♜",
      "궁전",
      "1번 행동판입니다."
    ],
    [
      "♣",
      "숲",
      "2번 행동판입니다."
    ],
    [
      "⬟",
      "채석장",
      "3번 행동판입니다."
    ],
    [
      "✦",
      "연금술",
      "5번 행동판입니다."
    ],
    [
      "▥",
      "귀족",
      "6번 행동판입니다."
    ],
    [
      "❖",
      "조각상",
      "7번 행동판입니다."
    ],
    [
      "▰",
      "건설",
      "8번 행동판입니다."
    ],
    [
      "☀",
      "일식 진행",
      "점수 계산 시점까지 남은 진행을 표시합니다."
    ],
    [
      "◆",
      "금광",
      "4번 행동판입니다."
    ]
  ],
  "stupormundi": [
    [
      "🌾",
      "곡물",
      "동맹 소환·전문가 승급 등에 사용하는 자원입니다."
    ],
    [
      "▰",
      "석재",
      "성 건설의 주재료입니다."
    ],
    [
      "◉",
      "은화",
      "항해·시장·카드 구입 등에 사용하는 돈입니다."
    ],
    [
      "★",
      "승점",
      "최종 승리의 기준입니다."
    ],
    [
      "♜",
      "탑",
      "성의 건물이며 동맹 자리를 엽니다."
    ],
    [
      "▥",
      "성벽",
      "저장고의 보관 한도를 늘립니다."
    ],
    [
      "⌂",
      "요새",
      "개인판의 생산과 카드 능력에 영향을 줍니다."
    ],
    [
      "🛡",
      "동맹",
      "소환한 동맹의 혜택과 가문을 확인합니다."
    ],
    [
      "♟",
      "전문가",
      "작업 영역에서 승급하며 능력을 해금합니다."
    ],
    [
      "⚓",
      "항해",
      "함선 위치와 이동 비용을 확인합니다."
    ],
    [
      "♛",
      "황제",
      "칙령·황제 구성물에 따른 혜택을 확인합니다."
    ]
  ],
  "andromedasedge": [
    [
      "ϟ",
      "에너지",
      "함선·모듈·전투 등의 비용과 효과에 쓰는 자원입니다."
    ],
    [
      "⬢",
      "티타늄",
      "개발 비용 등에 쓰는 자원입니다."
    ],
    [
      "❄",
      "얼음",
      "개발 비용 등에 쓰는 자원입니다."
    ],
    [
      "⬙",
      "나노탄소",
      "개발 비용 등에 쓰는 자원입니다."
    ],
    [
      "◉",
      "크레딧",
      "교역·모듈 등에 쓰는 돈입니다."
    ],
    [
      "▧",
      "전술 카드",
      "손패의 전술 능력을 사용합니다."
    ],
    [
      "♟",
      "지도자",
      "세력의 고유 능력을 확인합니다."
    ],
    [
      "▪",
      "수송선",
      "지역에 배치하는 함선 종류입니다."
    ],
    [
      "▴",
      "전투기",
      "전투 능력을 가진 함선입니다."
    ],
    [
      "✦",
      "과학선·과학 트랙",
      "위치에 따라 함선 종류 또는 트랙입니다."
    ],
    [
      "▰",
      "중순양함",
      "전투 함선 종류입니다."
    ],
    [
      "▥",
      "문명 트랙",
      "문명 발전과 보상을 확인합니다."
    ],
    [
      "◆",
      "패권 트랙",
      "패권 발전과 보상을 확인합니다."
    ]
  ],
  "worldorder": [
    [
      "●",
      "자금(오르디)",
      "투자·군대·수입 등에 사용하는 화폐입니다.",
      "#e5bc71"
    ],
    [
      "ϟ",
      "에너지",
      "기초 자원입니다.",
      "#e5c76d"
    ],
    [
      "⬢",
      "원자재",
      "기초 자원입니다.",
      "#d3a478"
    ],
    [
      "✳",
      "식량",
      "기초 자원입니다.",
      "#9acb9b"
    ],
    [
      "▣",
      "소비재",
      "번영 증가와 카드 비용 등에 씁니다.",
      "#9ac4e9"
    ],
    [
      "▤",
      "서비스",
      "생산과 카드 비용 등에 씁니다.",
      "#d8abe0"
    ],
    [
      "◆",
      "외교력",
      "관계 개선·교섭·동맹 등에 씁니다.",
      "#8bd4bd"
    ],
    [
      "▲",
      "군대",
      "개인판의 대기 병력 또는 지도상의 배치 병력입니다.",
      "#eb9c9c"
    ],
    [
      "★",
      "승점",
      "최종 패권을 정하는 점수입니다."
    ],
    [
      "연구",
      "연구력",
      "손에 남긴 카드의 연구력과 카드 시장 비용을 비교합니다."
    ]
  ],
  "greatlibrary": [
    [
      "◷",
      "시간",
      "장소 행동·필사 등에 지불합니다."
    ],
    [
      "★",
      "명성",
      "최종 승리의 기준입니다."
    ],
    [
      "◆",
      "잉크",
      "필사와 왕의 요청 등에 쓰는 자원입니다."
    ],
    [
      "▤",
      "파피루스",
      "필사와 왕의 요청 등에 쓰는 자원입니다."
    ],
    [
      "▣",
      "은",
      "필사와 왕의 요청 등에 쓰는 자원입니다."
    ],
    [
      "✧",
      "연구",
      "연구와 보너스에 사용하는 자원입니다."
    ],
    [
      "♛",
      "왕의 은총",
      "왕실 혜택에 사용합니다."
    ],
    [
      "◉",
      "도서관 토큰",
      "도서관의 책과 능력 선택에 씁니다."
    ],
    [
      "♫",
      "예술·풍자",
      "필사본·필경사의 전문 분야입니다."
    ],
    [
      "⚖",
      "법률·웅변",
      "필사본·필경사의 전문 분야입니다."
    ],
    [
      "✚",
      "의학·철학",
      "필사본·필경사의 전문 분야입니다."
    ],
    [
      "◇",
      "공예품",
      "수집·요청에 사용하는 항목입니다."
    ],
    [
      "▲",
      "번역석",
      "호박색·녹색·청색으로 구별합니다."
    ],
    [
      "✎",
      "필사실",
      "필사 행동 장소입니다."
    ]
  ],
  "seti": [
    [
      "◆",
      "크레딧",
      "발사·카드·스캔 등에 지불합니다.",
      "#e9ca83"
    ],
    [
      "ϟ",
      "에너지",
      "이동·착륙·스캔·분석 등에 지불합니다.",
      "#ebc976"
    ],
    [
      "♩",
      "명성",
      "연구·카드 구입에 씁니다. 최대 10입니다.",
      "#d0abe8"
    ],
    [
      "▦",
      "데이터",
      "컴퓨터로 옮겨 보상을 얻습니다. 보관 한도는 6입니다.",
      "#a5d4e5"
    ],
    [
      "▤",
      "카드",
      "손패·공개 카드·수입 카드의 위치를 확인합니다."
    ],
    [
      "⌁",
      "신호 토큰",
      "스캔 도중 카드를 추가로 버려 신호를 놓습니다."
    ],
    [
      "★",
      "승점",
      "최종 승리를 정하는 점수입니다."
    ],
    [
      "➜",
      "이동",
      "탐사선을 인접한 우주 칸으로 이동합니다."
    ],
    [
      "●",
      "보라색 생명 흔적",
      "보라색 생명 흔적의 개수를 표시합니다.",
      "#bb9bdc"
    ],
    [
      "●",
      "노란색 생명 흔적",
      "노란색 생명 흔적의 개수를 표시합니다.",
      "#ebd07c"
    ],
    [
      "●",
      "파란색 생명 흔적",
      "파란색 생명 흔적의 개수를 표시합니다.",
      "#84c7e5"
    ],
    [
      "☉",
      "태양계·공전",
      "공전 때 회전하는 판과 현재 행성 위치를 확인합니다."
    ]
  ],
  "shackleton": [
    [
      "◉",
      "크레딧",
      "주요 행동·건설·자금 지원 등의 비용입니다.",
      "#f2ce76"
    ],
    [
      "⬟",
      "티타늄",
      "구조물 건설 등에 쓰는 자원입니다.",
      "#bfd3e1"
    ],
    [
      "◆",
      "희토류",
      "건설·프로젝트 등에 쓰는 자원입니다.",
      "#a2d3a0"
    ],
    [
      "✦",
      "명성",
      "명성 트랙의 보상과 유지 관리 비용에 영향을 줍니다.",
      "#cdb5f0"
    ],
    [
      "★",
      "승점",
      "최종 승리의 기준입니다."
    ],
    [
      "ϟ",
      "공용 에너지",
      "모두가 공유하는 에너지 트랙입니다."
    ],
    [
      "▲",
      "공학자",
      "채굴과 건설 보너스를 담당합니다.",
      "#e8ab62"
    ],
    [
      "■",
      "기술자",
      "크레딧 수입과 자금 지원 보너스를 담당합니다.",
      "#f27878"
    ],
    [
      "●",
      "과학자",
      "기업 토큰 활성화와 기업 행동 보너스를 담당합니다.",
      "#6ebcff"
    ],
    [
      "◇",
      "민간인",
      "기지 작업자는 ◇, 자원 표시에는 ♟로도 나타냅니다. 루나시티 등에서 배치합니다."
    ],
    [
      "♙",
      "관광객",
      "유지 관리 때 이동·귀환하는 방문자입니다."
    ],
    [
      "▱",
      "설계도",
      "제니스웍스의 프로젝트·구조물 효과에 사용합니다."
    ],
    [
      "◌",
      "헬륨 3",
      "문 마이닝 기업의 자원입니다."
    ],
    [
      "♧",
      "식물",
      "에버그린 팜 기업의 자원입니다."
    ],
    [
      "▣",
      "로봇",
      "스페이스 로보틱스 기업의 구성물입니다."
    ],
    [
      "△",
      "화학 표본",
      "셀레늄 리서치 표본입니다.",
      "#85c4ec"
    ],
    [
      "●",
      "암석 표본",
      "셀레늄 리서치 표본입니다.",
      "#8fcca1"
    ],
    [
      "⬟",
      "운석 표본",
      "셀레늄 리서치 표본입니다.",
      "#e2a7cf"
    ],
    [
      "▰",
      "화성 승선권",
      "화성 이주 효과에 사용합니다."
    ],
    [
      "⌁",
      "스카이 워치 트랙",
      "기업의 진행도와 혜택을 나타냅니다."
    ]
  ],
  "bloodhunt": [
    [
      "♦",
      "피",
      "카드의 슈트입니다.",
      "#ee8790"
    ],
    [
      "♨",
      "촛불",
      "카드의 슈트입니다.",
      "#68d2c4"
    ],
    [
      "⚰",
      "관·흡혈귀",
      "카드에서는 슈트, 시민 토큰에서는 흡혈귀 면입니다.",
      "#c3a0ed"
    ],
    [
      "✚",
      "십자가",
      "카드의 슈트입니다.",
      "#f5d278"
    ],
    [
      "♜",
      "영주",
      "시민 세트와 점수를 확인합니다."
    ],
    [
      "♛",
      "귀부인",
      "시민 세트와 점수를 확인합니다."
    ],
    [
      "✝",
      "성직자",
      "시민 세트와 점수를 확인합니다."
    ],
    [
      "▤",
      "학자",
      "시민 세트와 점수를 확인합니다."
    ],
    [
      "♬",
      "무희",
      "시민 세트와 점수를 확인합니다."
    ]
  ],
  "whitecastle": [
    [
      "food",
      "식량",
      "정원사 배치 비용. 최대 7개.",
      "",
      "wc"
    ],
    [
      "iron",
      "철",
      "무사 배치 비용. 최대 7개.",
      "",
      "wc"
    ],
    [
      "pearl",
      "자개",
      "가신 승진 비용. 최대 7개.",
      "",
      "wc"
    ],
    [
      "chasen",
      "차선",
      "말차 확장의 게이샤 이동 비용. 최대 7개.",
      "",
      "wc"
    ],
    [
      "coin",
      "동전",
      "주사위 차액·입장료 등의 돈입니다.",
      "",
      "wc"
    ],
    [
      "seal",
      "인장",
      "일부 주요 행동과 계절 경계 통과에 씁니다.",
      "",
      "wc"
    ],
    [
      "vp",
      "가문 점수",
      "최종 승리의 기준입니다.",
      "",
      "wc"
    ],
    [
      "time",
      "영향력",
      "차례 순서와 종료 점수에 영향을 줍니다.",
      "",
      "wc"
    ],
    [
      "courtier",
      "가신",
      "성 입장·승진 행동입니다.",
      "",
      "wc"
    ],
    [
      "gardener",
      "정원사",
      "정원 배치 행동입니다.",
      "",
      "wc"
    ],
    [
      "warrior",
      "무사",
      "훈련장 배치 행동입니다.",
      "",
      "wc"
    ],
    [
      "geisha",
      "게이샤",
      "말차 확장의 다도길 이동입니다.",
      "",
      "wc"
    ],
    [
      "lantern",
      "등불",
      "개인판에 드러난 등불 보상을 받습니다.",
      "",
      "wc"
    ],
    [
      "well",
      "우물",
      "우물 보상을 받습니다.",
      "",
      "wc"
    ],
    [
      "castle",
      "성",
      "조건에 맞는 성 카드 행동입니다.",
      "",
      "wc"
    ],
    [
      "domain",
      "개인판",
      "개인판의 해당 줄을 활성화합니다.",
      "",
      "wc"
    ],
    [
      "trade",
      "교역",
      "교역 확장의 특권 구매 행동입니다.",
      "",
      "wc"
    ],
    [
      "gift",
      "다이묘 선물",
      "해금한 종료 목표의 점수입니다.",
      "",
      "wc"
    ],
    [
      "pond",
      "수련",
      "연못의 수련 보상입니다.",
      "",
      "wc"
    ],
    [
      "any",
      "원하는 자원",
      "사용하는 확장과 문구에 따라 선택 범위를 확인합니다.",
      "",
      "wc"
    ]
  ],
  "kanban": [
    [
      "◷",
      "잔여 시프트",
      "이번 업무에 더할 수 있는 시프트입니다. 최대 10입니다."
    ],
    [
      "▤",
      "교재",
      "교육·독학에 사용하는 자원입니다."
    ],
    [
      "⬡",
      "부품 교환권",
      "부품 비용·교환 등에 사용합니다."
    ],
    [
      "●",
      "발언 토큰",
      "회의에서 목표를 주장할 때 사용합니다."
    ],
    [
      "ϟ",
      "전동장치",
      "부품 종류입니다.",
      "#59c2c9"
    ],
    [
      "⌘",
      "자율주행장치",
      "부품 종류입니다.",
      "#ef97b6"
    ],
    [
      "▥",
      "배터리",
      "부품 종류입니다.",
      "#a9d273"
    ],
    [
      "╫",
      "구동장치",
      "부품 종류입니다.",
      "#dd74a4"
    ],
    [
      "▰",
      "차체",
      "부품 종류입니다.",
      "#e0cd83"
    ],
    [
      "▣",
      "전자장치",
      "부품 종류입니다.",
      "#b8c3c9"
    ],
    [
      "⚙",
      "연구개발팀",
      "자동차 확보·디자인 개량 업무입니다."
    ],
    [
      "▰",
      "조립팀",
      "자동차 생산 업무입니다."
    ],
    [
      "▦",
      "물류팀",
      "부품 주문·획득 업무입니다."
    ],
    [
      "▱",
      "디자인팀",
      "디자인 획득 업무입니다."
    ],
    [
      "▤",
      "관리팀",
      "교육·다른 팀 업무를 수행합니다."
    ],
    [
      "★",
      "점수",
      "최종 승리의 기준이 되는 점수입니다."
    ]
  ],
  "gaia": [
    [
      "●",
      "크레딧",
      "건설과 추가 행동의 화폐입니다.",
      "#e6c466"
    ],
    [
      "⬟",
      "광석",
      "건설·테라포밍 등에 쓰는 자원입니다.",
      "#db9b71"
    ],
    [
      "▰",
      "지식",
      "연구 전진 등에 씁니다.",
      "#8acfe0"
    ],
    [
      "◆",
      "정보 큐브",
      "거리 증가·건설 등 비용에 씁니다.",
      "#96df9d"
    ],
    [
      "◉",
      "파워",
      "I → II → III으로 충전하고 III의 파워를 지불합니다.",
      "#c8a4ed"
    ],
    [
      "●",
      "파워 토큰",
      "파워 구역의 실물 토큰입니다.",
      "#c8a4ed"
    ],
    [
      "★",
      "승점",
      "최종 승리의 기준입니다."
    ],
    [
      "⌂",
      "광산",
      "행성에 처음 건설하는 건물입니다."
    ],
    [
      "▥",
      "무역 스테이션",
      "광산을 업그레이드하는 건물입니다."
    ],
    [
      "⚗",
      "연구실",
      "기술과 지식을 제공하는 건물입니다."
    ],
    [
      "♜",
      "행성 의회",
      "종족 고유 능력을 강화합니다."
    ],
    [
      "♛",
      "아카데미",
      "연구실에서 업그레이드합니다."
    ],
    [
      "⬡",
      "연방·테라포밍",
      "카드·타일의 문구와 색으로 구별합니다."
    ],
    [
      "✧",
      "우주 정거장",
      "잃어버린 함대의 우주 구성물입니다."
    ],
    [
      "⌁",
      "거리",
      "건설·탐사 가능한 거리를 나타냅니다."
    ]
  ],
  "arkham": [
    [
      "◆",
      "의지",
      "능력 테스트와 소모 아이콘입니다."
    ],
    [
      "▣",
      "지식",
      "조사 등에 쓰는 능력입니다."
    ],
    [
      "✦",
      "힘",
      "전투 등에 쓰는 능력입니다."
    ],
    [
      "➤",
      "민첩",
      "회피 등에 쓰는 능력입니다."
    ],
    [
      "✧",
      "만능",
      "어떤 능력 테스트에도 더할 수 있습니다."
    ],
    [
      "➟",
      "행동 기능",
      "보통 행동을 소비하는 기능입니다."
    ],
    [
      "↻",
      "반응 기능",
      "표시된 조건이 발생했을 때 사용합니다."
    ],
    [
      "◇",
      "자유 기능",
      "해당 플레이어 행동 기회에 사용합니다."
    ],
    [
      "★",
      "고대 표식",
      "조사자의 고대 표식 효과를 적용합니다."
    ],
    [
      "☠",
      "자동 실패·해골",
      "자동 실패와 해골은 서로 다른 혼돈 토큰입니다. 토큰 이름도 확인하세요."
    ],
    [
      "◉",
      "추종자",
      "시나리오의 혼돈 토큰 보정·효과를 확인합니다."
    ],
    [
      "▰",
      "석판",
      "시나리오의 혼돈 토큰 효과를 확인합니다."
    ],
    [
      "✺",
      "옛것",
      "시나리오의 혼돈 토큰 효과를 확인합니다."
    ],
    [
      "♜",
      "수호자",
      "카드의 역할군입니다."
    ],
    [
      "▣",
      "탐구자",
      "카드의 역할군입니다."
    ],
    [
      "♠",
      "무법자",
      "카드의 역할군입니다."
    ],
    [
      "✶",
      "신비주의자",
      "카드의 역할군입니다."
    ],
    [
      "♟",
      "생존자",
      "카드의 역할군입니다."
    ]
  ],
  "marvelchampions": [
    [
      "P",
      "물리 자원",
      "카드 비용 지불에 사용합니다.",
      "#eea098",
      "mc"
    ],
    [
      "M",
      "정신 자원",
      "카드 비용 지불에 사용합니다.",
      "#a8c8ef",
      "mc"
    ],
    [
      "E",
      "에너지 자원",
      "카드 비용 지불에 사용합니다.",
      "#f4d881",
      "mc"
    ],
    [
      "W",
      "와일드 자원",
      "필요한 자원 종류로 사용할 수 있습니다.",
      "#9edaaf",
      "mc"
    ],
    [
      "B",
      "강화",
      "빌런·하수인의 이번 활성화 수치를 높입니다.",
      "",
      "mc"
    ],
    [
      "S",
      "별표",
      "카드에 적힌 별표 추가 효과를 확인합니다.",
      "",
      "mc"
    ],
    [
      "G",
      "플레이어당",
      "플레이어 수만큼 해당 수치를 계산합니다.",
      "",
      "mc"
    ],
    [
      "C",
      "위기",
      "이 부가 음모가 있는 동안 주요 음모의 위협을 제거할 수 없습니다.",
      "",
      "mc"
    ],
    [
      "A",
      "가속",
      "주요 음모에 놓는 위협이 증가합니다.",
      "",
      "mc"
    ],
    [
      "H",
      "위험",
      "빌런 단계에 조우 카드를 추가로 나누어 줍니다.",
      "",
      "mc"
    ],
    [
      "F",
      "증폭",
      "강화 아이콘 수에 영향을 줍니다.",
      "",
      "mc"
    ],
    [
      "U",
      "고유",
      "같은 고유 캐릭터의 동시 존재 제한을 확인합니다.",
      "",
      "mc"
    ],
    [
      "D",
      "비용",
      "카드를 플레이하는 자원 비용입니다.",
      "",
      "mc"
    ]
  ],
  "mlem": [
    [
      "♨",
      "가속기",
      "현재 로켓 칸에 표시된 가속기 이동 수를 사용합니다."
    ],
    [
      "☾",
      "위성",
      "선착순 한 명이 내려 즉시 점수를 얻습니다."
    ],
    [
      "◉",
      "행성",
      "배치 인원 순위에 따라 종료 점수를 얻습니다."
    ],
    [
      "✦",
      "심우주",
      "26번 도착 시 사령관·승객 보상을 받습니다."
    ],
    [
      "⚄",
      "주사위",
      "같은 눈을 한 묶음으로 선택합니다."
    ],
    [
      "★",
      "점수",
      "위성·행성·심우주·공통 목표 점수를 합칩니다."
    ]
  ],
  "barcelona": [
    [
      "◉",
      "동전",
      "창고에 보관하는 지불 자원입니다."
    ],
    [
      "▱",
      "천",
      "창고에 보관하는 지불 자원입니다."
    ],
    [
      "▲",
      "노동자층 시민",
      "파란 시민입니다.",
      "#8fc9e5"
    ],
    [
      "■",
      "중산층 시민",
      "분홍 시민입니다.",
      "#eda3bd"
    ],
    [
      "●",
      "상류층 시민",
      "초록 시민입니다.",
      "#9dce9b"
    ],
    [
      "★",
      "승점",
      "최종 승리의 기준입니다."
    ],
    [
      "═",
      "좁은 도로",
      "좁은 도로 건설 행동입니다."
    ],
    [
      "▰",
      "넓은 도로",
      "넓은 도로 건설 행동입니다."
    ],
    [
      "⬡",
      "교차로",
      "교차로 건설과 수입을 나타냅니다."
    ],
    [
      "▦",
      "자갈 타일",
      "보도에 배치하고 창고 공간을 엽니다."
    ],
    [
      "♜",
      "공공시설",
      "공공시설을 건설합니다."
    ],
    [
      "✿",
      "모더니즘 프로젝트",
      "종료 목표 타일을 가져옵니다."
    ],
    [
      "↥",
      "프로젝트 공간 개선",
      "개인판 공간의 최종 점수 배수를 높입니다."
    ],
    [
      "▣",
      "트램",
      "이동·승객 배치를 수행합니다."
    ],
    [
      "☷",
      "세르다",
      "공동 점수 계산에 쓰는 배수 트랙입니다."
    ],
    [
      "B↥",
      "바르셀로나 보행자",
      "그라시아 거리 확장의 B 보행자입니다."
    ],
    [
      "G↧",
      "그라시아 보행자",
      "그라시아 거리 확장의 G 보행자입니다."
    ]
  ]
};
  const aliases={'the-king-is-dead':'tkid','carolus-magnus':'cm','red-cathedral':'redcathedral','andromedas-edge':'andromedasedge','world-order':'worldorder','great-library':'greatlibrary','shackleton-base':'shackleton','white-castle':'whitecastle','kanban-ev':'kanban','gaia-project':'gaia','arkham-horror':'arkham','marvel-champions-mobile':'marvelchampions','stupor-mundi':'stupormundi'};
  const installations=new WeakMap();
  const CSS='[data-rule-icons]{display:block!important;position:static!important;box-sizing:border-box!important;margin:0 0 22px!important;padding:16px!important;border:1px solid #668b95!important;border-radius:12px!important;background:#102d37!important;color:#eff6ed!important;text-align:left!important;font-family:inherit!important;max-width:100%!important;font-size:16px!important;line-height:1.5!important;color-scheme:dark!important;clear:both!important}[data-rule-icons] h3{position:static!important;margin:0 0 8px!important;color:#f7dda6!important;font-size:19px!important;line-height:1.4!important}[data-rule-icons] p{margin:0 0 12px!important;color:#d3e3df!important;font-size:14px!important;line-height:1.6!important}[data-rule-icons] dl{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))!important;gap:10px!important;margin:0!important;padding:0!important}[data-rule-icons] .ri-entry{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;column-gap:10px!important;align-items:start!important;border:1px solid #46646a!important;border-radius:8px!important;padding:10px!important;box-sizing:border-box!important;min-width:0!important;background:#183943!important;color:#f4f6eb!important;position:static!important;overflow-wrap:anywhere!important}[data-rule-icons] dt{display:contents!important}[data-rule-icons] .ri-symbol{grid-column:1!important;grid-row:1/3!important;display:flex!important;position:static!important;align-items:center!important;justify-content:center!important;width:36px!important;height:36px!important;min-width:36px!important;font-size:26px!important;font-style:normal!important;line-height:1!important;color:var(--ri-color,#f2d79f)!important;opacity:1!important}[data-rule-icons] .ri-name{grid-column:2!important;font-size:15px!important;font-weight:700!important;color:#fff8dc!important;line-height:1.4!important}[data-rule-icons] dd{grid-column:2!important;margin:4px 0 0!important;font-size:14px!important;color:#d8e7e4!important;line-height:1.5!important}[data-rule-icons] svg{position:static!important;width:32px!important;height:32px!important;min-height:32px!important;max-width:100%!important;overflow:visible!important;opacity:1!important}[data-rule-icons] .ri-cube{display:block!important;width:22px!important;height:22px!important;background:var(--ri-color,#d0a56a)!important;border:2px solid #f4edcf!important;border-radius:3px!important;box-shadow:inset -4px -4px 0 #0003!important}[data-rule-icons] .ri-diamond{display:block!important;width:21px!important;height:21px!important;background:var(--ri-color,#e0c55a)!important;border:2px solid #fff7db!important;border-radius:3px!important;transform:rotate(45deg)!important}[data-rule-icons] .ri-mc{font-family:mc-icons!important;font-size:28px!important;font-weight:normal!important;font-style:normal!important}';
  function idOf(game){return aliases[game]||game;}
  function createLegend(doc,game){
    const baseEntries=catalog[idOf(game)];if(!baseEntries)return null;
    const entries=baseEntries.slice();let companyUI=null;
    if(idOf(game)==='shackleton'&&doc.defaultView?.ShackletonData?.corporations&&doc.defaultView?.ShackletonBoardUI){
      try{companyUI=doc.defaultView.ShackletonBoardUI({D:doc.defaultView.ShackletonData});}catch(_){}
      if(typeof companyUI?.logo==='function')for(const c of doc.defaultView.ShackletonData.corporations)entries.push([c.id,c.name+' 기업 토큰','크레이터의 같은 모양 기업 토큰과 대응합니다.'+(c.expansion?' 확장 기업입니다.':''),c.color,'company']);
    }
    if(idOf(game)==='mlem'&&doc.defaultView?.MlemData?.astronauts)for(const a of doc.defaultView.MlemData.astronauts)entries.push([a.icon,a.name,a.text]);
    const host=doc.createElement('section');host.setAttribute('data-rule-icons',idOf(game));host.setAttribute('aria-label','아이콘과 의미');
    const title=doc.createElement('h3');title.textContent='아이콘 먼저 보기';host.appendChild(title);
    const intro=doc.createElement('p');intro.textContent='이 게임 화면에서 사용하는 아이콘입니다. 옆 숫자는 개수·점수·이동 칸 수를 뜻합니다. 같은 모양도 색과 표시된 장소에 따라 뜻이 달라질 수 있습니다. 확장 전용 아이콘은 해당 확장을 사용할 때 적용합니다.';host.appendChild(intro);
    const list=doc.createElement('dl');host.appendChild(list);
    for(const [symbol,name,note,color,type] of entries){
      const row=doc.createElement('div');row.className='ri-entry';
      const term=doc.createElement('dt'),icon=doc.createElement('span'),label=doc.createElement('span'),detail=doc.createElement('dd');
      icon.className='ri-symbol';icon.setAttribute('aria-hidden','true');if(color)icon.style.setProperty('--ri-color',color);
      if(type==='cube'||type==='diamond'){const shape=doc.createElement('i');shape.className='ri-'+type;icon.appendChild(shape);}
      else if(type==='company'&&companyUI){icon.innerHTML=companyUI.logo(symbol,28);}
      else if(type==='mc'){const glyph=doc.createElement('i');glyph.className='ri-mc';glyph.textContent=symbol;icon.appendChild(glyph);}
      else if(type==='wc'&&doc.defaultView?.WhiteCastleVisual?.icon){icon.innerHTML=doc.defaultView.WhiteCastleVisual.icon(symbol);}
      else icon.textContent=type==='wc'?name:symbol;
      label.className='ri-name';label.textContent=name;detail.textContent=note;
      term.appendChild(icon);term.appendChild(label);row.appendChild(term);row.appendChild(detail);list.appendChild(row);
    }
    return host;
  }
  const rulesTitle=t=>/규칙|처음 배우|처음 익히|용어 설명|^플레이 안내$/.test(t||'');
  function findTargets(doc,game){
    const result=[];
    const fixed=doc.querySelector('#rules-dialog');
    if(fixed)result.push(fixed.querySelector('.dialog-inner')||fixed);
    const title=doc.querySelector('#panel-title');
    if(title&&rulesTitle(title.textContent)){const content=doc.querySelector('#panel-content');if(content)result.push(content);}
    if(idOf(game)==='arkham')for(const sheet of doc.querySelectorAll('#modal-root .sheet')){
      const heading=sheet.querySelector('.sheet-head h2');if(heading&&rulesTitle(heading.textContent)){const content=sheet.querySelector('.sheet-body');if(content)result.push(content);}
    }
    if(idOf(game)==='marvelchampions')for(const sheet of doc.querySelectorAll('.sheet[role="dialog"]')){
      const heading=sheet.querySelector('h3');if(heading&&rulesTitle(heading.textContent))result.push(sheet);
    }
    return [...new Set(result)];
  }
  function install(doc,game){
    if(!doc||!catalog[idOf(game)])return ()=>{};
    const old=installations.get(doc);if(old){if(old.game===idOf(game))return old.dispose;old.dispose();}
    let disposed=false,scheduled=false;
    function refresh(){
      scheduled=false;if(disposed||!doc.documentElement)return;
      if(!doc.getElementById('rule-icons-style')){const style=doc.createElement('style');style.id='rule-icons-style';style.textContent=CSS;(doc.head||doc.documentElement).appendChild(style);}
      for(const target of findTargets(doc,game)){
        // White Castle already opens with a complete SVG icon dictionary.
        // Keep that richer original reference rather than duplicating it.
        if(idOf(game)==='whitecastle'&&target.querySelector('.icon-reference'))continue;
        const existing=target.querySelector('[data-rule-icons]');if(existing?.getAttribute('data-rule-icons')===idOf(game))continue;if(existing)existing.remove();
        const legend=createLegend(doc,game);
        // Dialog headers and their close controls stay in place; the glossary
        // becomes the first part of the rules, before the original prose.
        if(idOf(game)==='marvelchampions'){
          const heading=target.querySelector('h3');target.insertBefore(legend,heading?heading.nextSibling:target.firstChild);
        }else if(target.closest('#rules-dialog')){
          const heading=target.querySelector('h2');target.insertBefore(legend,heading?heading.nextSibling:target.firstChild);
        }else target.insertBefore(legend,target.firstChild);
      }
    }
    function queueRefresh(){if(disposed||scheduled)return;scheduled=true;const q=doc.defaultView?.queueMicrotask||root.queueMicrotask;if(q)q(refresh);else Promise.resolve().then(refresh);}
    const MO=doc.defaultView?.MutationObserver||root.MutationObserver;
    const observer=MO?new MO(queueRefresh):null;
    if(observer&&doc.documentElement)observer.observe(doc.documentElement,{childList:true,subtree:true,characterData:true});
    function dispose(){if(disposed)return;disposed=true;observer?.disconnect();doc.defaultView?.removeEventListener('pagehide',dispose);installations.delete(doc);}
    installations.set(doc,{game:idOf(game),dispose});doc.defaultView?.addEventListener('pagehide',dispose,{once:true});refresh();return dispose;
  }
  function register(game,entries){if(!Array.isArray(entries)||!entries.length||entries.some(e=>!Array.isArray(e)||e.length<3||!e[0]||!e[1]||!e[2]))throw Error('아이콘 설명 형식을 확인해 주세요.');catalog[idOf(game)]=entries;}
  root.RuleIcons={install,register,catalog,createLegend,findTargets};
  if(typeof module==='object'&&module.exports)module.exports=root.RuleIcons;
})(typeof window!=='undefined'?window:globalThis);
