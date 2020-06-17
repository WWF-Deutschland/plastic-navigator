/**
 *
 * GroupLayers
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { CheckBox, Button } from 'grommet';
import { Layer } from 'grommet-icons';
import messages from './messages';

const Styled = styled.div`
  display: table;
  margin-top: 20px;
  margin-bottom: 20px;
`;
const ListHeader = styled.div`
  display: table-header-group;
`;
const ListHeaderRow = styled.div`
  display: table-row;
`;
const ListHeaderCell = styled.div`
  display: table-cell;
  font-size: 14px;
  opacity: 0.5;
  border-bottom: 1px solid;
`;
const ListBody = styled.div`
  display: table-row-group;
`;
const ListBodyRow = styled.div`
  display: table-row;
`;
const ListBodyCell = styled.div`
  display: table-cell;
  vertical-align: middle;
`;

const InfoButton = styled(p => <Button {...p} />)``;

function GroupLayers({
  layers,
  activeLayers,
  onToggleLayer,
  onLayerInfo,
  locale,
}) {
  return (
    <Styled>
      <ListHeader>
        <ListHeaderRow>
          <ListHeaderCell>
            <Layer size="small" />
            <FormattedMessage {...messages.columnLayer} />
          </ListHeaderCell>
          <ListHeaderCell>
            <FormattedMessage {...messages.columnKey} />
          </ListHeaderCell>
          <ListHeaderCell>
            <FormattedMessage {...messages.columnInfo} />
          </ListHeaderCell>
        </ListHeaderRow>
      </ListHeader>
      <ListBody>
        {layers &&
          layers.map(layer => (
            <ListBodyRow key={layer.id}>
              <ListBodyCell>
                <CheckBox
                  checked={activeLayers.indexOf(layer.id) > -1}
                  onChange={() => onToggleLayer(layer.id)}
                  label={layer.title[locale]}
                />
              </ListBodyCell>
              <ListBodyCell>Key</ListBodyCell>
              <ListBodyCell>
                <InfoButton
                  onClick={() => onLayerInfo(layer.id)}
                  label={<FormattedMessage {...messages.info} />}
                />
              </ListBodyCell>
            </ListBodyRow>
          ))}
      </ListBody>
    </Styled>
  );
}

GroupLayers.propTypes = {
  // group: PropTypes.object,
  layers: PropTypes.array,
  activeLayers: PropTypes.array,
  onToggleLayer: PropTypes.func,
  onLayerInfo: PropTypes.func,
  locale: PropTypes.string,
};

export default GroupLayers;
