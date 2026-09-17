/*
 * nav.js — 네비게이션과 스크롤 인터랙션
 *
 * 1) 햄버거 메뉴   click           → state.menuOpen → .nav__menu.active
 * 2) 부드러운 스크롤 click(앵커)     → preventDefault 후 scrollIntoView({ behavior: 'smooth' })
 * 3) 헤더 배경      scroll ≥ 60px   → state.scroll.headerScrolled → .site-header.scrolled
 * 4) 맨 위로 버튼   scroll ≥ 300px  → state.scroll.showScrollTop  → .scroll-top.visible
 */

const HEADER_SCROLLED_THRESHOLD = 60;
const SCROLL_TOP_THRESHOLD = 300;
const TABLET_MIN_WIDTH = 768;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

const renderMenu = (isOpen) => {
  const toggle = document.querySelector('.nav__toggle');

  document.querySelector('.nav__menu').classList.toggle('active', isOpen);
  toggle.classList.toggle('active', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
};

const renderScroll = ({ headerScrolled, showScrollTop }) => {
  document.querySelector('.site-header').classList.toggle('scrolled', headerScrolled);
  document.querySelector('.scroll-top').classList.toggle('visible', showScrollTop);
};

const initNav = () => {
  subscribe('menuOpen', renderMenu);
  subscribe('scroll', renderScroll);

  // 햄버거 메뉴 열기/닫기
  document.querySelector('.nav__toggle').addEventListener('click', () => {
    setState('menuOpen', !state.menuOpen);
  });

  // 메뉴 바깥 클릭 · Esc · 데스크톱 너비로 전환 시 닫기
  document.addEventListener('click', ({ target }) => {
    if (state.menuOpen && !target.closest('.nav')) setState('menuOpen', false);
  });
  document.addEventListener('keydown', ({ key }) => {
    if (key === 'Escape' && state.menuOpen) setState('menuOpen', false);
  });
  window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`).addEventListener('change', ({ matches }) => {
    if (matches) setState('menuOpen', false);
  });

  // 페이지 안 앵커 링크 → 부드러운 스크롤 (헤더 높이만큼의 여백은 CSS scroll-margin-top)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      if (state.menuOpen) setState('menuOpen', false);
    });
  });

  // 스크롤 위치 → 상태. 기준을 넘나들 때만 setState 해서 불필요한 렌더를 막는다
  const onScroll = () => {
    const y = window.scrollY;
    const next = {
      headerScrolled: y >= HEADER_SCROLLED_THRESHOLD,
      showScrollTop: y >= SCROLL_TOP_THRESHOLD,
    };
    const { headerScrolled, showScrollTop } = state.scroll;
    if (next.headerScrolled !== headerScrolled || next.showScrollTop !== showScrollTop) {
      setState('scroll', next);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelector('.scroll-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  });

  // 새로고침으로 스크롤 위치가 복원된 경우를 위해 한 번 동기화
  setState('menuOpen', false);
  onScroll();
};
