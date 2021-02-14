/**
 *
 * PanelBody
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { Box, Heading, Paragraph, Button, Text, Select } from 'grommet';
import { deburr } from 'lodash/string';
import { lowerCase } from 'utils/string';
import { roundNumber } from 'utils/numbers';
import quasiEquals from 'utils/quasi-equals';
// import commonMessages from 'messages';

import { loadData } from './actions';
import { selectDataForAnalysis } from './selectors';
import { getTransfersKey, getNodesKey } from './utils';
import messages from './messages';

const Styled = styled.div`
  width: 100%;
`;

const Hint = styled(props => <Paragraph size="xxsmall" {...props} />)`
  font-style: italic;
`;
const Label = styled(props => <Text size="small" {...props} />)`
  color: ${({ theme }) => theme.global.colors.grey};
  display: block;
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

const makeOptions = (data, direction, analysisConfig, locale) => {
  const { id } = analysisConfig;
  // console.log(id, direction, data)
  if (id === 'gyres' && data.nodes && data.nodes[direction] && data.transfer) {
    return data.nodes[direction]
      .filter(node => data.transfer.find(row => row[direction] === node.code))
      .map(node => ({
        value: node.code,
        label: node[`name_${locale}`],
      }));
  }
  if (id === 'countries' && data.nodes) {
    return data.nodes
      .filter(node =>
        data.transfer.find(row => row[direction] === node.MRGID_EEZ),
      )
      .sort((a, b) =>
        deburr(lowerCase(a.UNION)) > deburr(lowerCase(b.UNION)) ? 1 : -1,
      )
      .map(node => ({
        value: node.MRGID_EEZ,
        label: node.UNION,
      }));
  }
  return [];
};
const getResults = (node, data, direction, analysisConfig, locale) => {
  const { id } = analysisConfig;
  const inverse = direction === 'to' ? 'from' : 'to';
  const results =
    data.transfer &&
    data.transfer
      .filter(row => quasiEquals(row[direction], node))
      .sort((a, b) => (parseFloat(a.value) > parseFloat(b.value) ? -1 : 1));
  const total =
    results && results.reduce((memo, { value }) => memo + parseFloat(value), 0);
  if (results && id === 'gyres') {
    return results.map(row => {
      const theNode =
        data.nodes &&
        data.nodes[inverse].find(nodeObject =>
          quasiEquals(nodeObject.code, row[inverse]),
        );
      return {
        code: row[inverse],
        label: theNode ? theNode[`name_${locale}`] : row[inverse],
        value: parseFloat(row.value),
        ratio: parseFloat(row.value) / total,
      };
    });
  }
  if (results && id === 'countries') {
    return results.map(row => {
      const theNode =
        data.nodes &&
        data.nodes.find(nodeObject =>
          quasiEquals(nodeObject.MRGID_EEZ, row[inverse]),
        );
      return {
        code: row[inverse],
        label: theNode ? theNode.UNION : row[inverse],
        value: parseFloat(row.value),
        ratio: parseFloat(row.value) / total,
      };
    });
  }
  return [];
};

const formatRatio = ratio => roundNumber(parseFloat(ratio) * 100, 5);

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
  useEffect(() => {
    onLoadData(analysisConfig);
  }, [id]);
  const { locale } = intl;
  const options = makeOptions(data, direction, analysisConfig, locale);
  const nodeValid = !node || !!options.find(o => o.value === node);
  const results =
    nodeValid && getResults(node, data, direction, analysisConfig, locale);
  return (
    <Styled>
      <Heading level={4}>
        <FormattedMessage {...messages[`title_${direction}_${id}`]} />
      </Heading>
      <Paragraph>
        <FormattedMessage {...messages[`intro_${direction}_${id}`]} />
      </Paragraph>
      {messages[`hint_${id}`] && (
        <Hint>
          <FormattedMessage {...messages[`hint_${id}`]} />
        </Hint>
      )}
      <Label>
        <FormattedMessage {...messages[`label_direction_${id}`]} />
      </Label>
      <Box direction="row" gap="xxsmall">
        {['from', 'to'].map(dir => (
          <ButtonDirection
            key={dir}
            active={direction === dir}
            disabled={direction === dir}
            onClick={() => onSetDirection(dir)}
            label={<FormattedMessage {...messages[`button_${dir}_${id}`]} />}
          />
        ))}
      </Box>
      <div>
        <Label>
          <FormattedMessage {...messages[`select_label_${direction}_${id}`]} />
        </Label>
        <Select
          id={`${direction}_${id}`}
          name="select"
          labelKey="label"
          valueKey={{ key: 'value', reduce: true }}
          value={node || ''}
          options={options}
          placeholder={
            <FormattedMessage
              {...messages[`select_placeholder_${direction}_${id}`]}
            />
          }
          onChange={({ value: nextValue }) => onSetNode(nextValue)}
        />
        {!nodeValid && (
          <Hint>
            <FormattedMessage {...messages.noDataForNode} />
          </Hint>
        )}
        {nodeValid && results && results.length > 0 && (
          <div>
            {results.map(row => (
              <div key={row.code}>
                {`${row.label}: ${formatRatio(row.ratio)}% / ${row.value}`}
              </div>
            ))}
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
