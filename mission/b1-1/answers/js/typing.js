/*
 * typing.js — Hero 타이핑 효과 (보너스)
 *
 * 순수한 시각 효과라 앱 상태(state)에 넣지 않고 이 파일 안의 지역 변수로만 관리한다.
 * 동작 줄이기(prefers-reduced-motion) 설정이면 첫 문구를 정지 상태로 보여준다.
 */

const TYPING_PHRASES = [
  '웹의 동작 원리를 공부합니다.',
  '이벤트 → 상태 → 렌더링을 설명할 수 있습니다.',
  '리눅스 서버도 직접 다룹니다.',
];
const TYPE_DELAY = 90;
const DELETE_DELAY = 45;
const HOLD_DELAY = 1600;
const NEXT_PHRASE_DELAY = 400;

const initTyping = () => {
  const target = document.querySelector('.typing');

  if (prefersReducedMotion()) {
    target.textContent = TYPING_PHRASES[0];
    return;
  }

  let phraseIndex = 0;
  let length = 0;
  let deleting = false;

  const tick = () => {
    const phrase = TYPING_PHRASES[phraseIndex];
    length += deleting ? -1 : 1;
    target.textContent = phrase.slice(0, length);

    let delay = deleting ? DELETE_DELAY : TYPE_DELAY;
    if (!deleting && length === phrase.length) {
      deleting = true;
      delay = HOLD_DELAY;
    } else if (deleting && length === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % TYPING_PHRASES.length;
      delay = NEXT_PHRASE_DELAY;
    }
    setTimeout(tick, delay);
  };

  tick();
};
