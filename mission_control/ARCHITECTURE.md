# 프로젝트 구조

> 분석 기준일: 2026-06-11  
> 실제 애플리케이션 경로: `bar_tend/vite-project/`

## 프로젝트 개요

BarBot은 브라우저에서 실행되는 단일 페이지 웹 애플리케이션이다. 사용자는 바 외부 화면에서 내부로 진입한 뒤 바텐더와 대화하며 취향 질문에 답하고 칵테일 추천을 받는다. 추천 결과, 도감 해제, 레시피, 음악, 세션 초기화 기능이 사이드바와 모달 형태로 제공된다.

## 기술 스택

| 영역 | 확인된 기술 |
|---|---|
| UI | React 19 |
| 언어 | TypeScript |
| 빌드 도구 | Vite 8 |
| 스타일 | Tailwind CSS 4 및 `src/index.css` |
| 정적 데이터 | JSON, TypeScript 모듈 |
| 브라우저 저장소 | `localStorage` |
| 린트 | ESLint 10, typescript-eslint |
| 외부 연동 후보 | TheCocktailDB, OpenAI API, Ollama |
| 테스트 | 미확인. 테스트 스크립트와 테스트 파일이 확인되지 않음 |

## 폴더 구조

```text
pracbar/
├─ mission_control/                 # 작업 운영 문서
└─ bar_tend/
   └─ vite-project/
      ├─ public/                    # 정적 아이콘과 파비콘
      ├─ scripts/                   # 칵테일 데이터 생성 및 보강 스크립트
      ├─ src/
      │  ├─ components/
      │  │  ├─ inside/             # 바 내부, 대화, 카드 UI
      │  │  ├─ outside/            # 바 외부 진입 UI
      │  │  └─ sidebar/            # 도감, 레시피, 음악, 초기화 UI
      │  ├─ data/                   # 정규화된 칵테일 및 제휴 바 JSON
      │  ├─ hooks/                  # 세션 상태 훅
      │  ├─ lib/
      │  │  ├─ akinator/           # 질문 기반 후보 필터 및 점수화
      │  │  ├─ bartender/          # 대화 규칙, 응답, 외부 AI 연동 후보
      │  │  ├─ cocktails/          # 데이터 접근, 검색, 변환, 순위화
      │  │  ├─ idol/               # 대화 메모리 갱신
      │  │  └─ storage/            # 세션 및 도감 해제 저장
      │  ├─ App.tsx                # 화면과 핵심 사용자 흐름 조정
      │  └─ types*.ts              # 공통 타입
      ├─ package.json
      ├─ vite.config.ts
      └─ tsconfig.json
```

## 주요 구성 요소

| 구성 요소 | 책임 | 주요 파일 |
|---|---|---|
| 애플리케이션 조정 | 장면, 메시지, 추천 후보, 모달, 사이드바 상태를 연결 | `src/App.tsx` |
| 외부 및 내부 UI | 바 입장 연출과 내부 무대 구성 | `src/components/outside/`, `src/components/inside/` |
| 대화 엔진 | 키워드 규칙과 대화 문맥 기반 응답 생성 | `src/lib/bartender/engine.ts`, `conversation.ts`, `keywords.ts` |
| 추천 엔진 | 취향 신호 수집, 후보 필터, 다음 질문, 최종 선택 | `src/lib/akinator/engine.ts` |
| 칵테일 데이터 계층 | JSON 데이터 접근, 레거시 데이터 병합, 검색과 변환 | `src/lib/cocktails/database.ts`, `cocktail-db.ts` |
| 세션 저장 | 취향, 대화 메모리, 도감 해제를 브라우저에 저장 | `src/hooks/useBarbotSession.ts`, `src/lib/storage/` |
| 부가 기능 | 도감, 레시피, 음악, 밤 초기화 | `src/components/sidebar/` |

## 데이터 흐름

### 대화 및 추천

1. 사용자가 `ChatInput`에서 텍스트를 전송한다.
2. `App.tsx`가 메시지를 화면 상태에 추가하고 세션 취향 신호를 갱신한다.
3. 퇴장 의도를 먼저 확인한다.
4. `getCocktailResponse()`가 규칙 기반 대화 응답을 만든다.
5. 추천 의도이면 `akinator/engine.ts`가 현재 후보군을 필터링하고 다음 질문 또는 결과를 정한다.
6. 결과 레코드는 `toLegacyCocktail()`로 표시용 형태로 변환된다.
7. 추천 결과는 메시지와 `CocktailCard`에 표시되고 도감 해제 ID가 저장된다.

### 영속 데이터

| 데이터 | 저장 위치 | 수명 |
|---|---|---|
| 취향 선호 및 대화 메모리 | `localStorage`의 `barbot_session_v1` | 브라우저 저장소 삭제 전까지 |
| 도감 해제 ID | `localStorage` 기반 저장 모듈 | 브라우저 저장소 삭제 전까지 |
| 현재 장면, 메시지, 후보군 | React 상태 | 페이지 세션 동안 |
| 칵테일 및 제휴 바 | 번들에 포함된 JSON과 TypeScript 데이터 | 배포 빌드 기준 |

## 기능 흐름

| 기능 | 시작점 | 핵심 흐름 | 결과 |
|---|---|---|---|
| 바 입장 | `BarExterior` | `handleEnter()` | 내부 장면과 첫 메시지 표시 |
| 자유 대화 | `ChatInput` | 대화 엔진 | 바텐더 메시지와 표정 변경 |
| 칵테일 추천 | 추천 의도 입력 | 질문 기반 후보 필터와 점수화 | 추천 카드 및 도감 해제 |
| 이름 검색 | 칵테일 이름 입력 | 데이터베이스 검색 및 유사 문자열 비교 | 해당 칵테일 표시 |
| 사이드바 | 메뉴 버튼 | 도감, 레시피, 음악, 초기화 탭 | 부가 정보 또는 상태 초기화 |
| 퇴장 | 퇴장 버튼 또는 의도 입력 | 작별 응답 후 장면 초기화 | 외부 장면 |

## 외부 의존성

| 의존성 | 현재 확인 상태 |
|---|---|
| React 및 React DOM | 주 실행 경로에서 사용 |
| TheCocktailDB | 정적 데이터 생성 및 보강 스크립트와 API 모듈 존재 |
| OpenAI API | 연동 모듈 존재, 현재 `App.tsx` 주 흐름 연결은 확인되지 않음 |
| Ollama | 연동 모듈 존재, 현재 `App.tsx` 주 흐름 연결은 확인되지 않음 |
| 외부 이미지 URL | 일부 칵테일 이미지에 사용 |
| 지도 링크 | 시그니처 칵테일의 제휴 바 위치에 사용 |

## 확인된 구조적 위험

| 위험 | 근거 | 영향 |
|---|---|---|
| 한국어 문자열 손상 | 다수 소스 및 데이터 파일에서 깨진 문자열 확인 | UI, 검색, 의도 탐지, 추천 정확도 |
| 대형 초기 번들 | 빌드 결과 JS 593.32 kB, 500 kB 초과 경고 | 초기 로딩 성능 |
| 데이터 모델 이중화 | 정규화 JSON 모델과 레거시 `Cocktail` 배열을 변환 및 병합 | 데이터 일관성과 유지 비용 |
| 자동 테스트 부재 | 테스트 스크립트 미확인 | 회귀 발견 지연 |
| 외부 연동 모듈의 미연결 | 모듈은 있으나 주 흐름에서 호출되지 않음 | 유지 목적 불명확 |

## 미확인 사항

- [ ] 배포 환경과 실제 운영 URL
- [ ] 지원 브라우저와 최소 화면 크기
- [ ] 실제 WebLLM 지원 Qwen 및 Gemma 후보와 배포 모델 아티팩트
- [ ] TheCocktailDB 데이터를 갱신하는 운영 절차
- [ ] 문자열 손상의 원본과 복구 가능한 기준 파일
- [ ] 사용자 분석, 오류 추적, 성능 측정 도구
- [ ] 제휴 바 데이터의 실제 운영 책임과 갱신 절차

## 목표 구조

현재 구조는 분석 당시의 실제 구현을 설명한다. 향후 개편 목표는 아래와 같다.

```text
src/
├─ domain/
│  ├─ character/          # 캐릭터 계약, 발화 정책, 규칙 응답
│  ├─ cocktails/          # 단일 칵테일 데이터 계약
│  └─ recommendation/     # 입력 구조화, 후보 계산, 추천 근거
├─ services/
│  └─ dialogue/
│     ├─ rule-engine/     # 항상 사용 가능한 복구 경로
│     └─ webllm/          # Web Worker 기반 표현 계층
├─ hooks/
│  ├─ useDialogueSession
│  ├─ useRecommendationSession
│  └─ useCocktailCollection
└─ components/
   ├─ chat/
   └─ recommendation/
```

### 목표 데이터 흐름

1. 사용자 입력에서 기분, 상황, 취향 신호를 구조화한다.
2. 정보가 부족하면 추천 엔진이 최대 1~3개의 추가 질문을 결정한다.
3. 추천 엔진이 DB에서 칵테일과 추천 근거를 결정한다.
4. WebLLM 또는 규칙 엔진이 결정된 근거를 카루아식 문장으로 표현한다.
5. UI가 대화와 추천 카드를 표시한다.

### 목표 기술 경계

| 영역 | 원칙 |
|---|---|
| 백엔드 | MVP에서 사용하지 않음 |
| WebLLM | Web Worker에서 일반 대화와 추천 설명만 생성 |
| 추천 엔진 | WebLLM과 독립적으로 동작 |
| 모델 후보 | Qwen 및 Gemma를 평가 후 선택 |
| 복구 경로 | WebGPU 미지원, 모델 미준비, 오류 시 규칙 엔진 |
| 지연 로딩 | WebLLM, 426개 칵테일 데이터, 부가 패널 |

### 캐릭터 대화 구조 목표

```text
character/
├─ contracts/             # 시에스타·카루아의 발화 알고리즘과 금지 패턴
├─ rule-engine/           # 의도와 상황을 캐릭터 대사로 변환
├─ prompts/               # WebLLM 시스템 프롬프트 구성
└─ evaluation/            # 캐릭터별 대표 상황과 실패 판정
```

- 캐릭터 설정의 문서 기준은 `mission_control/CHARACTER_DESIGN.md`다.
- MVP 런타임은 카루아만 사용하지만 시에스타 계약도 확장 기준으로 보존한다.
- 공통 의도 분류와 추천 결과는 캐릭터와 분리한다.
- 캐릭터 계층은 결과를 표현하며 추천 결과를 변경하지 않는다.

## 문서 갱신 조건

다음 변경이 있으면 이 문서를 갱신한다.

- [ ] 새 최상위 폴더 또는 주요 모듈 추가
- [ ] 데이터 모델 또는 저장 방식 변경
- [ ] 외부 서비스 추가 또는 제거
- [ ] 사용자 핵심 흐름 변경
- [ ] 빌드, 배포, 테스트 구조 변경
