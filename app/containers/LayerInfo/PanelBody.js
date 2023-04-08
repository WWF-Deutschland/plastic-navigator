import styled from 'styled-components';

const PanelBody = styled.div`
  padding: ${({ hasHeader }) => (hasHeader ? '24px' : 0)} 24px 96px;
`;

export default PanelBody;
