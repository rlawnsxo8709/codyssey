/*
 * main.js — 진입점
 *
 * 모든 스크립트는 defer로 연결되어 HTML 파싱이 끝난 뒤 index.html에 적힌 순서대로 실행된다.
 * 따라서 이 파일이 실행되는 시점에는 DOM과 다른 파일의 함수가 모두 준비되어 있다.
 */

initTheme();
initNav();
initReveal();
initTyping();
initProjects();
initForm();

document.querySelector('.footer__year').textContent = new Date().getFullYear();
