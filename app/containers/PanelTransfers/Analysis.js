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
import { deburr } from 'lodash/string';
import { lowerCase } from 'utils/string';
import { roundNumber } from 'utils/numbers';
import quasiEquals from 'utils/quasi-equals';
// import commonMessages from 'messages';

import ChartFlow from 'components/ChartFlow';

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

const formatRatio = ratio => roundNumber(parseFloat(ratio) * 100, 2, true);

const makeOptions = (
  activeNode,
  data,
  direction,
  analysisConfig,
  locale,
  search,
) => {
  const { id } = analysisConfig;
  // console.log(id, direction, data)
  if (id === 'gyres' && data.nodes && data.nodes[direction] && data.transfer) {
    return data.nodes[direction]
      .filter(node =>
        // make sure we have data for it
        data.transfer.find(row => row[direction] === node.code),
      )
      .map(node => ({
        value: node.code,
        label: node[`name_${locale}`],
      }))
      .sort((a, b) => {
        if (activeNode && quasiEquals(a.value, activeNode)) {
          return -1;
        }
        if (activeNode && quasiEquals(b.value, activeNode)) {
          return 1;
        }
        return 0;
      });
  }
  if (id === 'countries' && data.nodes && data.transfer) {
    const exp =
      search && search.length > 1 && new RegExp(deburr(lowerCase(search)), 'i');
    return data.nodes
      .filter(
        node =>
          // filter by search
          (!exp ||
            quasiEquals(activeNode, node.MRGID_EEZ) ||
            exp.test(deburr(lowerCase(node.UNION)))) &&
          // make sure we have data for it
          data.transfer.find(row => row[direction] === node.MRGID_EEZ),
      )
      .map(node => ({
        value: node.MRGID_EEZ,
        label: node.UNION,
      }))
      .sort((a, b) => {
        if (activeNode && quasiEquals(a.value, activeNode)) {
          return -1;
        }
        if (activeNode && quasiEquals(b.value, activeNode)) {
          return 1;
        }
        return deburr(lowerCase(a.label)) > deburr(lowerCase(b.label)) ? 1 : -1;
      });
  }
  return [];
};
const getResults = (activeNode, data, direction, analysisConfig, locale) => {
  const { id } = analysisConfig;
  const inverse = direction === 'to' ? 'from' : 'to';
  const results =
    data.transfer &&
    data.transfer
      .filter(row => quasiEquals(row[direction], activeNode))
      .sort((a, b) => (parseFloat(a.value) > parseFloat(b.value) ? -1 : 1));
  const total =
    results && results.reduce((memo, { value }) => memo + parseFloat(value), 0);
  if (results && id === 'gyres') {
    return results.map(row => {
      const node =
        data.nodes &&
        data.nodes[inverse].find(nodeObject =>
          quasiEquals(nodeObject.code, row[inverse]),
        );
      return {
        code: row[inverse],
        label: node ? node[`name_${locale}`] : row[inverse],
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

const makeChartNodes = (results, activeOption, direction) => {
  // first add active node on index 0
  const nodes = [
    {
      name: activeOption.label,
      valueFormatted: '100%',
      key: `active-${activeOption.value}`,
      align: direction === 'from' ? 'end' : 'start',
    },
  ];
  return nodes.concat(
    results.map(row => ({
      name: row.label,
      valueFormatted: `${formatRatio(row.ratio)}%`,
      key: row.code,
      align: direction !== 'from' ? 'end' : 'start',
    })),
  );
};
const makeChartLinks = (results, direction) =>
  results.map((row, i) => ({
    source: direction === 'from' ? 0 : i + 1,
    target: direction === 'from' ? i + 1 : 0,
    value: row.ratio,
  }));

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
  const options = makeOptions(
    node,
    data,
    direction,
    analysisConfig,
    locale,
    search,
  );
  const activeOption = !node || options.find(o => o.value === node);

  const results =
    activeOption && getResults(node, data, direction, analysisConfig, locale);
  return (
    <Styled ref={chartContainerRef}>
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
              const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
              return setSearch(escapedText);
            }}
          />
        )}
        {!activeOption && (
          <Hint>
            <FormattedMessage {...messages.noDataForNode} />
          </Hint>
        )}
        <div style={{ width: '100%' }}>
          {containerWidth > 0 && activeOption && results && results.length > 0 && (
            <ChartFlow
              data={{
                nodes: makeChartNodes(results, activeOption, direction),
                links: makeChartLinks(results, direction),
              }}
              width={containerWidth || 300}
              height={200}
              direction={direction}
            />
          )}
        </div>
        {activeOption && results && results.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'right' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => (
                <tr key={row.code}>
                  <td>{row.label}</td>
                  <td style={{ textAlign: 'right' }}>
                    {`${formatRatio(row.ratio)} %`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
