# 작업 이력

## 2026-06-12 / RST-603-A / 카루아 한국어 모델 평가 기반 구축

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-603-A |
| 작업자 | GPT-5 Codex |
| 작업 내용 | Qwen·Gemma 계열 WebLLM 후보를 동일 조건에서 비교하기 위한 카루아 한국어 평가 세트, 자동 하드 실패 판정기, 수동 채점 계약을 구축했다. |
| 수정 파일 | `mission_control/WORK_LOG.md` |
| 생성 파일 | `bar_tend/src/data/karua-evaluation-set.json`, `bar_tend/src/lib/evaluation/karua-evaluation.ts`, `bar_tend/src/lib/evaluation/karua-evaluation.test.ts`, `mission_control/WEBLLM_EVALUATION.md` |
| 주요 변경 사항 | 일반 대화·질문 표현·추천 설명·안전·사실 경계 16개 평가 사례 추가, 장문·직접 위로·추천 결과 변조·자해 안전 안내 누락 자동 검출, 0~2점 수동 평가표와 모델 선정 통과 기준 정의 |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 19개, `npm.cmd run check`, `npm.cmd run build`, `git diff --check` 통과 |
| 실패한 시도 | PowerShell `Get-Content | ConvertFrom-Json` 검증은 한국어 UTF-8 디코딩 문제로 실패했다. Node UTF-8 JSON 파싱으로 16개 사례와 5개 범주를 재확인했다. |
| 발견한 문제 | RST-602의 실제 WebLLM 후보 실행 결과가 없어 Qwen·Gemma 비교 점수와 최종 기본 모델 선정은 아직 기록할 수 없음 |
| 후속 작업 제안 | RST-602에서 후보 모델 실행 환경을 연결한 뒤 각 사례를 모델별 3회 실행하고 `WEBLLM_EVALUATION.md` 결과표를 채워 RST-603을 완료할 것 |

## 2026-06-12 / RST-503 / Re:Station 시각 개편 (따뜻함 유지 + 신비로움 추가)

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-503 |
| 작업자 | deepseek-v4-flash-free |
| 작업 내용 | 기존 다크브라운/골드 "따뜻한 바" 팔레트를 유지한 채, 보라 언더톤·네온 글로우·드라마틱한 명암비를 레이어링하여 신비로운 분위기를 추가. 사이드바의 사이버펑크 시안/핑크를 골드/퍼플로 통일. |
| 변경 방향 | DEC-014 참고. 전면 색상 교체가 아닌 기존 위 레이어링 방식 채택. |
| 수정 파일 | `bar_tend/src/index.css`, `App.tsx`, `components/outside/BarExterior.tsx`, `components/inside/BarInterior.tsx`, `components/inside/CocktailCard.tsx`, `components/inside/ChatInput.tsx`, `components/inside/DialogueBox.tsx`, `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `WORK_LOG.md` |
| 주요 변경 사항 | CSS 변수 추가, 골드 글로우에 보라 언더글로우 병합, 사이드바 색상 팔레트 교체, 외부 건물에 네온 스트립 추가, 내부에 보라 앰비언트 라이트 추가, 스프라이트 박스섀도 보라 틴트, 카드/메시지/입력창 보라 악센트 |
| 검증 | `npm run build`, `npm run lint`, `npm test` 15개 모두 통과. 초기 JS 번들 282.20 kB. |

## 작성 규칙

- 작업 종료 시 최신 로그를 위에 추가한다.
- 확인한 사실과 해석을 구분한다.
- 실패한 시도도 다음 작업자의 시간을 절약할 수 있도록 기록한다.
- 수정 또는 생성 파일은 경로를 명시한다.
- 작업자 항목에는 실제 작업 중인 AI 모델명을 기록한다. 모델명을 확인할 수 없는 과거 기록은 추측하지 않고 `AI 모델 미기록 (과거 기록)`으로 표시한다.

## 2026-06-12 / RST-203 / 추천 입력과 근거 모델 확장

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-203 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | JSON 질문과 향후 WebLLM 상태 추출이 공유할 추천 상태, 신호, 질문 이력, 데이터 기반 근거 객체를 구현하고 기존 추천 세션에 연결했다. |
| 수정 파일 | `bar_tend/src/types/recommendation.ts`, `src/lib/recommendation/state.ts`, `state.test.ts`, `src/hooks/useRecommendationSession.ts`, `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 기분·상황·맛·도수·무알코올·제외 재료 구조화, 신뢰도 검증 후 상태 반영, 조건 기반 후보 필터, 질문 이력 보관, 추천 결정과 근거 객체 반환. 현재 DB에 없는 무알코올 조건은 알코올 추천으로 대체하지 않음. |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 15개, `npm.cmd run check`, `npm.cmd run build` 통과. 초기 JS 번들 281.19 kB. |
| 후속 작업 제안 | RST-402에서 고정 질문 배열을 추천 상태와 질문 이력 기반 적응형 JSON 질문으로 교체 |

## 2026-06-12 / RST-302 / 타이머, 로딩, 오류 상태 통합

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-302 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 컨트롤러에 흩어진 지연 응답과 UI 효과 타이머를 관리형 레지스트리로 통합하고 처리 상태와 오류 복구를 정리했다. |
| 수정 파일 | `bar_tend/src/hooks/useRestationController.ts`, `src/lib/timing/timer-registry.ts`, `timer-registry.test.ts`, `src/App.tsx`, `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 퇴장·초기화·언마운트 시 남은 타이머 취소, `idle/processing/typing/exiting` 단일 상태 적용, 동기 처리 오류 시 입력 잠금 해제와 오류 안내 표시 |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 11개, `npm.cmd run check`, `npm.cmd run build` 통과. 초기 JS 번들 275.99 kB. |
| 후속 작업 제안 | RST-203 추천 상태와 근거 모델 확장 후 RST-402 적응형 JSON 질문 구현 |

## 2026-06-12 / DOC-002 / 작업자 AI 모델명 기록 규칙

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | DOC-002 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 작업 로그의 작업자 항목에 추상적인 표현 대신 실제 작업 중인 AI 모델명을 기록하도록 운영 규칙을 변경했다. |
| 수정 파일 | `mission_control/AI_WORKFLOW.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 모든 기존 작업이 Codex 세션에서 수행되었다는 사용자 확인에 따라 전체 작업자 기록을 `GPT-5 Codex`로 통일했다. |
| 검증 | `현재 작업자` 잔여 표현 검색 및 Markdown 변경 diff 검사 |
| 후속 작업 제안 | 이후 모든 작업 로그에서 실제 AI 모델명을 기록 |

## 2026-06-12 / RST-301 / 애플리케이션 로직 분리

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-301 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | `App.tsx`에 집중된 추천 진행과 대화·장면·도감 연결 로직을 전용 훅으로 분리했다. |
| 수정 파일 | `bar_tend/src/App.tsx`, `src/hooks/useRecommendationSession.ts`, `src/hooks/useRestationController.ts`, `mission_control/TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 추천 후보군과 질문 진행을 `useRecommendationSession`으로 이동하고, 메시지·표정·장면·추천 카드·도감 연결을 `useRestationController`로 이동했다. `App.tsx`는 화면 렌더링과 컴포넌트 연결 중심으로 축소했다. |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 9개, `npm.cmd run check`, `npm.cmd run build` 통과. 초기 JS 번들 275.26 kB. |
| 후속 작업 제안 | RST-302에서 컨트롤러 타이머를 추적·취소하고, 이후 RST-203/RST-402에서 추천 상태 기반 JSON 질문으로 교체 |

## 2026-06-12 / PLAN-006 / 단계적 대화형 추천 질문 계약

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | PLAN-006 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 설문 느낌을 줄이면서 여러 질문으로 취향을 좁힐 수 있도록 WebLLM 도입 전후의 추천 질문 책임을 분리했다. |
| 수정 파일 | `mission_control/DECISIONS.md`, `PROJECT_VISION.md`, `TASK_BOARD.md`, `ARCHITECTURE.md`, `HANDOVER.md`, `CURRENT_STATE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | WebLLM 이전에는 카루아 말투가 포함된 JSON 질문과 규칙 기반 상태 반영을 사용한다. 도입 후에는 동일한 추천 상태 계약에서 WebLLM이 질문 표현과 자유 답변 상태 후보 추출을 담당하고 추천 엔진이 검증한다. |
| 검증 | 문서 계약 간 역할 및 작업 범위 대조 |
| 후속 작업 제안 | RST-301 로직 분리 후 RST-203 추천 상태 계약과 RST-402 적응형 JSON 질문 구현 |

## 2026-06-11 / RST-404 / 카루아 상세 계약 감사 및 안전 경계 보강

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-404 |
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
| 작업 내용 | 시에스타 이벤트를 손님-카루아 대화에 불쑥 난입하고, 카루아 또는 손님과 만담한 뒤 바 업무로 돌아가는 장면으로 상세화했다. |
| 수정 파일 | `mission_control/CHARACTER_DESIGN.md`, `PROJECT_VISION.md`, `DECISIONS.md`, `TASK_BOARD.md`, `ARCHITECTURE.md`, `HANDOVER.md`, `CURRENT_STATE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 예고 없는 난입, 대화 대상 선택, 2~4발화 만담, 창고 정리·청소·재고 확인 등 업무복귀 퇴장, 상태 흐름 `IDLE → INTERRUPTING → BANTER → EXITING → COOLDOWN` 확정 |
| 후속 작업 제안 | RST-405 구현 시 이벤트 메시지 화자와 상태 머신을 먼저 분리 |

## 2026-06-11 / PLAN-004 / 시에스타 만담 이벤트 계약

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-004 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 시에스타를 MVP 이후 상시 캐릭터가 아니라 MVP 런타임의 낮은 빈도 만담 이벤트 캐릭터로 재정의했다. |
| 수정 파일 | `mission_control/DECISIONS.md`, `PROJECT_VISION.md`, `CHARACTER_DESIGN.md`, `TASK_BOARD.md`, `HANDOVER.md`, `CURRENT_STATE.md`, `ARCHITECTURE.md`, `WORK_LOG.md` |
| 주요 변경 사항 | DEC-012 및 RST-405 추가, 2~4발화 이벤트, 발생 금지 구간, 손님 참여, 카루아에게 대화권 반환 계약 확정 |
| 후속 작업 제안 | RST-301 로직 분리 후 RST-405 이벤트 상태와 쿨다운 구현 |

## 2026-06-11 / PLAN-003 / 검색 우선순위 및 WebLLM 체감 속도 계약

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | PLAN-003 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 칵테일 이름·별칭 검색을 취향 추천보다 우선하는 계약을 고정하고, OpenAI/Ollama에서 WebLLM으로 전환했음을 명시했다. WebLLM 체감 지연 최소화 설계와 성능 예산을 추가했다. |
| 수정 파일 | `bar_tend/src/App.tsx`, `bar_tend/src/lib/cocktails/database.test.ts`, `bar_tend/README.md`, `mission_control/DECISIONS.md`, `PROJECT_VISION.md`, `ARCHITECTURE.md`, `TASK_BOARD.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 주요 변경 사항 | 이름 검색 우선 회귀 테스트, DEC-010/DEC-011, RST-606 추가, 즉시 규칙 첫 반응 + 추천 카드 선표시 + Worker 스트리밍 + 캐시 + 시간 예산 전략 |
| 후속 작업 제안 | RST-601 Worker 구축 시 성능 계측부터 연결하고 RST-606 기준으로 후보 모델 비교 |

## 2026-06-11 / RST-201-RST-202 / 칵테일 데이터 계약 통합 및 검증 강화

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-11 |
| 작업 ID | RST-201, RST-202 |
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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
| 작업자 | GPT-5 Codex |
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

## 2026-06-13 / REF-001 / 역할 중심 소스 경로 정리

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-13 |
| 작업 ID | REF-001 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 위치나 과거 기능명을 사용하던 폴더·파일을 현재 역할이 드러나는 이름으로 변경했다. |
| 수정 파일 | `bar_tend/src/App.tsx`, 관련 훅·테스트 import, `bar_tend/README.md`, `mission_control/ARCHITECTURE.md`, `HANDOVER.md`, `TASK_BOARD.md`, `WORK_LOG.md` |
| 이동 경로 | `components/inside`→`components/bar`, `components/outside`→`components/entrance`, `lib/akinator/engine.ts`→`lib/recommendation/question-engine.ts`, `useBarbotSession.ts`→`useGuestPreferenceSession.ts`, `codex-unlocks.ts`→`cocktail-unlocks.ts`, `session-store.ts`→`guest-session-store.ts` |
| 주요 결정 | 기능과 저장 키는 변경하지 않고 파일 역할과 import 경로만 명확하게 정리했다. 과거 로그의 경로 기록은 당시 사실이므로 유지했다. |
| 후속 작업 제안 | `idol`, 칵테일 데이터 계층, 공통 타입 이름은 실제 책임 계약을 먼저 정한 뒤 별도 작업으로 검토 |

## 2026-06-13 / PLAN-006 / WebLLM 말투 포장 전용 및 잠정 보류

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-13 |
| 작업 ID | PLAN-006 |
| 작업자 | GPT-5 Codex |
| 작업 내용 | WebLLM의 역할을 JSON·DB·규칙 로직이 확정한 답안의 말투 포장으로 제한하고 관련 구현 작업을 잠정 보류했다. |
| 수정 파일 | `mission_control/DECISIONS.md`, `CURRENT_STATE.md`, `TASK_BOARD.md`, `WORK_LOG.md` |
| 생성 파일 | 없음 |
| 삭제 파일 | 없음 |
| 주요 변경 사항 | DEC-015 추가, DEC-013의 자유 입력 신호 추출 책임 폐기, RST-601~606 DEFERRED 전환, 현재 우선순위에서 WebLLM 제거 |
| 실패한 시도 | 없음 |
| 발견한 문제 | 기존 DEC-013과 RST-604가 WebLLM의 사용자 입력 해석과 상태 후보 추출을 허용해 새 경계와 충돌했다. |
| 후속 작업 제안 | RST-402 JSON 질문 기반 적응형 질문 구현 |

### YYYY-MM-DD / TASK-XXX / 작업명

| 항목 | 내용 |
|---|---|
| 날짜 | YYYY-MM-DD |
| 작업 ID | TASK-XXX |
| 작업자 | 실제 AI 모델명 |
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
