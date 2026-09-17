/*
 * reveal.js — 스크롤 애니메이션 (Intersection Observer)
 *
 * .reveal 요소가 화면에 20% 이상 들어오면 .is-visible을 붙인다.
 * 실제 움직임(opacity · transform 전환)은 CSS가 담당한다.
 */

const REVEAL_THRESHOLD = 0.2;

let revealObserver = null;

const observeReveal = (elements) => {
  elements.forEach((element) => revealObserver.observe(element));
};

const initReveal = () => {
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target); // 한 번 나타난 요소는 다시 숨기지 않는다
      });
    },
    { threshold: REVEAL_THRESHOLD },
  );

  observeReveal(document.querySelectorAll('.reveal'));
};
