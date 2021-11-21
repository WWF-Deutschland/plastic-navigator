/**
 *
 * LayerInfo
 *
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import styled from 'styled-components';
import { Box, Button, Text, TextInput } from 'grommet';
import { Link as LinkIcon, Close } from 'grommet-icons';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import { findFeature } from 'utils/layers';

import {
  selectLocale,
  selectRouterPath,
  selectInfoSearch,
} from 'containers/App/selectors';
import { setLayerInfo } from 'containers/App/actions';
import { selectLayerByKey } from 'containers/Map/selectors';
import { loadLayer } from 'containers/Map/actions';

import { getPropertyByLocale } from 'containers/Map/utils';

import Title from '../Title';
import LayerContent from '../LayerContent';
import ListItemHeader from '../ListItemHeader';
import messages from '../messages';
import CountryPolicyCommitments from './CountryPolicyCommitments';
const ButtonShare = styled(props => <Button plain {...props} />)`
  color: ${({ theme }) => theme.global.colors.dark};
  stroke: ${({ theme }) => theme.global.colors.dark};
  text-decoration: underline;
  opacity: 0.5;
  position: relative;
  top: 3px;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.global.colors.brand};
    stroke: ${({ theme }) => theme.global.colors.brand};
  }
`;
const StyledTextInput = styled(TextInput)`
  border: 1px solid #dddddd !important;
  padding: 3px;
`;
const StyledTitle = styled(Title)`
  margin-bottom: 0;
`;

const getTitle = (feature, config, locale) => {
  if (config.tooltip.title.propertyByLocale) {
    return getPropertyByLocale(
      feature.properties,
      config.tooltip.title,
      locale,
    );
  }
  return config.tooltip.title[locale];
};

export function CountryFeatureContent({
  featureId,
  config, // layer config
  locale,
  layerData,
  onLoadLayer,
  supTitle,
  onSetLayerInfo,
  headerFallback,
  path,
  info,
  intl,
}) {
  const [showLink, setShowLink] = useState(false);
  const inputRef = useRef();
  useEffect(() => {
    onLoadLayer(config.id, config);
  }, [config]);
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.select();
    }
  }, [showLink, inputRef]);

  if (!featureId || !config || !layerData) return null;

  const feature = findFeature(layerData.data.features, featureId);

  if (!feature) return <LayerContent config={config} header={headerFallback} />;
  return (
    <>
      <ListItemHeader
        supTitle={supTitle}
        onClick={() => onSetLayerInfo(config.id, 'countries')}
      />
      <Box margin={{ bottom: 'large' }}>
        <Box
          direction="row"
          justify="between"
          align="center"
          margin={{ bottom: 'xsmall' }}
        >
          <StyledTitle>{getTitle(feature, config, locale)}</StyledTitle>
          <ButtonShare
            plain
            reverse
            icon={
              showLink ? (
                <Close color="inherit" size="large" />
              ) : (
                <LinkIcon color="inherit" size="xlarge" />
              )
            }
            gap="xsmall"
            onClick={() => setShowLink(!showLink)}
            title={intl.formatMessage(messages.showCountryLink)}
          />
        </Box>
        {showLink && (
          <Box
            margin={{ top: 'small', bottom: 'small' }}
            justify="start"
            align="start"
            gap="xsmall"
          >
            <Text size="xxsmall" color="textSecondary">
              <FormattedMessage {...messages.shareCountryLink} />
            </Text>
            <StyledTextInput
              ref={inputRef}
              readOnly
              focusIndicator
              value={`${window.location.host}/#${path}?info=${info}`}
              onFocus={() => {
                if (inputRef && inputRef.current) {
                  inputRef.current.select();
                }
              }}
            />
          </Box>
        )}
      </Box>
      <CountryPolicyCommitments feature={feature} config={config} />
    </>
  );
}
// <FormattedMessage {...messages.downloadPolicyData} />

CountryFeatureContent.propTypes = {
  onLoadLayer: PropTypes.func,
  onSetLayerInfo: PropTypes.func,
  config: PropTypes.object,
  featureId: PropTypes.string,
  locale: PropTypes.string,
  supTitle: PropTypes.string,
  path: PropTypes.string,
  info: PropTypes.string,
  layerData: PropTypes.object,
  headerFallback: PropTypes.node,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  locale: state => selectLocale(state),
  layerData: (state, { config }) => selectLayerByKey(state, config.id),
  path: state => selectRouterPath(state),
  info: state => selectInfoSearch(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadLayer: (key, config) => {
      dispatch(loadLayer(key, config));
    },
    onSetLayerInfo: (id, view) => {
      dispatch(setLayerInfo(id, view));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(CountryFeatureContent));
