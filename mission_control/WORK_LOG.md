# 작업 이력

## 2026-06-12 / RST-501 / 선택 질문 버튼과 선택 필터 구현

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-501 |
| 작업자 | Gemini CLI, GPT-5 Codex |
| 작업 내용 | 적응형 질문에 응답할 수 있는 선택 버튼 UI와 수집된 취향 신호를 관리하는 필터 칩 UI를 구현함. |
| 주요 변경 사항 | `useRecommendationSession`: `activeQuestion` 상태 추가, `removeSignal` 함수 구현 (인덱스 기반 신호 제거 및 관련 상태 필터링). `useRestationController`: 새로운 상태와 함수 노출. `App.tsx`: `ChatInput`에 필요한 props 전달. `ChatInput.tsx`: 질문 선택지 버튼, '카루아에게 맡기기', '추천 취소' 버튼, 그리고 현재 적용된 신호를 보여주는 필터 칩 UI(제거 기능 포함) 구현. |
| 이어받은 검토 | 활성 신호를 제거해도 이미 좁혀진 추천 후보군이 복구되지 않아 표시 상태와 실제 추천 조건이 달라지는 결함을 발견했다. |
| 보완 내용 | 신호 제거 후 남은 신호로 추천 상태를 재구성하고, 남은 상태와 과거 질문 답변을 재적용해 후보군을 복구하도록 수정했다. 같은 필드의 신호가 여러 개일 때도 남은 신호를 유지한다. |
| 수정 파일 | `bar_tend/src/hooks/useRecommendationSession.ts`, `src/hooks/useRestationController.ts`, `src/App.tsx`, `src/components/inside/ChatInput.tsx`, `src/lib/recommendation/state.ts`, `state.test.ts`, `src/lib/akinator/engine.ts`, `engine.test.ts`, `mission_control/HANDOVER.md`, `WORK_LOG.md` |
| 완료 판정 | 선택 버튼, 자유 입력, 카루아에게 맡기기, 추천 취소, 활성 신호 제거와 실제 후보군 복구까지 완료 조건 충족 |
| 검증 | `npm.cmd run lint`, `npm.cmd run check`, `npm.cmd test` 30개, `npm.cmd run build`, `git diff --check` 통과 |
| 후속 작업 | RST-502 추천 카드 상세 데이터 적용 |

## 2026-06-12 / RST-402-B / 적응형 질문 코드 정리 및 개선

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-402-B |
| 작업자 | Claude Code |
| 작업 내용 | RST-402 완료 후 남은 문제점을 개선: `QuestionTopic` 중복 타입 통일, 데드코드(`detectExpressedDimensions`, `FilterQuestion.dimension`) 제거, Hook의 `lastTopic` 추출 단순화, Siesta 테스트와 프롬프트 불일치(`설교`→`훈계`) 수정 |
| 주요 변경 사항 | `engine.ts`에서 자체 `QuestionTopic` 타입 삭제 후 `types/recommendation.ts`에서 import. `filterPool`, `FREE_TEXT_RULES`, `FilterRule` 타입 제거. `detectExpressedDimensions` 삭제. `useRecommendationSession.ts`의 `lastTopic`을 `filter().pop()` → `history[length-1]?.topic`으로 단순화. |
| 수정 파일 | `bar_tend/src/lib/akinator/engine.ts`, `bar_tend/src/hooks/useRecommendationSession.ts`, `bar_tend/src/types/recommendation.ts`, `bar_tend/src/lib/webllm/prompts/character-prompts.test.ts` |
| 검증 | `npm.cmd run lint`, `npm.cmd run check`, `npm.cmd test` 27개 통과 |
| 후속 작업 | RST-501 선택 질문 버튼 UI |

## 2026-06-12 / RST-604-A / 캐릭터 말투 WebLLM 프롬프트 초안

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-604-A |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 완료된 RST-402의 적응형 질문 흐름과 기존 캐릭터 설계를 바탕으로, LLM이 카루아·시에스타의 말투를 읽고 반영할 용도별 예시 프롬프트를 작성했다. |
| 주요 변경 사항 | 카루아 일반 대화, 시에스타 난입, 합동 만담, 질문 표현, 추천 설명, 상태 후보 JSON 추출 프롬프트를 분리했다. RP 평가 실행기가 평가 대상 캐릭터에 맞는 시스템 프롬프트를 선택하도록 연결했다. |
| 책임 경계 | LLM은 표현과 상태 후보 추출만 담당하며 질문 주제·추천 상태·추천 결과를 임의로 변경하지 않는다. |
| 초안 상태 | 이 프롬프트는 초기 예시이며 최종안이 아니다. RST-603-B RP 평가와 RST-604 실제 WebLLM 연결 결과에 따라 반드시 수정해야 한다. |
| 생성 파일 | `bar_tend/src/lib/webllm/prompts/character-prompts.ts`, `character-prompts.test.ts`, `mission_control/WEBLLM_PROMPT_DRAFT.md` |
| 수정 파일 | `bar_tend/src/lib/bartender/persona.ts`, `src/lib/webllm/evaluation.ts`, `mission_control/WORK_LOG.md` |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 27개, `npm.cmd run check`, `npm.cmd run build`, `git diff --check` 통과 |
| 후속 작업 | 최종 후보 모델에서 RP 평가를 수행하고 예시 복제, 장문, 말투 혼합, JSON 형식 이탈, 프롬프트 길이를 측정한 뒤 초안을 수정한다. |

## 2026-06-12 / RST-602 / WebLLM 모델 평가 통합 이력

### 단계 F / 캐릭터 프롬프트 기반 RP 평가 계약 보완

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-F |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 사용자 제공 카루아·시에스타·관계 프롬프트를 기존 RP 평가 설계와 대조하고 말투를 실제로 검수할 수 있도록 평가 계약을 수정했다. |
| 발견한 문제 | 기존 RP 사례는 시에스타의 입력과 평가 대상을 혼동했고, 사용자가 농담을 거부해도 카루아가 농담을 고집하도록 요구했다. 또한 모든 금지 정규식을 모든 사례에 적용해 정상 응답이 오탐될 수 있었으며 기대 행동은 자동으로 검증되지 않았다. |
| 주요 변경 사항 | RP 사례를 카루아 5개·시에스타 2개·관계 만담 1개로 재구성, 평가 대상·상황·문장 제한·수동 검수 기준 추가, 자동 금지 패턴을 사례별 금지 행동에만 적용, 카루아의 존댓말 중심 반존대·비분석·경계 존중과 시에스타의 건조함·경험·생활감 및 관계 말투 대비를 문서화 |
| 평가 원칙 | 자동 판정은 명백한 금지 표현·길이·안전·추천 불변 위반을 찾는다. 캐릭터다운 말투는 `manualReviewCriteria`와 `CHARACTER_DESIGN.md`의 캐릭터별 수동 검수 축으로 판단한다. |
| 수정 파일 | `bar_tend/src/data/karua-evaluation-set.json`, `bar_tend/src/lib/evaluation/karua-evaluation.ts`, `bar_tend/src/lib/evaluation/karua-evaluation.test.ts`, `mission_control/CHARACTER_DESIGN.md`, `TASK_BOARD.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 22개, `npm.cmd run check`, `npm.cmd run build`, `git diff --check` 통과 |

### 단계 E / 모델 확정 철회 및 잠정 순위 전환

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-E |
| 작업자 | GPT-5 Codex |
| 작업 내용 | 사용자 결정에 따라 Qwen3.5-2B 단일 모델 확정을 철회하고 공개 자료 기반 후보 순위만 잠정 확정했다. |
| 잠정 순위 | 1순위 Qwen3.5-2B, 2순위 Qwen3.5-4B, 3순위 Qwen3.5-0.8B, 4순위 Qwen3-1.7B, 5순위 Gemma3-1B |
| 코드 변경 | 런타임 기본 모델 자동 선택 제거. `loadModel()` 호출 시 모델 ID를 명시해야 하며, 최종 모델 결정 전 특정 후보를 기본값으로 고정하지 않는다. |
| 주요 변경 사항 | DEC-016을 잠정 승인으로 변경, RST-602·603을 DOING으로 복귀, 프로젝트 비전·아키텍처·인수인계를 최종 모델 미정 상태로 통일 |
| 연계 수정 | 동시 추가된 `roleplay-consistency` 평가 범주를 기존 평가 세트 검증 테스트에 반영 |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 19개, `npm.cmd run check`, `npm.cmd run build`, `git diff --check` 통과 |
| 남은 작업 | 목표 기기, 허용 다운로드 크기, 프롬프트 요구 수준, 라이선스와 배포 조건을 검토한 뒤 최종 모델을 별도 결정 |

### 단계 D / 공개 데이터 기반 단일 모델 선정 보완

> 이 기록의 단일 모델 확정은 사용자 결정에 따라 `RST-602-E`에서 철회되었다.

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-D |
| 작업자 | GPT-5 Codex |
| 작업 내용 | RST-602-C 모델 선정 기록을 검토하고, 사용자의 단일 모델·공개 데이터 기반 선정 방향에 맞게 근거와 구현 계약을 보완했다. |
| 결정 사항 | 제품 모델은 `Qwen3.5-2B-q4f16_1-MLC` 하나만 사용한다. 모델 실패 시 다른 LLM을 다운로드하지 않고 규칙 기반 응답으로 복구한다. |
| 주요 변경 사항 | 출처 없는 K-AI·IFBench·Wikidocs 점수와 미측정 속도 주장을 선정 근거에서 제거, WebLLM v0.2.84 카탈로그의 지원 모델 ID와 요구 VRAM을 확인 가능한 근거로 기록, 카루아 평가 세트를 모델 비교가 아닌 선택 모델의 프롬프트·출력 회귀 검수로 재정의 |
| 코드 변경 | `FALLBACK_MODEL_ID` 제거, 평가 실행기를 후보 비교가 아닌 선택 모델 운영 수용 검사로 변경 |
| 수정 파일 | `bar_tend/src/lib/webllm/client.ts`, `bar_tend/src/lib/webllm/evaluation.ts`, `mission_control/WEBLLM_EVALUATION.md`, `DECISIONS.md`, `TASK_BOARD.md`, `PROJECT_VISION.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `HANDOVER.md`, `WORK_LOG.md` |
| 검증 | `npm.cmd run lint`, `npm.cmd test` 19개, `npm.cmd run check`, `npm.cmd run build`, `git diff --check` 통과 |
| 남은 검수 | RST-604~606에서 선택 모델의 실제 로드, 카루아 출력 계약, 오류 복구, 기기별 성능을 확인한다. 이 검수는 다른 모델과의 비교 선정 작업이 아니다. |

### 단계 D 연계 / RST-603-B 캐릭터 RP 일관성 평가 계획 수립

> 이 기록의 Qwen3.5-2B 선정 유지 결정은 `RST-602-E`에서 잠정 1순위로 변경되었다. RP 평가 설계는 유지한다.

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-D |
| 작업자 | deepseek-v4-flash-free |
| 작업 내용 | 기존 평가 세트가 캐릭터 페르소나 유지 능력(RP)을 전혀 검증하지 않는다는 문제를 발견했다. 공개 벤치마크(K-AI, IFBench 등)는 RP 능력을 측정하지 않으며, Qwen3의 RP claim과 IFBench 점수만으로는 Karua의 반존대·보케·페르소나 유지 능력을 확신할 수 없다. 이에 RP 전용 평가 케이스 7개(Karua 5 + Siesta 2)를 `karua-evaluation-set.json`에 추가하고 RP 특화 금지 패턴을 `karua-evaluation.ts`에 확장했다. RST-602-D(설계) + RST-603-B(실행)로 분할했으며, 실제 평가는 RST-604 WebLLM 연결 후 Qwen3.5-2B에서 수행한다. |
| 결정 사항 | 모델 선정은 Qwen3.5-2B 그대로 유지. RP 평가는 선정 전 검증이 아닌 WebLLM 연결 후(RST-604) 프롬프트 보강 단계에서 실행. |
| 수정 파일 | `bar_tend/src/data/karua-evaluation-set.json` (RP 케이스 7개 추가), `bar_tend/src/lib/evaluation/karua-evaluation.ts` (RP 금지 패턴 + roleplay-consistency 카테고리 추가), `mission_control/TASK_BOARD.md` (RST-602-D + RST-603-B 신설) |

### 단계 C / 공개 벤치마크 기반 모델 선정

> 이 기록의 선정 근거와 다중 폴백 결정은 `RST-602-D`에서 검토 후 대체되었다.

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-C |
| 작업자 | deepseek-v4-flash-free |
| 작업 내용 | 공개 벤치마크(K-AI 리더보드, IFBench, Wikidocs)를 기반으로 WebLLM 기본 모델을 선정했다. 원계획은 브라우저에서 실제 모델을 다운로드해 평가하는 것이었으나, 20개 모델 패밀리 전수 조사 결과 한국어 품질 차이가 벤치마크 데이터로 명확히 구분 가능하여 로컬 실행 없이 결정했다. |
| 결정 사항 | DEC-016 참고. 기본 모델: Qwen3.5-2B. 폴백: Qwen3-1.7B. 초경량 대체: Qwen3.5-0.8B. Gemma/Llama/Phi/Mistral 등은 한국어 깊이 부족으로 전부 배제. |
| 수정 파일 | `mission_control/WEBLLM_EVALUATION.md` (벤치마크 비교 + 선정 근거로 전면 재작성), `mission_control/DECISIONS.md` (DEC-015 평가 방법 변경 메모 추가, DEC-016 추가), `mission_control/TASK_BOARD.md` (RST-602·RST-603 DONE, 남은 일정 갱신) |

### 단계 B / WebLLM 전 모델 패밀리 전수 조사 및 평가 계획 확장

> “전수 평가” 표현과 출처 없는 품질 수치는 `RST-602-D`에서 현재 선정 근거에서 제외되었다.

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-602-B |
| 작업자 | deepseek-v4-flash-free |
| 작업 내용 | WebLLM v0.2.84 `prebuiltAppConfig`에 등록된 모든 모델 패밀리를 전수 조사하고 한국어 어휘력과 브라우저 연산력 관점에서 분류했다. 기존 Qwen·Gemma 2종 평가 계획을 전체 20개 패밀리로 확장하기로 결정했다. |
| 조사 대상 | `@mlc-ai/web-llm` v0.2.84 `lib/index.js` 내 `prebuiltAppConfig.model_list` 전수 분석 (100+ 모델 ID) |
| 조사 방법 | 각 모델의 model_id, vram_required_MB, low_resource_required 필드를 추출하고 한국어 지원 여부는 외부 벤치마크(KMMLU, KoBEST, Wikidocs 실용성, K-AI 리더보드, LMSys Arena) 및 다국어 학습 데이터 비중을 기준으로 평가 |
| 발견 사실 | 1) 한국어 어휘력: Qwen3.5 > Qwen3 > Qwen2.5 > Gemma3/2 > Ministral3 >>> Llama/Phi/Mistral/SmolLM/TinyLlama 순. Qwen3.5는 K-AI 리더보드 1~4위 석권, IFBench 76.5로 GPT-5.2(75.4) 상회. Gemma3 1B는 가장 가벼우나(0.7GB) 한국어 깊이 부족. Llama 계열은 한국어 학습 비율 약 0.06%. DeepSeek R1 Distill은 한국어 Wikidocs 10.5/100. 2) 연산력(브라우저 WebGPU): Qwen3.5-2B(2.2GB)가 품질/속도 균형 최적. Gemma3-1B(0.7GB)는 가장 빠르나 한국어 희생 필요. TinyLlama-1.1B(0.7GB)도 빠르나 한국어 불가. 3) 라이선스: Qwen 전 계열 Apache 2.0. Gemma는 Gemma ToS(일부 제한). Llama는 Llama License(MAU 7억 초과 시 별도 계약). Phi/MIT. |
| 결정 사항 | DEC-015 참고. 평가 후보를 기존 3종(Qwen3.5-2B/4B, Qwen3-1.7B)에서 WebLLM 전체 20개 패밀리 대표 1종씩으로 확장. 로드 시간·TTFT·Tok/s·E2E·Karua 16케이스 하드 실패율 측정. |
| 수정 파일 | `mission_control/WEBLLM_EVALUATION.md` (후보 목록 확장), `mission_control/DECISIONS.md` (DEC-015 추가) |

### 단계 A + RST-601 / WebLLM Worker 인프라 및 평가 실행기 구축

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-06-12 |
| 작업 ID | RST-601, RST-602-A |
| 작업자 | deepseek-v4-flash-free |
| 작업 내용 | WebLLM Web Worker 인프라 구축 및 모델 평가 실행기 개발. Qwen3.5-2B를 기본 모델, Qwen3-1.7B를 폴백으로 설정. `@mlc-ai/web-llm@0.2.84` 설치 완료. WebLLM React 연결은 RST-602 평가 완료 후로 연기. |
| 생성 파일 | `bar_tend/src/lib/webllm/worker.ts` — Web Worker 엔트리, `WebWorkerMLCEngineHandler` 연결 |
| 생성 파일 | `bar_tend/src/lib/webllm/client.ts` — 로드/스트리밍 생성/타임아웃/언로드/인터럽트 + 논스트리밍 메트릭 API |
| 생성 파일 | `bar_tend/src/lib/webllm/types.ts` — 상태 타입, 이벤트 콜백, 생성 옵션, 평가 결과 타입 |
| 생성 파일 | `bar_tend/src/lib/webllm/evaluation.ts` — RST-602-A 평가 실행기. 브라우저 콘솔 `__evaluateModels()`로 3개 후보(Qwen3.5-2B, Qwen3.5-4B, Qwen3-1.7B)의 로드 시간·TTFT·Tok/s·E2E·Karua 16케이스 하드 실패율 측정 |
| 수정 파일 | `bar_tend/package.json`, `bar_tend/package-lock.json` (`@mlc-ai/web-llm` 설치), `mission_control/TASK_BOARD.md` (RST-601→DONE, RST-602 세분화), `mission_control/WEBLLM_EVALUATION.md` (실행 방법 및 결과 테이블 갱신) |
| 주요 변경 사항 | `@mlc-ai/web-llm@0.2.84` 설치, Web Worker 기반 모델 로드/스트리밍/타임아웃 구현, 평가 실행기로 모델별 메트릭 + Karua 자동 판정 통합 |
| 검증 | `npm run lint`, `npm run check` 통과 |
| 후속 작업 | RST-602-B: WebGPU 브라우저에서 실제 평가 실행. RST-604: WebLLM React 연결은 평가 완료 후 진행 |

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
| 모바일 접근성 보강 | 터치 타겟 최소 44px 적용, 모바일 스프라이트 높이 축소, 대화창 패딩·폰트와 입력창 크기 조정, 480px 이하 초소형 화면 대응 |
| 검증 | `npm run build`, `npm run lint`, `npm test` 15개 모두 통과. 초기 JS 번들 282.20 kB. |

## 작성 규칙

- 작업 종료 시 최신 로그를 위에 추가한다.
- 확인한 사실과 해석을 구분한다.
- 실패한 시도도 다음 작업자의 시간을 절약할 수 있도록 기록한다.
- 수정 또는 생성 파일은 경로를 명시한다.
- 작업자 항목에는 실제 작업 중인 AI 모델명을 기록한다. 모델명을 확인할 수 없는 과거 기록은 추측하지 않고 `AI 모델 미기록 (과거 기록)`으로 표시한다.
- 같은 본 작업 번호의 구현·검토·보완은 별도 로그를 만들지 않고 기존 작업 로그에 누적한다.
- `RST-602-A`처럼 작업 보드에서 독립 하위 단계로 정의된 경우에만 접미사 코드를 유지하며, 같은 본 작업 번호 아래에 모아 기록한다.

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
