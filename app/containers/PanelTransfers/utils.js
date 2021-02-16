import { deburr } from 'lodash/string';
import { lowerCase, truncateText } from 'utils/string';
import { roundNumber } from 'utils/numbers';
import quasiEquals from 'utils/quasi-equals';

export const formatRatio = ratio =>
  roundNumber(parseFloat(ratio) * 100, 2, true);

export const getTransfersKey = config => `${config.id}-transfers`;

export const getNodesKey = (config, fromOrTo) => {
  const key = config.id;
  if (config.dir === 'uni' && config.nodes[fromOrTo]) {
    return `${key}-nodes-${fromOrTo}`;
  }
  if (config.dir === 'omni') {
    return `${key}-nodes`;
  }
  return null;
};

export const makeOptions = ({
  activeNode,
  data,
  direction,
  analysisConfig,
  locale,
  search,
}) => {
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
export const getResults = ({
  activeNode,
  data,
  direction,
  analysisConfig,
  locale,
}) => {
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

export const makeChartNodes = ({
  namedResults,
  otherResults,
  activeOption,
  direction,
  id,
  intl,
  messages,
}) => {
  // first add active node on index 0
  let nodes = [
    {
      name: truncateText(activeOption.label, 24, false),
      valueFormatted: '',
      key: activeOption.value,
      align: direction === 'from' ? 'end' : 'start',
      type: 'active',
    },
  ];
  nodes = nodes.concat(
    namedResults.map(row => ({
      name: truncateText(row.label, 18, false),
      valueFormatted: `${formatRatio(row.ratio)}%`,
      key: row.code,
      align: direction !== 'from' ? 'end' : 'start',
      type: 'default',
    })),
  );
  if (otherResults.length > 1) {
    const otherTotal = otherResults.reduce((memo, row) => memo + row.ratio, 0);
    return nodes.concat({
      name: intl.formatMessage(messages[`label_other_${direction}_${id}`], {
        count: otherResults.length,
      }),
      valueFormatted: `${formatRatio(otherTotal)}%`,
      key: 'other',
      align: direction !== 'from' ? 'end' : 'start',
      type: 'other',
    });
  }
  return nodes;
};
export const makeChartLinks = ({
  namedResults,
  otherResults,
  direction,
  activeOption,
}) => {
  const links = namedResults.map((row, i) => ({
    source: direction === 'from' ? 0 : i + 1,
    target: direction === 'from' ? i + 1 : 0,
    value: row.ratio,
    type: row.code === activeOption.value ? 'active' : 'default',
  }));
  if (otherResults.length > 1) {
    const otherTotal = otherResults.reduce((memo, row) => memo + row.ratio, 0);
    return links.concat({
      source: direction === 'from' ? 0 : namedResults.length + 1,
      target: direction === 'from' ? namedResults.length + 1 : 0,
      value: otherTotal,
      type: 'other',
    });
  }
  return links;
};
