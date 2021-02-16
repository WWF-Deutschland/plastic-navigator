/**
 *
 * PanelBody
 *
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Box, Heading, Paragraph, Button, Text, Select } from 'grommet';
// import commonMessages from 'messages';

import ChartFlow from 'components/ChartFlow';

import { loadData } from './actions';
import { selectDataForAnalysis } from './selectors';
import {
  getTransfersKey,
  getNodesKey,
  makeOptions,
  makeChartLinks,
  makeChartNodes,
  getResults,
  formatRatio,
} from './utils';
import messages from './messages';

const Styled = styled.div`
  width: 100%;
`;

const Title = styled(props => <Heading level={4} {...props} />)`
  max-width: none;
`;
const Hint = styled(props => <Paragraph size="xxsmall" {...props} />)`
  font-style: italic;
`;
const Label = styled(props => <Text size="small" {...props} />)`
  color: ${({ theme }) => theme.global.colors.grey};
  display: block;
`;

const ButtonInline = styled(props => <Button plain {...props} />)`
  &:hover {
    text-decoration: underline;
  }
`;
// prettier-ignore
const ButtonDirection = styled(props => <Button plain {...props} />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 16px;
  background: ${({ theme, active }) =>
    theme.global.colors[active ? 'brand' : 'light']};
  color: ${({ theme, active }) =>
    theme.global.colors[active ? 'white' : 'grey']};
  border-radius: 5px;
  padding: 2px 13px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  &:hover {
    background: ${({ theme, disabled }) =>
    theme.global.colors[disabled ? 'brand' : 'brandDark']};
    color: ${({ theme }) => theme.global.colors.white};
  }
  opacity: 1 !important;
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 5px 15px;
  }
`;

const THRESHOLD_OTHER = 0.0099;

export function Analysis({
  id,
  analysisConfig,
  onLoadData,
  data,
  direction,
  onSetDirection,
  onSetNode,
  node,
  intl,
}) {
  const [search, setSearch] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const chartContainerRef = useRef(null);
  useEffect(() => {
    onLoadData(analysisConfig);
  }, [id]);

  useEffect(() => {
    if (!containerWidth && chartContainerRef.current) {
      setContainerWidth(chartContainerRef.current.offsetWidth);
    }
  }, [chartContainerRef]);

  const { locale } = intl;
  const options = makeOptions({
    activeNode: node,
    data,
    direction,
    analysisConfig,
    locale,
    search,
  });
  const activeOption = !node || options.find(o => o.value === node);

  const results =
    activeOption &&
    getResults({ activeNode: node, data, direction, analysisConfig, locale });

  const otherResults =
    results && results.filter(row => row.ratio < THRESHOLD_OTHER);

  const namedResults =
    results && otherResults.length > 1
      ? results.filter(row => row.ratio >= THRESHOLD_OTHER)
      : results;

  if (!direction || !id) return null;
  return (
    <Styled ref={chartContainerRef}>
      <Title>
        <FormattedMessage {...messages[`title_${direction}_${id}`]} />
      </Title>
      <Paragraph fill>
        <FormattedMessage {...messages[`intro_${direction}_${id}`]} />
        {messages[`hint_${id}`] && (
          <FormattedMessage {...messages[`hint_${id}`]} />
        )}
      </Paragraph>
      <Box direction="row" gap="medium" margin={{ bottom: 'large' }}>
        <Box>
          <Label>
            <FormattedMessage
              {...messages[`select_label_${direction}_${id}`]}
            />
          </Label>
          {id === 'gyres' && (
            <Select
              id={`select-${id}`}
              name={`select-${id}`}
              labelKey="label"
              valueKey={{ key: 'value', reduce: true }}
              value={node || ''}
              options={options}
              placeholder={
                <FormattedMessage
                  {...messages[`select_placeholder_${direction}_${id}`]}
                />
              }
              onChange={({ value: nextValue }) =>
                onSetNode(nextValue !== node ? nextValue : null)
              }
            />
          )}
          {id === 'countries' && (
            <Select
              id={`select-${id}`}
              name={`select-${id}`}
              labelKey="label"
              valueKey={{ key: 'value', reduce: true }}
              value={node || ''}
              options={options}
              placeholder={
                <FormattedMessage
                  {...messages[`select_placeholder_${direction}_${id}`]}
                />
              }
              onOpen={() => setSearch('')}
              onChange={({ value: nextValue }) =>
                onSetNode(nextValue !== node ? nextValue : null)
              }
              onSearch={text => {
                // The line below escapes regular expression special characters:
                // [ \ ^ $ . | ? * + ( )
                const escapedText = text.replace(
                  /[-\\^$*+?.()|[\]{}]/g,
                  '\\$&',
                );
                return setSearch(escapedText);
              }}
            />
          )}
        </Box>
        <Box>
          <Label>
            <FormattedMessage {...messages[`label_direction_${id}`]} />
          </Label>
          <Box direction="row" gap="xsmall">
            {['from', 'to'].map(dir => (
              <ButtonDirection
                key={dir}
                active={direction === dir}
                disabled={direction === dir}
                onClick={() => onSetDirection(dir)}
                label={
                  <FormattedMessage {...messages[`button_${dir}_${id}`]} />
                }
              />
            ))}
          </Box>
        </Box>
      </Box>
      <div>
        {!activeOption && (
          <Hint>
            <FormattedMessage {...messages.noDataForNode} />
          </Hint>
        )}
        <div style={{ width: '100%' }}>
          {containerWidth > 0 && activeOption && results && results.length > 0 && (
            <ChartFlow
              data={{
                nodes: makeChartNodes({
                  namedResults,
                  otherResults,
                  direction,
                  activeOption,
                  intl,
                  messages,
                  id,
                }),
                links: makeChartLinks({
                  namedResults,
                  otherResults,
                  direction,
                  activeOption,
                  // intl,
                  // messages,
                }),
              }}
              width={containerWidth || 300}
              height={300}
              direction={direction}
              onSelectNode={(code, nodeType) => {
                onSetNode(code);
                if (nodeType === 'source' && direction === 'to') {
                  onSetDirection('from');
                }
                if (nodeType === 'target' && direction === 'from') {
                  onSetDirection('to');
                }
              }}
            />
          )}
        </div>
        {activeOption && otherResults && otherResults.length > 1 && (
          <div>
            <Hint
              size="xxxsmall"
              textAlign="center"
              margin={{ horizontal: 'auto' }}
            >
              <span>
                <FormattedMessage
                  {...messages[`hint_other_${direction}_${id}`]}
                />
              </span>
              {otherResults.map((row, i) => (
                <span key={row.code}>
                  <ButtonInline
                    onClick={() => {
                      onSetNode(row.code);
                      if (direction === 'to') {
                        onSetDirection('from');
                      }
                      if (direction === 'from') {
                        onSetDirection('to');
                      }
                    }}
                  >
                    {`${formatRatio(row.ratio)}% ${row.label}`}
                  </ButtonInline>
                  {i + 1 < otherResults.length && <>, </>}
                </span>
              ))}
            </Hint>
          </div>
        )}
      </div>
    </Styled>
  );
}

Analysis.propTypes = {
  id: PropTypes.string,
  direction: PropTypes.string,
  onLoadData: PropTypes.func,
  onSetDirection: PropTypes.func,
  onSetNode: PropTypes.func,
  // // layersConfig: PropTypes.array,
  // // locale: PropTypes.string,
  // uiState: PropTypes.object,
  analysisConfig: PropTypes.object,
  data: PropTypes.object,
  node: PropTypes.string,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  data: (state, { analysisConfig }) =>
    selectDataForAnalysis(state, analysisConfig),
  // locale: state => selectLocale(state),
  // uiState: state => selectUIStateByKey(state, { key: COMPONENT_KEY }),
  // activeLayers: state => selectActiveLayers(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadData: config => {
      // load transfer data
      dispatch(loadData(getTransfersKey(config), config.transfer.data));
      if (config.dir === 'uni') {
        // load 'from' nodes
        dispatch(loadData(getNodesKey(config, 'from'), config.nodes.from.data));
        // load 'to' nodes
        dispatch(loadData(getNodesKey(config, 'to'), config.nodes.to.data));
      } else {
        dispatch(loadData(getNodesKey(config), config.nodes.data));
      }
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(Analysis));
// export default PanelTransfers;
