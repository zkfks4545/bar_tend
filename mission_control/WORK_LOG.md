# 작업 이력

## 작성 규칙

- 작업 종료 시 최신 로그를 위에 추가한다.
- 확인한 사실과 해석을 구분한다.
- 실패한 시도도 다음 작업자의 시간을 절약할 수 있도록 기록한다.
- 수정 또는 생성 파일은 경로를 명시한다.

## 2026-06-11 / RST-404 / 카루아 상세 계약 감사 및 안전 경계 보강

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-404 |
| 작업자 | 현재 작업자 |
| 작업 내용 | `CHARACTER_DESIGN.md`의 농담 우선, 의미 비해설, 직접 위로 금지, 음주 해결책 금지, 안전 확인 기준으로 현재 카루아 대사를 감사했다. |
| 수정 파일 | `bar_tend/src/App.tsx`, `src/lib/bartender/engine.ts`, `keywords.ts`, `conversation.ts`, `engine.test.ts`, `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 직접 위로·정답형 감정 대사 수정, 강한 음주 요청에 천천히 마시는 경계 추가, 자해·즉각적 위험 표현을 추천과 농담보다 먼저 처리, 대표 상황 평가 테스트 5개 추가 |
| 금지 패턴 검사 | 직접 위로, 술로 잊기·기분 풀기, 정답 제시, 무책임한 강한 음주 권유 표현을 런타임 대사에서 제거했으며 검색 결과 계약 문서와 테스트 패턴만 남음 |
| 검증 | `npm.cmd test` 9개, `npm.cmd run lint`, `npm.cmd run check`, `npm run build` |
| 후속 작업 제안 | RST-301 `App.tsx` 로직 분리 후 안전 상태와 응답 취소를 RST-302에서 통합 |

## 2026-06-11 / DOC-001 / 전면 리팩토링 계획 및 문서 상태 동기화

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | DOC-001 |
| 작업자 | 현재 작업자 |
| 작업 내용 | `mission_control`에 흩어진 전면 리팩토링 계획을 상위 프로그램으로 묶고 현재 코드 상태와 문서 표현을 동기화했다. |
| 수정 파일 | `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | RST-000 추가, PLAN-003~005와 완료 RST 작업을 완료 표에 반영, 전체·잔여 일정 재산정, Vitest 4개로 동기화, 현재 계획에서 오래된 426개 데이터 표현과 한국어 손상 위험 제거, BAR-001~004 대체 상태 명시 |
| 검증 | 문서 내 오래된 상태 문자열 검색, Markdown 변경 diff 및 공백 오류 검사, `npm.cmd test` 4개 통과 |
| 후속 작업 제안 | RST-404 상세 카루아 계약 적합성 감사 후 RST-301 애플리케이션 로직 분리 |

## 2026-06-11 / PLAN-005 / 시에스타 난입 및 업무복귀 장면 문법

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-005 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 시에스타 이벤트를 손님-카루아 대화에 불쑥 난입하고, 카루아 또는 손님과 만담한 뒤 바 업무로 돌아가는 장면으로 상세화했다. |
| 수정 파일 | `mission_control/CHARACTER_DESIGN.md`, `PROJECT_VISION.md`, `DECISIONS.md`, `TASK_BOARD.md`, `ARCHITECTURE.md`, `HANDOVER.md`, `CURRENT_STATE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 예고 없는 난입, 대화 대상 선택, 2~4발화 만담, 창고 정리·청소·재고 확인 등 업무복귀 퇴장, 상태 흐름 `IDLE → INTERRUPTING → BANTER → EXITING → COOLDOWN` 확정 |
| 후속 작업 제안 | RST-405 구현 시 이벤트 메시지 화자와 상태 머신을 먼저 분리 |

## 2026-06-11 / PLAN-004 / 시에스타 만담 이벤트 계약

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-004 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 시에스타를 MVP 이후 상시 캐릭터가 아니라 MVP 런타임의 낮은 빈도 만담 이벤트 캐릭터로 재정의했다. |
| 수정 파일 | `mission_control/DECISIONS.md`, `PROJECT_VISION.md`, `CHARACTER_DESIGN.md`, `TASK_BOARD.md`, `HANDOVER.md`, `CURRENT_STATE.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | DEC-012 및 RST-405 추가, 2~4발화 이벤트, 발생 금지 구간, 손님 참여, 카루아에게 대화권 반환 계약 확정 |
| 후속 작업 제안 | RST-301 로직 분리 후 RST-405 이벤트 상태와 쿨다운 구현 |

## 2026-06-11 / PLAN-003 / 검색 우선순위 및 WebLLM 체감 속도 계약

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-003 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 칵테일 이름·별칭 검색을 취향 추천보다 우선하는 계약을 고정하고, OpenAI/Ollama에서 WebLLM으로 전환했음을 명시했다. WebLLM 체감 지연 최소화 설계와 성능 예산을 추가했다. |
| 수정 파일 | `bar_tend/src/App.tsx`, `bar_tend/src/lib/cocktails/database.test.ts`, `bar_tend/README.md`, `mission_control/DECISIONS.md`, `PROJECT_VISION.md`, `ARCHITECTURE.md`, `TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 이름 검색 우선 회귀 테스트, DEC-010/DEC-011, RST-606 추가, 즉시 규칙 첫 반응 + 추천 카드 선표시 + Worker 스트리밍 + 캐시 + 시간 예산 전략 |
| 후속 작업 제안 | RST-601 Worker 구축 시 성능 계측부터 연결하고 RST-606 기준으로 후보 모델 비교 |

## 2026-06-11 / RST-201-RST-202 / 칵테일 데이터 계약 통합 및 검증 강화

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-201, RST-202 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 추천과 UI가 단일 `CocktailData` 컬렉션을 사용하도록 통합하고, 명시적 이름 검색과 추천 의도 판정을 분리했다. 타입 검사 포함 빌드와 Vitest 회귀 테스트를 추가했다. |
| 수정 파일 | `bar_tend/src/types.ts`, `src/lib/cocktails/database.ts`, `src/lib/akinator/engine.ts`, `src/App.tsx`, 칵테일 UI 컴포넌트, `package.json`, `README.md`, `mission_control/*` |
| 생성 파일 | `bar_tend/src/lib/cocktails/database.test.ts` |
| 삭제 파일 | 미사용 `openai.ts`, `ollama.ts`, `api-cocktails.ts` |
| 주요 변경 사항 | 공개 `toLegacyCocktail()` 계층 제거, 취향 표현의 명시적 검색 오인 방지, 빌드에 `tsc --noEmit` 포함, 초기 JS 번들 593.65 kB에서 276.06 kB로 감소 |
| 검증 | `npm.cmd run lint`, `npm.cmd run check`, `npm.cmd test` 3개, `npm run build` 통과 |
| 후속 작업 제안 | RST-404 캐릭터 계약 감사, RST-301 `App.tsx` 로직 분리, 저장 및 사용자 흐름 테스트 확대 |

## 2026-06-11 / PLAN-002 / 캐릭터 대화 설계 계약 반영

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-002 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 시에스타와 카루아의 성격, 발화 알고리즘, 금지 패턴, 관계성, 생성 및 검수 기준을 설계에 반영 |
| 수정 파일 | `mission_control/PROJECT_VISION.md`, `DECISIONS.md`, `TASK_BOARD.md`, `ARCHITECTURE.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 생성 파일 | `mission_control/CHARACTER_DESIGN.md` |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | 카루아 MVP 범위를 유지하면서 시에스타 설계를 확장 계약으로 보존하고, RST-401 결과를 상세 계약으로 감사할 RST-404 추가 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 기존 카루아 계약은 방향은 맞지만 농담 우선, 의미 비해설, 안전 확인 순서에 대한 검수 기준이 부족했음 |
| 후속 작업 제안 | 데이터 모델 통합 일정과 별개로 RST-404를 WebLLM 평가 전에 완료 |

## 2026-06-11 / RST-101-1 / 한국어 문자열 손상 전수 조사

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-101-1 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 프로젝트 전체 38개 소스 파일의 한국어 문자열 손상 여부를 전수 조사함 |
| 조사 대상 | `src/` 전체 — UI 컴포넌트(TSX) 8개, bartender 엔진 5개, akinator 엔진 1개, idol 시스템 1개, 데이터 파일 3개, 저장소 모듈 2개, 훅 1개, 타입 3개, HTML 1개 |
| 확인 방법 | 각 파일 직접 읽기(Read) 및 정규식 기반 패턴 검색 |
| 조사 결과 | **한국어 문자열 손상 없음.** 모든 한국어 텍스트(키워드 정규식 40+, 대화 응답 50+, UI 라벨 10+, 칵테일 데이터 20+, API 생성 데이터 420+)가 정상 UTF-8 인코딩으로 유지됨 |
| 수정 파일 | `mission_control/WORK_LOG.md`, `CURRENT_STATE.md`, `TASK_BOARD.md`, `HANDOVER.md` |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | ISSUE-001의 "다수 한국어 문자열 손상"은 MC-001 당시 PowerShell 디코딩 표시 문제로 오인된 것으로 확인됨. Node.js 기반 빌드/런타임에서는 정상 동작함 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 한국어 인코딩은 정상이나, 대화 응답 문자열이 구 BarBot/범용 바텐더 페르소나를 따르고 있어 카루아 캐릭터 계약(반존대, 능청, 환기)과 불일치함. 이는 RST-401에서 별도 처리 필요 |
| 후속 작업 제안 | RST-102 (BarBot→Re:Station 브랜드 교체)를 즉시 수행. 이후 RST-401 (카루아 규칙 응답 엔진)으로 이어짐 |

### 검증 결과

| 검증 | 결과 |
|---|---|
| `bartender/keywords.ts` 71줄 한글 | 정상 |
| `bartender/conversation.ts` 178줄 한글 | 정상 |
| `bartender/engine.ts` 한글 정규식 | 정상 |
| `akinator/engine.ts` 한글 문답/정규식 | 정상 |
| `idol/memory.ts` 한글 감정/주제 정규식 | 정상 |
| `App.tsx` 한글 메시지/UI | 정상 |
| `components/` 6개 파일 한글 UI | 정상 |
| `data/cocktail-db.json` 한글 필드 | 정상 |
| `cocktails/database.ts` 한글 데이터 | 정상 |
| `cocktails/api-cocktails.ts` 426개 한글 데이터 | 정상 |
| `cocktails/api.ts` 한글 번역 맵 | 정상 |

## 2026-06-11 / RST-401 / 카루아 규칙 기반 대화 응답 엔진

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-401 |
| 작업자 | 현재 작업자 |
| 작업 내용 | keywords.ts, conversation.ts, akinator/engine.ts, App.tsx의 모든 대화 응답/질문 문자열을 카루아 페르소나(반존대, 능청, 환기, 짧은 응답)로 재작성 |
| 수정 파일 | `keywords.ts` (12개 규칙 응답), `conversation.ts` (감정/취향/일반 응답 30+개), `akinator/engine.ts` (질문/선택지/컨텍스트 문자열), `App.tsx` (환영/작별/리셋/추천 메시지) |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | keywords.ts 모든 응답을 BarBot 공감형에서 카루아 농담/능청형으로 교체. conversation.ts SAD/HAPPY/TASTE/GENERAL 응답을 위로/조언에서 환기/농담으로 전환. akinator 질문 문구를 격식체에서 반존대/가벼운 말투로 변경. App.tsx 환영/작별 메시지 카루아 스타일 적용 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 없음 |
| 후속 작업 제안 | RST-402 (기분/상황/취향 추출 고도화) — 현재 akinator가 기분 태그 기반 필터링은 없음. 또는 RST-201 (데이터 모델 단일화) |

### 검증 결과

| 검증 | 결과 |
|---|---|
| `npm.cmd run lint` | 통과 |
| `npm run build` | 통과 (JS 번들 593.64 kB 경고 — 기존 ISSUE-005) |
| keywords.ts 12개 규칙 | 카루아 말투 적용 완료 |
| conversation.ts 응답 템플릿 | 카루아 말투 적용 완료 |
| akinator/engine.ts 질문 | 가벼운 반존대 말투 적용 완료 |
| App.tsx 메시지 | 카루아 스타일 적용 완료 |

## 2026-06-11 / RST-102 / BarBot → Re:Station 브랜드 교체

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-102 |
| 작업자 | 현재 작업자 |
| 작업 내용 | BarBot 브랜드명 및 CSS 클래스, localStorage 키를 Re:Station으로 교체 |
| 수정 파일 | `index.html`, `src/App.tsx` (브랜드명 + CSS 클래스 4종), `src/components/sidebar/Sidebar.tsx` (CSS 클래스), `src/index.css` (CSS 클래스 5종), `src/lib/bartender/persona.ts` (페르소나 전체), `src/lib/storage/session-store.ts` (키 + 마이그레이션), `src/lib/storage/codex-unlocks.ts` (키 + 마이그레이션) |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | `<title>` → Re:Station, 헤더 BarBot → Re:Station, CSS `.barbot-*` → `.restation-*`, 페르소나 전체를 BarBot 베테랑 바텐더에서 카루아 알바생으로 교체, localStorage 키 마이그레이션 로직 추가 (이전 `barbot_*` 데이터 → 새 `restation_*` 키) |
| 실패한 시도 | 없음 |
| 발견한 문제 | 기존 번들 크기 경고 593.61 kB (ISSUE-005, 기존 이슈) |
| 후속 작업 제안 | RST-401 카루아 규칙 응답 엔진 — keywords.ts, conversation.ts의 대화 응답을 카루아 페르소나에 맞게 재작성 |

### 검증 결과

| 검증 | 결과 |
|---|---|
| `npm.cmd run lint` | 통과 |
| `npm run build` | 통과 (JS 번들 593.61 kB 경고 — 기존) |
| `barbot` 잔여 참조 | 마이그레이션용 이전 키 상수 2개만 남음 (정상) |

## 2026-06-11 / PLAN-001 / Re:Station MVP 통합 계획 확정

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-001 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 신규 카루아 MVP 프롬프트, 기존 리빌딩 계획, WebLLM 방향을 하나의 실행 계획으로 통합 |
| 수정 파일 | `mission_control/PROJECT_VISION.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `TASK_BOARD.md`, `HANDOVER.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | 카루아 단일 캐릭터 MVP, DB 기반 추천, WebLLM 표현 계층, Qwen 및 Gemma 평가, 단계별 작업과 견적 확정 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 기존 계획에 시에스타, 웰컴 드링크, 세계관 확장이 MVP 범위로 포함되어 있어 범위가 과도했음 |
| 후속 작업 제안 | `RST-101`부터 순서대로 수행 |

## 2026-06-11 / MC-001 / mission_control 초기화

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | MC-001 |
| 작업자 | 현재 작업자 |
| 작업 내용 | 프로젝트를 분석하고 교체 가능한 작업자를 위한 중앙 운영 문서 체계를 생성함 |
| 수정 파일 | 없음 |
| 생성 파일 | `mission_control/AI_WORKFLOW.md`, `CURRENT_STATE.md`, `PROJECT_VISION.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TASK_BOARD.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | 실제 BarBot 구조, 현재 상태, 위험, 우선순위, 작업 절차를 문서화함 |
| 실패한 시도 | PowerShell의 `npm run lint`가 실행 정책으로 차단됨. `npm.cmd run lint`로 재실행하여 통과함. PowerShell JSON 변환은 문자 디코딩 문제로 실패했으나 Node의 UTF-8 JSON 파싱은 성공함. |
| 발견한 문제 | 다수 한국어 문자열 손상, 자동 테스트 미확인, 초기 JS 번들 크기 경고, 일부 외부 연동 모듈 미연결 |
| 후속 작업 제안 | `BAR-001`, `BAR-002`, `BAR-003`, `BAR-004` 순서 검토 |

### 검증 결과

| 검증 | 결과 |
|---|---|
| `npm.cmd run lint` | 통과 |
| `npm run build` | 통과, JS 번들 593.32 kB 경고 |
| `src/data/cocktail-db.json` UTF-8 JSON 파싱 | 통과, 칵테일 7개와 제휴 바 2개 확인 |
| 요청 문서 8개 존재 확인 | 완료 |

## 새 로그 템플릿

### YYYY-MM-DD / TASK-XXX / 작업명

| 항목 | 내용 |
|---|---|
| 날짜 | YYYY-MM-DD |
| 작업 ID | TASK-XXX |
| 작업자 | 작성 필요 |
| 작업 내용 | 작성 필요 |
| 수정 파일 | 없음 |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | 작성 필요 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 없음 |
| 후속 작업 제안 | 작성 필요 |

### 로그 완료 체크리스트

- [ ] 작업 ID와 날짜가 있다.
- [ ] 변경 파일 목록이 실제 변경과 일치한다.
- [ ] 주요 변경과 검증 결과가 기록되어 있다.
- [ ] 실패한 시도와 발견한 문제가 숨겨져 있지 않다.
- [ ] 후속 작업이 필요하면 작업 보드에 연결했다.
