import styled from 'styled-components';

const Select = styled.select`
  line-height: 1em;
  border-style: none;
  color: ${({ theme }) => theme.global.colors.white};
  background: ${({ theme }) => theme.global.colors.black};
`;

export default Select;
