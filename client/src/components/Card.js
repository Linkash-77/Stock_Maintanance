import styled from 'styled-components';

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  margin-bottom: 14px;
  overflow: hidden;
`;

export const CardHead = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.ink};
`;

export const CardBody = styled.div`
  padding: 16px;
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

export const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 14px 16px;

  ${({ accent, theme }) =>
    accent &&
    `border-top: 3px solid ${theme.colors.accent};`}
`;

export const MetricLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.ink3};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 500;
  margin-bottom: 8px;
`;

export const MetricValue = styled.div`
  font-size: 26px;
  font-weight: 500;
  line-height: 1;
  color: ${({ green, warn, theme }) =>
    green
      ? theme.colors.accent
      : warn
      ? theme.colors.warnText
      : theme.colors.ink};
`;

export const MetricSub = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.ink3};
  margin-top: 5px;
`;

export default Card;