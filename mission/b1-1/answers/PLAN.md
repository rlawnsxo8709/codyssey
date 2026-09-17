# b1-1 수행 계획 — 반응형 포트폴리오 웹사이트

> 작성일: 2026-09-17 / 대상: b1-1 반응형 포트폴리오 웹사이트 미션

## 1. 목표와 판단 기준

UI 완성도보다 **"이벤트 → 상태 변경 → 화면 업데이트"** 흐름이 코드에서 한 줄로 따라가지는 것을 우선한다.
평가 항목의 모든 질문에 **실제 코드 줄을 짚어** 답할 수 있어야 한다.

## 2. 산출물 구조

`answers/` 자체가 프로젝트 루트다.

```
answers/
├── index.html          시맨틱 구조 (header / nav / main / section×5 / article / footer)
├── css/style.css       :root 변수 + [data-theme="dark"] + 모바일 퍼스트(768px / 1024px)
├── js/
│   ├── state.js        중앙 state 객체 + setState(key, value) → 구독된 render 호출
│   ├── theme.js        다크 모드 (localStorage 저장, 저장값 없으면 시스템 설정)
│   ├── nav.js          햄버거 메뉴 · 부드러운 스크롤 · 헤더 배경 · 맨 위로 버튼
│   ├── reveal.js       Intersection Observer 스크롤 애니메이션
│   ├── typing.js       Hero 타이핑 효과 (보너스)
│   ├── projects.js     GitHub API (fetch + async/await + try/catch), 4개 상태 렌더링, 언어 필터(보너스)
│   ├── form.js         문의 폼 유효성 검사
│   └── main.js         초기화 진입점
├── images/             프로필 · 파비콘 SVG, screenshots/
├── .vscode/            Live Server 권장 확장 · 설정
├── README.md           프로젝트 설명 · 사용 기술 · 배포 URL · 스크린샷 · 기준값 · 요구사항 체크리스트
└── PLAN.md             이 문서
```

## 3. 핵심 설계 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| JS 로딩 | 기능별 classic script + `defer` | 요구사항이 `defer` 속성을 명시. ES Module(`type="module"`)은 기본이 defer라 요구사항 확인이 모호해짐 |
| 상태 관리 | `state` 객체 1개 + `setState` 단일 통로 | 모든 기능이 같은 경로(이벤트 → setState → render)를 타므로 흐름 설명이 한 가지로 통일됨. React의 `useState` 개념과 1:1 대응 |
| 상태 변경 방식 | 스프레드로 새 객체를 만들어 교체 | 직접 수정(mutation)을 막아 "상태가 바뀌었다 = setState가 호출됐다"를 보장 |
| 렌더링 판단 | `getProjectsView` 등 순수 함수로 분리 | DOM 없이 Node에서 테스트 가능 |
| 스타일 | 인라인 style 금지 → 상태는 클래스·`data-*`·`hidden` 속성으로만 표현 | 제약 사항 준수, 스타일 책임을 CSS에 고정 |
| 외부 의존성 | 없음 (웹 폰트도 시스템 폰트로 대체) | 라이브러리 금지 + 오프라인 개발 가능 |
| 폼 실제 전송(보너스) | 제외 | Formspree/EmailJS 외부 계정 필요 |

## 4. 기준값 (README에 명시)

| 항목 | 값 |
|---|---|
| 맨 위로 버튼 표시 | `scrollY >= 300px` |
| 헤더 배경 변경 | `scrollY >= 60px` |
| Intersection Observer threshold | `0.2` |
| 브레이크포인트 | 768px(태블릿) / 1024px(데스크톱) |

## 5. 배포

- 원격 저장소: `https://github.com/rlawnsxo8709/codyssey` (public)
- GitHub Pages는 브랜치 루트 또는 `/docs`만 직접 배포할 수 있으므로,
  GitHub Actions 워크플로(`.github/workflows/pages.yml`)가 `answers/`의 웹 자원(index.html, css, js, images)만 모아 배포한다.
- 배포 URL: `https://rlawnsxo8709.github.io/codyssey/`
- API 대상: `https://api.github.com/users/rlawnsxo8709/repos`

## 6. 검증 방법

1. **단위 테스트 (Node `node:test`)** — 순수 함수를 테스트 먼저 작성 후 구현
   - 상태: `setState` 가 값을 바꾸고 render를 호출하는가
   - 테마: 저장값 / 시스템 설정 우선순위
   - 프로젝트: fork 제외, 언어 필터, 카드 HTML 생성(escape 포함), 상태 → 화면 종류 판단, HTTP 에러 메시지
   - 폼: 필수값, 이메일 형식
2. **브라우저 E2E (Playwright + Chromium)** — API 응답을 가로채 로딩/성공/에러(403)/빈 상태를 각각 재현하고,
   다크 모드 유지, 햄버거 메뉴, 스크롤 버튼·헤더, 폼 에러 표시, 인라인 style·onclick·var 부재를 확인
3. **배포 확인** — 배포 URL에서 실제 API로 렌더링되는지 확인 후 스크린샷 촬영

테스트 스크립트는 제출물이 아니므로 저장소에 포함하지 않는다.
