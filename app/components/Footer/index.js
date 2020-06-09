import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: 3em 0;
  background: black;
`;

function Footer() {
  return <Wrapper />;
}

export default Footer;
