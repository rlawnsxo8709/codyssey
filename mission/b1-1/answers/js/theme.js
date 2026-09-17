/*
 * theme.js — 다크 모드
 *
 * 이벤트: 토글 버튼 click / 시스템 테마 change
 * 상태:   state.theme ('light' | 'dark')
 * 렌더:   <html data-theme="...">  → CSS의 [data-theme="dark"] 변수가 전체 색을 바꾼다
 * 유지:   localStorage('portfolio-theme')
 */

const THEME_STORAGE_KEY = 'portfolio-theme';

// 저장된 선택이 있으면 그것을, 없으면 시스템 설정(prefers-color-scheme)을 따른다
const getInitialTheme = (savedTheme, prefersDark) => {
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return prefersDark ? 'dark' : 'light';
};

// 시크릿 모드 등에서 localStorage 접근이 막혀도 사이트는 동작해야 한다
const readSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 저장 실패 시 이번 방문 동안만 유지된다
  }
};

const renderTheme = (theme) => {
  const toggle = document.querySelector('.theme-toggle');
  const isDark = theme === 'dark';

  document.documentElement.dataset.theme = theme;
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
};

const initTheme = () => {
  const toggle = document.querySelector('.theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  subscribe('theme', renderTheme);
  setState('theme', getInitialTheme(readSavedTheme(), systemDark.matches));

  toggle.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    saveTheme(nextTheme);
    setState('theme', nextTheme);
  });

  // 사용자가 직접 고른 적이 없을 때만 시스템 설정 변경을 따라간다
  systemDark.addEventListener('change', ({ matches }) => {
    if (readSavedTheme() === null) setState('theme', matches ? 'dark' : 'light');
  });
};
