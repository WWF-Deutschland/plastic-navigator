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
import { intlShape, injectIntl } from 'react-intl';
import styled from 'styled-components';
import { Heading } from 'grommet';
import Markdown from 'react-remarkable';
import anchorme from 'anchorme';

import { DEFAULT_LOCALE } from 'i18n';
import { PROJECT_CONFIG } from 'config';

import { selectSingleProjectConfig } from 'containers/App/selectors';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import commonMessages from 'messages';
// import messages from './messages';
import ProjectLocationContent from './ProjectLocationContent';
import FeatureList from './FeatureList';

const Styled = styled.div``;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  font-size: 1.8em;
  letter-spacing: 0.05em;
`;

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
    <Styled>
      {theLocation && projectLocations.length > 1 && (
        <ProjectLocationContent location={theLocation} project={project} />
      )}
      {(!theLocation || projectLocations.length <= 1) && (
        <>
          <Title>{title}</Title>
          <div>
            <Markdown
              options={{
                html: true,
              }}
              source={anchorme({
                input: projectInfo,
                options: {
                  truncate: 40,
                  attributes: {
                    target: '_blank',
                    class: 'mpx-content-link',
                  },
                },
              })
                .split(' __ ')
                .map(i => i.trim())
                .join('\n\n ')}
            />
          </div>
          {projectLocations && projectLocations.length > 1 && (
            <FeatureList
              title={intl.formatMessage(commonMessages.locations)}
              layerId={`${PROJECT_CONFIG.id}-${
                project[PROJECT_CONFIG.data['layer-id']]
              }`}
              items={projectLocations.map(l => ({
                id: l.f_id,
                label:
                  l[`location_title_${locale}`] ||
                  l[`location_title_${DEFAULT_LOCALE}`],
              }))}
            />
          )}
        </>
      )}
    </Styled>
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
