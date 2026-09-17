/*
 * projects.js — GitHub API 연동
 *
 * 이벤트: 페이지 로드 / 재시도 버튼 click / 언어 필터 click
 * 상태:   state.projects = { status, items, filter, error }
 *         status: idle → loading → success | error
 * 렌더:   status에 따라 로딩 / 에러 / 빈 상태 / 카드 목록 중 하나를 그린다
 */

const GITHUB_USERNAME = 'rlawnsxo8709';
const REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const ALL_FILTER = 'All';

const escapeHTML = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// fork가 아닌 저장소 중 선택된 언어만 남긴다
const selectProjects = (repos, filter) =>
  repos
    .filter(({ fork }) => !fork)
    .filter(({ language }) => filter === ALL_FILTER || language === filter);

// 필터 버튼 목록: All + 실제 저장소에 있는 언어 (중복 제거, 알파벳순)
const getLanguages = (repos) => {
  const languages = selectProjects(repos, ALL_FILTER)
    .map(({ language }) => language)
    .filter(Boolean);
  return [ALL_FILTER, ...[...new Set(languages)].sort()];
};

// "2026-09-17T10:00:00Z" → "2026.09.17"
const formatDate = (isoString) => isoString.slice(0, 10).replaceAll('-', '.');

// 저장소 데이터 1개 → 카드 HTML (구조분해 할당 + 템플릿 리터럴)
const createCardHTML = ({ name, description, html_url, language, stargazers_count, updated_at }) => `
  <article class="project-card reveal">
    <h3 class="project-card__title">
      <a href="${escapeHTML(html_url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)}</a>
    </h3>
    <p class="project-card__desc">${description ? escapeHTML(description) : '설명이 없는 저장소입니다.'}</p>
    <ul class="project-card__meta">
      <li class="project-card__lang" data-lang="${escapeHTML(language ?? 'none')}">${escapeHTML(language ?? '언어 정보 없음')}</li>
      <li aria-label="스타 ${stargazers_count}개">★ ${stargazers_count}</li>
      <li>업데이트 ${formatDate(updated_at)}</li>
    </ul>
  </article>`;

// 상태 → 어떤 화면을 그릴지 결정 (DOM과 분리된 순수 함수)
const getProjectsView = ({ status, items, filter }) => {
  if (status === 'loading' || status === 'idle') return { kind: 'loading' };
  if (status === 'error') return { kind: 'error' };

  const projects = selectProjects(items, filter);
  return projects.length === 0 ? { kind: 'empty' } : { kind: 'list', projects };
};

const describeHttpError = (status) => {
  if (status === 403 || status === 429) {
    return 'GitHub API 요청 한도(시간당 60회)를 초과했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (status === 404) return `GitHub 사용자 '${GITHUB_USERNAME}'를 찾을 수 없습니다.`;
  return `GitHub 서버가 오류를 응답했습니다. (HTTP ${status})`;
};

const fetchRepos = async () => {
  const response = await fetch(REPOS_URL, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(describeHttpError(response.status));
  return response.json();
};

const loadProjects = async () => {
  setState('projects', { ...state.projects, status: 'loading', error: '' });

  try {
    const repos = await fetchRepos();
    setState('projects', { ...state.projects, status: 'success', items: repos });
  } catch (error) {
    // fetch 자체가 실패(오프라인 등)하면 TypeError가 난다
    const message = error instanceof TypeError ? '네트워크 연결을 확인해 주세요.' : error.message;
    setState('projects', { ...state.projects, status: 'error', error: message });
  }
};

const renderFilters = (container, { items, filter }) => {
  container.innerHTML = getLanguages(items)
    .map(
      (language) => `
      <button class="filter__btn${language === filter ? ' is-active' : ''}" type="button"
        data-filter="${escapeHTML(language)}" aria-pressed="${language === filter}">${escapeHTML(language)}</button>`,
    )
    .join('');
};

const renderProjects = (projectsState) => {
  const statusBox = document.querySelector('.projects__status');
  const grid = document.querySelector('.projects__grid');
  const filters = document.querySelector('.filter');
  const view = getProjectsView(projectsState);

  grid.innerHTML = '';
  filters.innerHTML = '';
  statusBox.classList.remove('is-error');

  if (view.kind === 'loading') {
    statusBox.innerHTML = '<span class="spinner" aria-hidden="true"></span><p>로딩 중...</p>';
    return;
  }

  if (view.kind === 'error') {
    statusBox.classList.add('is-error');
    statusBox.innerHTML = `
      <p class="projects__message">프로젝트를 불러올 수 없습니다.</p>
      <p class="projects__detail">${escapeHTML(projectsState.error)}</p>
      <button class="btn btn--primary js-retry" type="button">다시 시도</button>`;
    return;
  }

  if (view.kind === 'empty') {
    statusBox.innerHTML = '<p class="projects__message">표시할 프로젝트가 없습니다.</p>';
    return;
  }

  statusBox.innerHTML = '';
  renderFilters(filters, projectsState);
  grid.innerHTML = view.projects.map(createCardHTML).join('');
  observeReveal(grid.querySelectorAll('.reveal'));
};

const initProjects = () => {
  subscribe('projects', renderProjects);

  // 버튼은 렌더링 때마다 새로 만들어지므로 고정된 부모에 이벤트를 위임한다
  document.querySelector('.projects__status').addEventListener('click', (event) => {
    if (event.target.closest('.js-retry')) loadProjects();
  });

  document.querySelector('.filter').addEventListener('click', (event) => {
    const button = event.target.closest('.filter__btn');
    if (!button) return;
    setState('projects', { ...state.projects, filter: button.dataset.filter });
  });

  loadProjects();
};
