import styled from 'styled-components';

const PanelBody = styled.div`
  padding: ${({ hasHeader }) => (hasHeader ? '24px' : 0)} 12px 64px;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: ${({ hasHeader }) => (hasHeader ? '24px' : 0)} 24px 96px;
  }
`;

export default PanelBody;
