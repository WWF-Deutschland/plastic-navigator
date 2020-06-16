/**
 *
 * LayerInfo
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button, Box } from 'grommet';
import { Close } from 'grommet-icons';

import { selectContentByKey } from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';

import HTMLWrapper from 'components/HTMLWrapper';

const ContentWrap = styled(props => <Box pad="medium" {...props} />)``;

const Styled = styled(props => <Box {...props} background="white" />)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 500px;
  pointer-events: all;
  overflow-y: auto;
  z-index: 3000;
`;

// import messages from './messages';
// import commonMessages from 'messages';
export function LayerInfo({ id, onLoadContent, content, onClose }) {
  useEffect(() => {
    // kick off loading of page content
    onLoadContent(id);
  }, [id]);

  return (
    <Styled>
      <ContentWrap>
        <Button
          onClick={() => onClose()}
          icon={<Close />}
          plain
          alignSelf="end"
        />
        {content && <HTMLWrapper innerhtml={content} />}
      </ContentWrap>
    </Styled>
  );
}

LayerInfo.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  id: PropTypes.string,
  onClose: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  content: (state, props) =>
    selectContentByKey(state, {
      contentType: 'layers',
      key: props.id,
    }),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('layers', id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerInfo);
