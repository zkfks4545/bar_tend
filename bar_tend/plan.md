# BarBot — 가상 바텐더 칵테일 대화 웹 게임
## 콘셉트
모던한 분위기의 가상 바텐더 웹 게임. 유저는 바에 들어가 바텐더와 자연어로 대화하며 칵테일을 추천받고, 칵테일에 얽힌 이야기를 듣는다. 엔딩 없이 유저가 원할 때 나갔다가 다시 들어올 수 있다.
---
## 기술 스택
| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router) + TypeScript |
| 스타일링 | Tailwind CSS |
| AI 계층 | Tier 1 규칙 기반 + Tier 2 Ollama + Tier 3 OpenAI (선택) |
| 상태 관리 | React Context (useState) + localStorage |
| 배포 | Vercel + Ollama 별도 서버 (선택) |
---
## 화면 구성
### Outside (가게 밖) — 초기화면
- 비 오는 밤 거리 (CSS 빗줄기 애니메이션)
- 골드 새겨진 "BarBot" 간판 (warm-glow)
- 붉은 벽돌 건물, 가게 문 (🚪)
- "들어가기" 버튼 (fade-in)
- 분위기 텍스트: "문틈으로 재즈 음악과 대화 소리가 새어나온다"
### Inside (가게 안)
- **상단**: ← 나가기 버튼 | BarBot 로고
- **중앙**: 바텐더 스프라이트 (6종 표정) + 카운터 (잔 장식)
- **하단**: 대화창 (타이핑 효과) + 입력창 (자연어 채팅)
---
## 바텐더 스프라이트 시스템
### 6종 표정
| 표정 | 설명 | 트리거 |
|------|------|--------|
| `idle` | 기본 미소, 편안함 | 대기 중 |
| `talk` | 말하는 중 | 메시지 출력 |
| `surprised` | 놀람 | 재미있는 이야기 |
| `smirk` | 의미심장한 미소 | 재치, 폭로 |
| `sympathy` | 공감/위로 | 손님 고민 |
| `thinking` | 고민 중 | 칵테일 추천 고민 |
### 애니메이션
- **idle**: 3초 간격 상하 떨림 (breathing)
- **surprised**: shake 효과
- **talk**: 메시지 출력 중 활성화
- 전환: 0.5s ease-in-out fade
### 스프라이트 직접 제작 가이드
- 파일 형식: PNG (투명 배경)
- 캔버스: 400x600px (세로 전신)
- 저장 경로: `public/sprites/expressions/{name}.png`
- AI 프롬프트 예시:
  ```
  전신 바텐더, 칵테일 바 앞에 서 있음,
  스프라이트 시트 스타일, 투명 배경,
  (표정 설명), 게임 일러스트 스타일, --ar 2:3
  ```
---
## 대화 시스템
### 입력 방식
- 자유 텍스트 입력 (Enter 전송)
- 자연어 그대로 입력 → 키워드 분석 → 응답 생성
- 퀵 선택 버튼 없음, 완전 자유 대화
### 키워드 분석 기반 응답 (Tier 1)
| 키워드 | 표정 | 응답 패턴 |
|--------|------|----------|
| 안녕, 하이, 처음 | talk | "어서오세요!" |
| 우울, 슬퍼, 힘들, 지쳤, 스트레스, 피곤 | sympathy | 공감 + 위로 + 칵테일 추천 |
| 행복, 좋아, 신나, 기분, 축하, 최고 | smirk | 기뻐함 + 축하 칵테일 |
| 추천, 뭐가 좋아, 칵테일, 마실 | talk | 추천 + 칵테일 스토리 |
| 놀라, 대박, 진짜? | surprised | 함께 놀람 |
| 일반 대화 | idle | 바텐더 철학 + 인생 이야기 |
| 나갈게, 갈게, 바이, 끝, 잘 있어, 다음에 | idle | "다음에 또 와요" → outside |
### 칵테일 서빙 플로우
1. 유저 입력 → 키워드 분석
2. 바텐더가 칵테일 추천 멘트
3. 제조 애니메이션 (CSS shake/shaker 효과) — 선택
4. 카운터 위에 칵테일 잔 등장
5. 바텐더가 칵테일의 역사/비화/재미있는 이야기를 들려줌
6. 바텐더가 "한 잔 더 하시겠어요?" 분기 제안
### 분기점
대화 한 사이클이 끝난 후 바텐더가 자연스럽게 제안:
- "한 잔 더 하시겠어요?" → 대화 이어짐
- "오늘은 여기까지 하실래요?" — 또는 유저가 "나갈게" → outside
---
## 칵테일 DB 구조
### 추천 3대 축
```typescript
interface Cocktail {
  id: string;
  name: string;
  // 1. 맛 (Taste)
  taste: {
    sweet: 1-5;
    sour: 1-5;
    bitter: 1-5;
    savory: 1-5;    // 감칠맛/짠맛
    alcohol: 1-5;   // 도수
    carbonated: boolean;
  };
  // 2. 향 (Aroma)
  aroma: string[];  // ["시트러스", "허브", "스모키", "플로럴", "스파이시", "과일", "견과류"]
  // 3. 레시피 (Recipe)
  base: '진' | '보드카' | '럼' | '데킬라' | '위스키' | '브랜디' | '리큐르' | '노알콜';
  ingredients: string[];
  // 대화용 스테이터스 (추천 조건 X)
  image?: string;
  story: string;          // 탄생 비화
  vibe: string;           // 한 줄 분위기
  popCulture?: string;    // 영화/소설 속 등장
  bartenderTip: string;   // 바텐더가 곁들일 한마디
}
```
### 검색 조건 예시
| 유저 입력 | 검색 조건 |
|-----------|----------|
| "달콤한 칵테일" | taste.sweet >= 4 |
| "시트러스 향 나는 거" | aroma.includes("시트러스") |
| "보드카로 만들 수 있는" | base === "보드카" |
| "상쾌한 레몬향" | aroma.includes("시트러스") + taste.sour >= 3 |
| "스모키 위스키" | aroma.includes("스모키") + base === "위스키" |
| "민트 들어간 칵테일" | ingredients.includes("민트") |
| "모히토 주세요" | name.includes("모히토") |
---
## AI 엔진 구조 (Tiered)
```
engine(userInput, history)
  ├── 1. 의도 분류 (키워드 기반)
  │    ├── name-order: 칵테일 이름 직접 주문
  │    ├── taste-query: 맛/향 기반 질문
  │    ├── recipe-query: 재료 기반 질문
  │    ├── mood-talk: 감정/기분 대화
  │    ├── general-chat: 일반 대화
  │    └── exit-intent: 퇴장 의도
  │
  ├── 2. Tier 1 (규칙 기반)
  │    └── keywords.ts 에 정의된 키워드 매칭 → 즉시 응답 + 표정
  │
  ├── 3. Tier 2 (Ollama) — 메인
  │    └── 로컬 LLM (llama3/mistral) 으로 자연어 응답 생성
  │
  └── 4. Tier 3 (OpenAI) — Fallback
       └── Ollama 미연결 시 사용
```
---
## 상태 관리
```typescript
type Expression = 'idle' | 'talk' | 'surprised' | 'smirk' | 'sympathy' | 'thinking';
interface Message {
  id: string;
  role: 'bartender' | 'user';
  text: string;
  cocktail?: Cocktail;
}
interface GameState {
  scene: 'outside' | 'inside';
  messages: Message[];
  expression: Expression;
  isBartenderTyping: boolean;
  isProcessing: boolean;
}
```
---
## 프로젝트 디렉토리 구조
```
barbot/
├── src/
│   ├── app/
│   │   ├── page.tsx              # outside/inside 분기 + 메인 로직
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── globals.css           # 게임 테마 CSS
│   │   └── api/
│   │       └── chat/route.ts     # POST: 키워드 분석 + AI 응답
│   ├── components/
│   │   ├── outside/
│   │   │   └── BarExterior.tsx   # 가게 밖 (분위기/문)
│   │   └── inside/
│   │       ├── BartenderSprite.tsx  # 6표정 + 애니메이션
│   │       ├── BarCounter.tsx       # 카운터 + 잔
│   │       ├── DialogueBox.tsx      # 대화창 (타이핑)
│   │       ├── ChatInput.tsx        # 자연어 입력창
│   │       └── CocktailCard.tsx     # 칵테일 정보 카드
│   └── lib/
│       ├── bartender/
│       │   ├── engine.ts         # 키워드 분석 + AI 라우터
│       │   ├── keywords.ts       # 키워드 → 표정/응답 매핑
│       │   ├── persona.ts        # 바텐더 페르소나
│       │   ├── prompts.ts        # LLM 프롬프트
│       │   ├── ollama.ts         # Ollama 연동
│       │   └── openai.ts         # OpenAI 연동
│       ├── cocktails/
│       │   └── database.ts       # 칵테일 DB (스토리 포함)
│       └── types.ts              # 공통 타입
├── public/
│   └── sprites/                  # 바텐더 스프라이트 PNG
├── .env.local
└── package.json
```
---
## 구현 로드맵 (9단계)
| 단계 | 내용 | 상세 |
|------|------|------|
| **1** ✅ | Next.js + Tailwind + 폴더구조 | 프로젝트 생성 완료 |
| **2** ✅ | 게임 테마 CSS | 다크/웜 글로우/비/페이드인 애니메이션 |
| **3** ✅ | Outside 화면 | BarExterior — 골드 간판, 문, 비 |
| **4** ✅ | Inside 화면 | 스프라이트, 카운터, 대화창, 입력창 |
| **5** ✅ | 전환 + 상태관리 | outside↔inside, 표현식, 메시지 |
| **6** ❌ | 칵테일 DB (30종 + 스토리) | database.ts 작성 |
| **7** ❌ | 키워드 분석 엔진 | keywords.ts + engine.ts Tier 1 |
| **8** ❌ | LLM 연동 | Ollama + OpenAI + persona/prompts |
| **9** ❌ | 칵테일 서빙 UI | CocktailCard + 제조 애니메이션 |
---
## 핵심 규칙
1. **진행바 없음** — 대화는 자연스러운 타이핑 효과만
2. **엔딩 없음** — 유저가 원할 때 나가고 들어오기만 가능
3. **초기화면 = 가게 밖** — 아무 조작 없으면 outside
4. **자연어 채팅** — 퀵버튼 없음, 유저가 직접 입력
5. **칵테일은 서빙될 때** → 카운터에 잔 + 바텐더가 스토리텔링
6. **대화 후 분기** → 바텐더가 "한 잔 더?" 제안 or 유저가 퇴장
7. **칵테일 DB는 3축** (맛, 향, 레시피)으로 검색 가능