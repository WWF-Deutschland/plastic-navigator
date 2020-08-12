import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const getDiameterPx = radius => `${radius * 2}px`;
const Styled = styled.div`
  background: white;
  border-radius: 999999px;
  border-width: ${({ circleStyle }) => circleStyle.weight || 1}px;
  border-color: ${({ circleStyle }) => circleStyle.color || 'black'};
  border-style: ${({ circleStyle }) => circleStyle.line || 'solid'};
  overflow: hidden;
  width: ${({ radius }) => (radius ? getDiameterPx(radius) : '100%')};
  height: ${({ radius }) => (radius ? getDiameterPx(radius) : '100%')};
  position: relative;
`;

const StyledInner = styled.div`
  background: ${({ circleStyle }) => circleStyle.fillColor || 'black'};
  opacity: ${({ circleStyle }) => circleStyle.fillOpacity || 0.5};
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export function KeyCircle({ circleStyle, radius }) {
  return (
    <Styled circleStyle={circleStyle} radius={radius}>
      <StyledInner circleStyle={circleStyle} />
    </Styled>
  );
}

KeyCircle.propTypes = {
  circleStyle: PropTypes.object,
  radius: PropTypes.number,
};

export default KeyCircle;
