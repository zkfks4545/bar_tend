# 인수인계

> 최종 갱신일: 2026-06-11 (RST-401 카루아 응답 엔진 완료)

## 현재 목표

기존 BarBot 프로토타입을 **Re:Station 카루아 단일 캐릭터 대화형 칵테일 추천 MVP**로 개편한다.

## 확정된 핵심 계약

- [x] MVP 캐릭터는 카루아 한 명이다.
- [x] 상담이 아니라 농담과 추천을 통한 환기를 제공한다.
- [x] 추천 결과와 근거는 DB 및 추천 엔진이 결정한다.
- [x] WebLLM은 일반 대화와 추천 설명만 생성한다.
- [x] WebLLM은 브라우저의 Web Worker에서 실행한다.
- [x] Qwen과 Gemma 후보를 실제 평가한 후 기본 모델을 결정한다.
- [x] WebLLM 실패 시 규칙 기반 엔진으로 복구한다.
- [x] 백엔드는 MVP 범위에서 사용하지 않는다.
- [x] 캐릭터 대화 생성과 검수는 `CHARACTER_DESIGN.md`를 기준으로 한다.

## 완료된 작업

- [x] **RST-101-1**: 한국어 문자열 손상 전수 조사 완료. **손상 없음.** 38개 소스 파일 모두 UTF-8 정상.
- [x] **RST-102**: BarBot → Re:Station 브랜드 교체 완료. `<title>`, 헤더명, CSS 클래스, 페르소나, localStorage 키 모두 변경.
- [x] **RST-401**: 카루아 규칙 기반 대화 응답 엔진 완료. keywords.ts(12규칙), conversation.ts(30+템플릿), akinator/engine.ts(질문/선택지), App.tsx(환영/작별/추천) 모두 카루아 말투 적용.
- [x] **PLAN-002**: 시에스타·카루아 발화 알고리즘, 금지 패턴, 관계성, 평가 기준 문서화.

## 다음 작업

`RST-201` 칵테일 데이터 계약 확정 및 단일화 — 레거시 `Cocktail`과 `CocktailRecord`를 통합하고 변환 계층(`toLegacyCocktail`)을 제거한다.

### 권장 순서

1. 단일 `CocktailData` 타입 설계 (두 타입의 필드를 모두 커버)
2. `src/types.ts`에 새 타입 정의, `src/types/cocktail-db.ts`의 `CocktailRecord` 폐기 예정 마킹
3. `database.ts`의 레거시 `cocktails[]` 배열을 새 타입으로 마이그레이션
4. UI 컴포넌트에서 `Cocktail` → 새 타입으로 점진적 교체
5. `toLegacyCocktail()` 변환 함수 제거
6. lint + build 검증

## 먼저 읽을 파일

| 순서 | 파일 | 이유 |
|---|---|---|
| 1 | `mission_control/DECISIONS.md` | 변경하면 안 되는 핵심 결정 |
| 2 | `mission_control/CHARACTER_DESIGN.md` | 캐릭터 대화 생성과 검수 기준 |
| 3 | `mission_control/TASK_BOARD.md` | 단계, 완료 조건, 견적 |
| 4 | `bar_tend/vite-project/src/types.ts` | 레거시 `Cocktail` 타입 정의 |
| 5 | `bar_tend/vite-project/src/types/cocktail-db.ts` | 현재 `CocktailRecord` 타입 정의 |
| 6 | `bar_tend/vite-project/src/lib/cocktails/database.ts` | 이중 데이터, `toLegacyCocktail()` 변환 계층 |
| 7 | `bar_tend/vite-project/src/lib/cocktails/cocktail-db.ts` | `CocktailRecord` 기반 데이터 접근 |
| 8 | `bar_tend/vite-project/src/App.tsx` | 현재 사용자 흐름과 집중된 로직 |

## 다중 작업 PC 동기화

이 프로젝트는 여러 PC에서 작업할 수 있다. 히스토리 충돌 시 아래 명령으로 강제 동기화한다.

### 로컬 변경이 없을 때
```bash
git fetch origin
git reset --hard origin/master
```

### 로컬 변경이 있을 때 (변경 보존)
```bash
git stash
git fetch origin
git reset --hard origin/master
git stash pop
```

> 이 명령은 로컬 히스토리를 리모트와 완전히 일치시킨다. `git pull`은 강제 푸시로 인한 분기 히스토리에서 실패할 수 있으므로 `fetch + reset --hard`를 사용한다.

### 규칙
- 이 저장소에서는 `git push --force`를 사용하지 않는다.
- 리모트에 밀어넣기 전에 항상 `git fetch`와 `git rebase`로 최신 상태를 확인한다.

## 주의사항

- [ ] 시에스타, 웰컴 드링크, 게임 시스템을 MVP 작업에 섞지 않는다.
- [ ] 시에스타는 MVP 런타임에 넣지 않지만 `CHARACTER_DESIGN.md`의 설계 계약은 보존한다.
- [ ] 카루아 대사는 농담을 먼저 두고 의미를 직접 해설하지 않는다.
- [ ] WebLLM 연결 전에 규칙 기반 전체 흐름을 완성한다.
- [ ] WebLLM이 추천 결과를 선택하거나 변경하게 만들지 않는다.
- [ ] Qwen 또는 Gemma 모델명을 평가 없이 코드에 고정하지 않는다.
- [ ] 모델 다운로드는 자동 시작하지 않고 사용자에게 크기와 진행 상태를 보여준다.
- [x] ~~한국어 문자열 손상~~ — RST-101-1 조사 결과 손상 없음 확인 완료
- [x] ~~localStorage 키 마이그레이션~~ — RST-102에서 마이그레이션 로직 추가 완료
- [ ] 데이터 모델 단일화 전 양쪽 데이터 중 하나를 임의 삭제하지 않는다.
- [ ] 새 `CocktailData` 타입은 `Cocktail`의 `aroma`, `vibe`, `story`, `popCulture`와 `CocktailRecord`의 `features`, `bar_id`를 모두 커버해야 함

## 검증 기준

- [ ] `npm.cmd run lint`
- [ ] `npm run build` 또는 `npm.cmd run build`
- [ ] 카루아 초기 메시지 표시
- [ ] 자유 대화 입력과 좌우 메시지 표시
- [ ] 최대 1~3개의 질문 후 추천
- [ ] 추천 카드 필수 항목 표시
- [ ] 다시 추천받기
- [ ] WebLLM 없이 전체 흐름 완료
- [ ] 모바일 핵심 흐름 완료
