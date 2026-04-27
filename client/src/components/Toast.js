import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import styled, { keyframes, css } from "styled-components";

/* =========================
   Animation
========================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* =========================
   Styled Components
========================= */
const Wrap = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-radius: ${({ theme }) => theme.radii.sm};  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.toast};
  animation: ${slideUp} 0.2s ease forwards;
  pointer-events: all;

  ${({ type, theme }) =>
    type === "success"
      ? css`
          background: ${theme.colors.successToast};
          color: ${theme.colors.successToastText};
        `
      : css`
          background: ${theme.colors.errorToast};
          color: ${theme.colors.errorToastText};
        `}
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

/* =========================
   Icons
========================= */
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.3 3.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 8.6l5.3-5.3a1 1 0 0 1 1.4 0z" />
  </svg>
);

const IconWarn = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 4a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

/* =========================
   Context
========================= */
const ToastContext = createContext(null);

/* =========================
   Provider
========================= */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  const show = useCallback((message, type = "success") => {
    // 🔥 prevent duplicate spam
    setToasts((prev) => {
      if (prev.find((t) => t.message === message)) return prev;

      const id = Date.now();

      timers.current[id] = setTimeout(() => {
        remove(id);
      }, 2800);

      return [...prev, { id, message, type }];
    });
  }, []);

  const success = useCallback((msg) => show(msg, "success"), [show]);
  const error = useCallback((msg) => show(msg, "error"), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error }}>
      {children}

      <Wrap>
        {toasts.map((t) => (
          <ToastItem key={t.id} type={t.type}>
            {t.type === "success" ? <IconCheck /> : <IconWarn />}
            {t.message}

            <CloseBtn onClick={() => remove(t.id)}>✕</CloseBtn>
          </ToastItem>
        ))}
      </Wrap>
    </ToastContext.Provider>
  );
};

/* =========================
   Hook
========================= */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export default ToastProvider;