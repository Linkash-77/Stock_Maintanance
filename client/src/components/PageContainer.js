import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;   /* 🔥 SAME WIDTH EVERYWHERE */
  margin: 0 auto;      /* 🔥 CENTER ALL PAGES */
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export default PageContainer;