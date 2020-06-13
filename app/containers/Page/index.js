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
import { ResponsiveContext, Button, Layer, Box } from 'grommet';
import { Close } from 'grommet-icons';

import { isMinSize } from 'utils/responsive';

import { selectContentByKey } from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';

import HTMLWrapper from 'components/HTMLWrapper';

const ContentWrap = styled(props => <Box pad="medium" {...props} />)``;

// import messages from './messages';
// import commonMessages from 'messages';
export function Page({ page, onLoadContent, content, onClose }) {
  useEffect(() => {
    // kick off loading of page content
    onLoadContent(page);
  }, [page]);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layer
          onEsc={() => onClose()}
          onClickOutside={() => onClose()}
          animation={false}
          margin={isMinSize(size, 'medium') ? 'large' : 'none'}
          full
        >
          <ContentWrap>
            <Button
              onClick={() => onClose()}
              icon={<Close />}
              plain
              alignSelf="end"
            />
            {content && <HTMLWrapper innerhtml={content} />}
          </ContentWrap>
        </Layer>
      )}
    </ResponsiveContext.Consumer>
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
