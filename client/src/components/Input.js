import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border2};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  outline: none;
  transition: border-color 0.12s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.ink3};
  }
`;

export const FormRow = styled.div`
  margin-bottom: 14px;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.ink2};
  margin-bottom: 5px;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export default Input;