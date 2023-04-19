/**
 *
 * Page
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button, Box } from 'grommet';
import { Close } from 'components/Icons';
import { useInjectSaga } from 'utils/injectSaga';

import saga from 'containers/App/saga';
import { selectContentByKey } from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';
import Modal from 'components/Modal';

import HTMLWrapper from 'components/HTMLWrapper';

const ContentWrap = styled(props => (
  <Box
    pad={{ vertical: 'ml', horizontal: 'medium' }}
    responsive={false}
    {...props}
  />
))``;

const ButtonClose = styled(p => (
  <Button icon={<Close color="white" />} plain alignSelf="end" {...p} />
))`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px;
  border-radius: 99999px;
  background: ${({ theme }) => theme.global.colors.black};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    top: 30px;
    right: 30px;
    padding: 10px;
  }
`;

// import messages from './messages';
// import commonMessages from 'messages';
export function Page({ page, onLoadContent, content, onClose }) {
  useInjectSaga({ key: 'default', saga });

  useEffect(() => {
    // kick off loading of page content
    onLoadContent(page);
  }, []);

  return (
    <Modal
      onClose={onClose}
      zIndex={2601}
      content={
        <ContentWrap>
          <ButtonClose onClick={() => onClose()} />
          {content && <HTMLWrapper innerhtml={content} />}
        </ContentWrap>
      }
    />
  );
}

Page.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  page: PropTypes.string,
  onClose: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  content: (state, props) =>
    selectContentByKey(state, {
      contentType: 'pages',
      key: props.page,
    }),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('pages', id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Page);
