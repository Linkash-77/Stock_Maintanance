import styled from 'styled-components';

const Select = styled.select`
  width: 100%;
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border2};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  outline: none;
  cursor: pointer;
  transition: border-color 0.12s;
  appearance: none;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b909c' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export default Select;