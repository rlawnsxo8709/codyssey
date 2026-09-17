/*
 * form.js — 문의 폼 유효성 검사
 *
 * 이벤트: input / focusout(필드 단위 즉시 검사), submit(전체 검사)
 * 상태:   state.form = { errors: { name?, email?, message? }, status, senderName }
 * 렌더:   필드 아래 에러 문구 + aria-invalid, 성공 메시지 표시/숨김
 */

const FORM_FIELDS = ['name', 'email', 'message'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// 필드 하나를 검사해 에러 문구를 돌려준다 (문제없으면 빈 문자열)
const validateField = (field, rawValue) => {
  const value = rawValue.trim();

  if (field === 'name' && value === '') return '이름을 입력해 주세요.';
  if (field === 'email') {
    if (value === '') return '이메일을 입력해 주세요.';
    if (!EMAIL_PATTERN.test(value)) return '올바른 이메일 형식이 아닙니다. (예: name@example.com)';
  }
  if (field === 'message' && value === '') return '메시지를 입력해 주세요.';
  return '';
};

// 에러가 있는 필드만 모은 객체 — 비어 있으면 제출 가능
const validateForm = (values) =>
  Object.fromEntries(
    FORM_FIELDS.map((field) => [field, validateField(field, values[field] ?? '')]).filter(([, error]) => error),
  );

const renderForm = ({ errors, status, senderName }) => {
  const success = document.querySelector('.form-success');

  FORM_FIELDS.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    const errorText = document.querySelector(`#${field}-error`);
    const message = errors[field] ?? '';

    errorText.textContent = message;
    input.setAttribute('aria-invalid', String(message !== ''));
    if (message) {
      input.closest('.form-field').classList.add('is-invalid');
    } else {
      input.closest('.form-field').classList.remove('is-invalid');
    }
  });

  success.hidden = status !== 'success';
  success.textContent = status === 'success' ? `${senderName}님, 문의가 접수되었습니다. 감사합니다! (데모: 실제 전송은 되지 않습니다)` : '';
};

const initForm = () => {
  const form = document.querySelector('#contact-form');

  subscribe('form', renderForm);

  // 입력하는 즉시 해당 필드만 다시 검사한다
  const validateOne = ({ target }) => {
    if (!FORM_FIELDS.includes(target.name)) return;
    const errors = { ...state.form.errors, [target.name]: validateField(target.name, target.value) };
    setState('form', { ...state.form, errors, status: 'idle' });
  };

  form.addEventListener('input', validateOne);
  form.addEventListener('focusout', validateOne);

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // 페이지 새로고침(기본 제출) 방지

    const values = Object.fromEntries(new FormData(form));
    const errors = validateForm(values);

    if (Object.keys(errors).length > 0) {
      setState('form', { errors, status: 'idle', senderName: '' });
      form.querySelector(`#${Object.keys(errors)[0]}`).focus();
      return;
    }

    form.reset();
    setState('form', { errors: {}, status: 'success', senderName: values.name.trim() });
  });
};
