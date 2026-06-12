# Re:Station

카루아와 대화하며 취향에 맞는 칵테일을 추천받는 브라우저 기반 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run lint
npm run check
npm test
npm run build
```

`npm run build`는 TypeScript 검사를 먼저 실행한 뒤 프로덕션 번들을 생성합니다.

## 구조

- `src/lib/cocktails/database.ts`: 단일 `CocktailData` 컬렉션과 검색
- `src/lib/recommendation/question-engine.ts`: 규칙 기반 추천 질문, 후보 필터링과 선택
- `src/lib/bartender/`: 카루아 규칙 기반 대화
- `src/components/`: 바 화면, 추천 카드, 사이드바
- `src/lib/storage/`: 세션 취향과 도감 저장

추천 결과는 DB와 규칙 엔진이 결정합니다. 생성형 대화는 향후 Web Worker 기반 WebLLM 표현 계층으로 연결합니다.

등록된 칵테일 이름 또는 별칭이 입력에 있으면 취향 기반 추천보다 우선합니다. 생성형 표현 계층은 OpenAI/Ollama가 아닌 WebLLM을 기준으로 하며, 즉시 규칙 반응과 스트리밍으로 체감 지연을 줄입니다.
