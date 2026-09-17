/*
 * state.js — 앱 전체 상태와 상태 변경 통로
 *
 * 규칙
 *  1. 화면에 영향을 주는 값은 모두 state 객체 안에 둔다.
 *  2. state는 직접 수정하지 않고 반드시 setState(key, value)로 교체한다.
 *  3. setState는 해당 key를 구독한 render 함수를 새 값으로 호출한다.
 *
 * 흐름:  이벤트 핸들러 → setState → render → DOM 업데이트
 * (React의 useState + 리렌더링을 손으로 구현한 형태)
 */

const state = {
  theme: 'light', // 'light' | 'dark'
  menuOpen: false, // 모바일 햄버거 메뉴 열림 여부
  scroll: { headerScrolled: false, showScrollTop: false },
  projects: { status: 'idle', items: [], filter: 'All', error: '' }, // status: idle | loading | success | error
  form: { errors: {}, status: 'idle', senderName: '' }, // status: idle | success
};

const renderers = {};

// key의 상태가 바뀔 때 호출할 render 함수를 등록한다
const subscribe = (key, render) => {
  renderers[key] = render;
};

// 상태를 바꾸는 유일한 통로 — 값 교체 후 해당 화면만 다시 그린다
const setState = (key, value) => {
  state[key] = value;
  const render = renderers[key];
  if (render) render(state[key]);
};
