import styled, { css } from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.radii.sm};  
  cursor: pointer;
  transition: background 0.12s, opacity 0.12s, transform 0.1s;
  border: none;
  letter-spacing: 0.01em;

  ${({ variant, theme }) =>
    (!variant || variant === 'primary') &&
    css`
      background: ${theme.colors.accent};
      color: #fff;
      width: 100%;
      &:hover { background: ${theme.colors.accentDark}; }
      &:active { transform: scale(0.98); }
    `}

  ${({ variant, theme }) =>
    variant === 'ghost' &&
    css`
      background: transparent;
      color: ${theme.colors.ink2};
      border: 1px solid ${theme.colors.border2};
      &:hover { background: ${theme.colors.surface2}; }
    `}

  &:disabled {
    background: ${({ theme }) => theme.colors.surface3};
    color: ${({ theme }) => theme.colors.ink3};
    cursor: not-allowed;
    transform: none;
  }
`;

export default Button;