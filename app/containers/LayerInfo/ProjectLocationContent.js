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
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';
// import { Back } from 'components/Icons';
import Markdown from 'react-remarkable';
// import anchorme from 'anchorme';
import { prepMarkdown } from 'utils/string';

import { DEFAULT_LOCALE } from 'i18n';

import { PROJECT_CONFIG } from 'config';

import {
  selectLocale,
  selectSingleProjectConfig,
} from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import ListItemHeader from './ListItemHeader';
import Title from './Title';
import PanelBody from './PanelBody';
import messages from './messages';

const PanelHeader = styled(p => (
  <Box margin={{ horizontal: 'medium' }} responsive={false} {...p} />
))``;

const ButtonExternal = styled(p => <Button as="a" {...p} plain />)`
  background: ${({ theme }) => theme.global.colors.brand};
  color: ${({ theme }) => theme.global.colors.white};
  border-radius: 99999px;
  padding: 13px 20px;
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-size: 18px;
  line-height: 1;
  &:hover {
    background: ${({ theme }) => theme.global.colors.brandDark};
  }
`;

const exists = str => str && str.trim().length > 0;

export function ProjectLocationContent({
  locationId,
  projectId,
  project,
  locale,
  onSetLayerInfo,
  locations,
  onLoadLocations,
  onClose,
}) {
  useEffect(() => {
    onLoadLocations();
  }, []);
  if (!locations || !project) return null;
  const location =
    locationId &&
    locations &&
    locations.data &&
    locations.data.features.find(
      feature => feature.properties.location_id === locationId,
    );
  const title =
    location.properties[`location_title_${locale}`] ||
    location.properties[`location_title_${DEFAULT_LOCALE}`];
  const projectTitle =
    project[`project_title_${locale}`] ||
    project[`project_title_${DEFAULT_LOCALE}`];
  const locationInfo =
    location.properties[`location_info_${locale}`] ||
    location.properties[`location_info_${DEFAULT_LOCALE}`];
  const imageAttribution =
    location[`image_attribution_${locale}`] ||
    location[`image_attribution_${DEFAULT_LOCALE}`];
  const projectLink =
    location[`location_link_${locale}`] ||
    location[`location_link_${DEFAULT_LOCALE}`] ||
    project[`project_link_${locale}`] ||
    project[`project_link_${DEFAULT_LOCALE}`];
  return (
    <>
      <PanelHeader>
        <ListItemHeader
          supTitle={projectTitle}
          onClick={() => {
            onSetLayerInfo(`${PROJECT_CONFIG.id}_${projectId}`);
            onClose();
          }}
        />
        <Title>{title}</Title>
        {exists(location.image_url) && (
          <div>
            <figure className="mpx-figure">
              <div className="mpx-image-wrap">
                <img
                  className="mpx-img"
                  src={location.image_url}
                  alt={imageAttribution}
                />
              </div>
              {exists(imageAttribution) && (
                <figcaption className="mpx-figcaption">
                  {imageAttribution}
                </figcaption>
              )}
            </figure>
          </div>
        )}
      </PanelHeader>
      <PanelBody>
        {locationInfo && (
          <div className="mpx-content">
            <Markdown
              options={{
                html: true,
              }}
              source={prepMarkdown(locationInfo, { para: true })}
            />
          </div>
        )}
        <div>
          <Text color="textSecondary">
            {locationInfo && (
              <FormattedMessage {...messages.moreLocationInfo} />
            )}
            {!locationInfo && <FormattedMessage {...messages.noLocationInfo} />}
          </Text>
        </div>
        {exists(projectLink) && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <ButtonExternal
              href={projectLink}
              target="_blank"
              label={
                <Box margin={{ top: '-4px' }}>
                  <FormattedMessage {...messages.projectLinkExternal} />
                </Box>
              }
            />
          </div>
        )}
      </PanelBody>
    </>
  );
}

ProjectLocationContent.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  project: PropTypes.object,
  locationId: PropTypes.string,
  locations: PropTypes.object, // geojson
  onLoadLocations: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
  project: (state, { projectId }) =>
    selectSingleProjectConfig(state, { key: projectId }),
  locations: state => selectLayerByKey(state, 'projectLocations'),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLocations: () => {
      dispatch(loadLayer('projectLocations', PROJECT_CONFIG));
    },
    onSetLayerInfo: id => {
      dispatch(setLayerInfo({ layerId: id }));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ProjectLocationContent);
