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
// import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button, Heading } from 'grommet';
// import { Previous } from 'grommet-icons';
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

const Styled = styled.div``;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-size: 1.6em;
`;
const SupTitle = styled(p => <Button {...p} plain />)``;

export function ProjectLocationInfo({
  id,
  project,
  // layerCategory,
  // layerGroup,
  locale,
  locations,
  onSetLayerInfo,
}) {
  const location =
    locations &&
    locations.data &&
    locations.data.features.find(
      feature => feature.properties.location_id === id.replace('projloc-', ''),
    );
  // console.log(location)
  if (!location || !project) return null;
  const title =
    location.properties[`location_title_${locale}`] ||
    location.properties[`location_title_${DEFAULT_LOCALE}`];
  const projectTitle =
    project[`project_title_${locale}`] ||
    project[`project_title_${DEFAULT_LOCALE}`];
  const locationInfo =
    location.properties[`location_info_${locale}`] ||
    location.properties[`location_info_${DEFAULT_LOCALE}`];

  return (
    <Styled>
      <SupTitle
        onClick={() => onSetLayerInfo(`project-${project.project_id}`)}
        label={projectTitle}
      />
      <Title>{title}</Title>
      <div>
        <Markdown
          options={{
            html: true,
          }}
          source={anchorme({
            input: locationInfo,
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
    </Styled>
  );
}

ProjectLocationInfo.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  id: PropTypes.string,
  project: PropTypes.object,
  locations: PropTypes.object, // geojson
  // layerCategory: PropTypes.object,
  // layerGroup: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  project: (state, { id, locations }) => {
    const loc =
      locations &&
      locations.data &&
      locations.data.features.find(
        l => l.properties.location_id === id.replace('projloc-', ''),
      );
    // prettier-ignore
    return loc
      ? selectSingleProjectConfig(state, {
        key: loc.properties.project_id,
      })
      : null;
  },
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

export default compose(withConnect)(ProjectLocationInfo);
