/**
 *
 * LayerInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button, Box, Heading } from 'grommet';
import { Next } from 'grommet-icons';
import Markdown from 'react-remarkable';
import anchorme from 'anchorme';

import { DEFAULT_LOCALE } from 'i18n';

import {
  selectSingleProjectConfig,
  // selectSingleLayerCategory,
  // selectSingleLayerGroup,
  selectLocale,
} from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';

import commonMessages from 'messages';
// import messages from './messages';

const Styled = styled.div``;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;

const Locations = styled(Box)``;

const LocationButton = styled(p => (
  <Button {...p} plain reverse fill="horizontal" alignSelf="start" />
))`
  border-top: 1px solid;
`;

export function ProjectInfo({
  project,
  // layerCategory,
  // layerGroup,
  locale,
  locations,
  onSetLayerInfo,
}) {
  if (!project) return null;

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

  return (
    <Styled>
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
      {projectLocations.length > 1 && (
        <Locations>
          <FormattedMessage {...commonMessages.locations} />
          {projectLocations.map(l => (
            <LocationButton
              key={l.location_id}
              onClick={() => onSetLayerInfo(`projloc-${l.location_id}`)}
              label={
                l[`location_title_${locale}`] ||
                l[`location_title_${DEFAULT_LOCALE}`]
              }
              icon={<Next />}
            />
          ))}
        </Locations>
      )}
    </Styled>
  );
}

ProjectInfo.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  id: PropTypes.string,
  project: PropTypes.object,
  locations: PropTypes.object, // geojson
  // layerCategory: PropTypes.object,
  // layerGroup: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { id }) => selectSingleProjectConfig(state, { key: id }),
  locale: state => selectLocale(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetLayerInfo: id => {
      dispatch(setLayerInfo(id));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ProjectInfo);
