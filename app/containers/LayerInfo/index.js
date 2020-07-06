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
import { Button, Box, Heading, ResponsiveContext } from 'grommet';
import { Close } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';

import { useInjectSaga } from 'utils/injectSaga';
import { getAsideInfoWidth } from 'utils/responsive';

import { PROJECT_LOCATIONS } from 'config';
import saga from 'containers/App/saga';
import {
  selectContentByKey,
  selectSingleLayerConfig,
  selectLocale,
} from 'containers/App/selectors';
import { loadContent } from 'containers/App/actions';
import { loadLayer } from 'containers/Map/actions';
import { selectLayerByKey } from 'containers/Map/selectors';

import HTMLWrapper from 'components/HTMLWrapper';

import LayerReference from './LayerReference';
import ProjectInfo from './ProjectInfo';
import ProjectLocationInfo from './ProjectLocationInfo';
// import messages from './messages';

const ContentWrap = styled(props => <Box pad="medium" {...props} />)``;

const Styled = styled(props => <Box {...props} background="white" />)`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: all;
  overflow-y: auto;
  z-index: 3001;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    position: absolute;
    width: ${({ panelWidth }) => panelWidth || 500}px;
    left: auto;
  }
`;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;

export function LayerInfo({
  id,
  project = false,
  location = false,
  onLoadContent,
  content,
  onClose,
  layer,
  // layerCategory,
  // layerGroup,
  locale,
  onLoadLocations,
  locations,
}) {
  useInjectSaga({ key: 'default', saga });
  useEffect(() => {
    // kick off loading of page content
    if (project || location) {
      onLoadLocations();
    } else {
      onLoadContent(id);
    }
  }, [id]);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Styled panelWidth={getAsideInfoWidth(size)}>
          <ContentWrap>
            <Button
              onClick={() => onClose()}
              icon={<Close />}
              plain
              alignSelf="end"
            />
            {project && (
              <ProjectInfo id={id} locations={locations} project={layer} />
            )}
            {location && <ProjectLocationInfo id={id} locations={locations} />}
            {layer && !project && !location && (
              <>
                <Title>
                  {layer.title[locale] || layer.title[DEFAULT_LOCALE]}
                </Title>
                {content && <HTMLWrapper innerhtml={content} />}
                <LayerReference attribution={layer.attribution} />
              </>
            )}
          </ContentWrap>
        </Styled>
      )}
    </ResponsiveContext.Consumer>
  );
}

LayerInfo.propTypes = {
  onLoadContent: PropTypes.func.isRequired,
  onLoadLocations: PropTypes.func.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  id: PropTypes.string,
  onClose: PropTypes.func,
  layer: PropTypes.object,
  project: PropTypes.bool,
  location: PropTypes.bool,
  locations: PropTypes.object, // geojson
  // layerCategory: PropTypes.object,
  // layerGroup: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  content: (state, { id, project }) => {
    if (!project) {
      return selectContentByKey(state, {
        contentType: 'layers',
        key: id,
      });
    }
    return null;
  },
  layer: (state, { id }) => selectSingleLayerConfig(state, { key: id }),
  locations: (state, { project, location }) =>
    project || location ? selectLayerByKey(state, 'projectLocations') : null,
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadContent: id => {
      dispatch(loadContent('layers', id));
    },
    onLoadLocations: () => {
      dispatch(loadLayer('projectLocations', PROJECT_LOCATIONS));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LayerInfo);
