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
import { Previous } from 'grommet-icons';
// import { Previous } from 'grommet-icons';
import Markdown from 'react-remarkable';
import anchorme from 'anchorme';

import { DEFAULT_LOCALE } from 'i18n';

import { PROJECT_CONFIG } from 'config';

import { selectLocale } from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';
const Styled = styled.div``;

const Title = styled(p => <Heading level={1} {...p} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  font-weight: normal;
  font-size: 1.8em;
  letter-spacing: 0.05em;
`;
const SupTitle = styled(p => <Button {...p} plain />)`
  text-transform: uppercase;
  font-weight: bold;
`;

export function ProjectLocationContent({
  location,
  project,
  locale,
  onSetLayerInfo,
}) {
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
  const projectId = `${PROJECT_CONFIG.id}-${project.project_id}`;
  return (
    <Styled>
      <div>
        <Button
          plain
          onClick={() => onSetLayerInfo(projectId)}
          icon={<Previous size="large" />}
        />
      </div>
      <div>
        <SupTitle
          onClick={() => onSetLayerInfo(projectId)}
          label={projectTitle}
        />
      </div>
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

ProjectLocationContent.propTypes = {
  onSetLayerInfo: PropTypes.func.isRequired,
  project: PropTypes.object,
  location: PropTypes.object,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
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

export default compose(withConnect)(ProjectLocationContent);
