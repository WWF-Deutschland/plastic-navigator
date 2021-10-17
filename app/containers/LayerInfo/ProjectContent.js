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
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button, Box } from 'grommet';
import Markdown from 'react-remarkable';
import { sortLabels, prepMarkdown } from 'utils/string';

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG } from 'config';
import { WWFLogoSmall } from 'components/Icons';

import { selectSingleProjectConfig } from 'containers/App/selectors';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import commonMessages from 'messages';
import messages from './messages';
import ProjectLocationContent from './ProjectLocationContent';
import FeatureList from './FeatureList';
import Title from './Title';

const Styled = styled(p => (
  <Box flex={false} margin={{ bottom: 'large' }} {...p} />
))``;

const TitleWrap = styled(p => (
  <Box margin={{ top: 'small' }} {...p} align="center" flex={false} />
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

export function ProjectContent({
  project,
  intl,
  onLoadLocations,
  locations,
  location,
}) {
  useEffect(() => {
    onLoadLocations();
  }, []);
  if (!project) return null;
  const { locale } = intl;
  const title =
    project[`project_title_${locale}`] ||
    project[`project_title_${DEFAULT_LOCALE}`];
  const projectInfo =
    project[`project_info_${locale}` || `project_info_${DEFAULT_LOCALE}`];
  const imageAttribution =
    project[`image_attribution_${locale}`] ||
    project[`image_attribution_${DEFAULT_LOCALE}`];
  const projectLink =
    project[`project_link_${locale}`] ||
    project[`project_link_${DEFAULT_LOCALE}`];

  const projectLocations =
    locations &&
    locations.data &&
    locations.data.features
      .filter(l => l.properties.project_id === project.project_id)
      .map(l => l.properties);
  const theLocation =
    location &&
    locations &&
    locations.data &&
    locations.data.features.find(
      feature => feature.properties.f_id === location,
    );
  return (
    <>
      {theLocation && projectLocations.length > 1 && (
        <ProjectLocationContent location={theLocation} project={project} />
      )}
      {(!theLocation || projectLocations.length <= 1) && (
        <Styled>
          <TitleWrap>
            <WWFLogoSmall size="30px" />
            <Title>{title}</Title>
          </TitleWrap>
          {exists(project.image_url) && (
            <div>
              <figure className="mpx-figure">
                <div className="mpx-image-wrap">
                  <img
                    className="mpx-img"
                    src={project.image_url}
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
          <div className="mpx-content">
            <Markdown
              options={{
                html: true,
              }}
              source={prepMarkdown(projectInfo, { para: true })}
            />
          </div>
          {projectLocations && projectLocations.length > 1 && (
            <FeatureList
              title={intl.formatMessage(commonMessages.locations)}
              layerId={`${PROJECT_CONFIG.id}-${
                project[PROJECT_CONFIG.data['layer-id']]
              }`}
              items={projectLocations
                .map(l => ({
                  id: l.f_id,
                  label:
                    l[`location_title_${locale}`] ||
                    l[`location_title_${DEFAULT_LOCALE}`],
                }))
                .sort((a, b) => sortLabels(a.label, b.label))}
            />
          )}
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
        </Styled>
      )}
    </>
  );
}

ProjectContent.propTypes = {
  location: PropTypes.string,
  project: PropTypes.object,
  locations: PropTypes.object, // geojson
  onLoadLocations: PropTypes.func.isRequired,
  // layerCategory: PropTypes.object,
  // layerGroup: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { id }) => selectSingleProjectConfig(state, { key: id }),
  locations: state => selectLayerByKey(state, 'projectLocations'),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLocations: () => {
      dispatch(loadLayer('projectLocations', PROJECT_CONFIG));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ProjectContent));
