/**
 *
 * GroupLayers
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { CheckBox, Button, Box } from 'grommet';
import { Layer } from 'grommet-icons';

import { DEFAULT_LOCALE } from 'i18n';

import messages from './messages';

const Styled = styled.div`
  display: table;
  table-layout: fixed;
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
  border-bottom: 1px solid;
  vertical-align: middle;
  color: ${({ theme }) => theme.global.colors['dark-4']};
`;
const ListHeaderKey = styled(ListHeaderCell)`
  width: 60px;
  text-align: center;
`;
const ListHeaderInfo = styled(ListHeaderCell)`
  width: 60px;
  text-align: center;
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
  height: 54px;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
`;

const ListBodyCellCenter = styled(ListBodyCell)`
  text-align: center;
`;

const Label = styled.span`
  line-height: 18px;
`;

const InfoButton = styled(p => <Button {...p} plain />)`
  background: ${({ theme }) => theme.global.colors.black};
  color: ${({ theme }) => theme.global.colors.white};
  padding: 0 ${({ theme }) => theme.global.edgeSize.xsmall};
  border-radius: 5px;
`;

const StyledCheckBox = styled(CheckBox)`
  margin-right: 6px;
`;

function GroupLayers({
  layers,
  activeLayers,
  onToggleLayer,
  onLayerInfo,
  locale,
  projects,
}) {
  return (
    <Styled>
      <ListHeader>
        <ListHeaderRow>
          <ListHeaderCell>
            <Box direction="row" gap="small" align="center">
              <Layer size="small" color="dark-4" />
              <FormattedMessage
                {...messages[projects ? 'columnProject' : 'columnLayer']}
              />
            </Box>
          </ListHeaderCell>
          {!projects && (
            <ListHeaderKey>
              <FormattedMessage {...messages.columnKey} />
            </ListHeaderKey>
          )}
          <ListHeaderInfo>
            <FormattedMessage {...messages.columnInfo} />
          </ListHeaderInfo>
        </ListHeaderRow>
      </ListHeader>
      <ListBody>
        {layers &&
          layers.map(layer => {
            const id = projects ? `project-${layer.project_id}` : layer.id;
            const contentId = projects ? id : layer['content-id'] || layer.id;
            const title = projects
              ? layer[`project_title_${locale}`] ||
                layer[`project_title_${DEFAULT_LOCALE}`]
              : layer.title[locale] || layer.title[DEFAULT_LOCALE];
            return (
              <ListBodyRow key={id}>
                <ListBodyCell>
                  <StyledCheckBox
                    checked={activeLayers.indexOf(id) > -1}
                    onChange={() => onToggleLayer(id)}
                    label={<Label>{title}</Label>}
                  />
                </ListBodyCell>
                {!projects && <ListBodyCellCenter>[Key]</ListBodyCellCenter>}
                <ListBodyCellCenter>
                  <InfoButton
                    onClick={() => onLayerInfo(contentId)}
                    label={<FormattedMessage {...messages.info} />}
                  />
                </ListBodyCellCenter>
              </ListBodyRow>
            );
          })}
      </ListBody>
    </Styled>
  );
}

GroupLayers.propTypes = {
  // group: PropTypes.object,
  layers: PropTypes.array,
  projects: PropTypes.bool,
  activeLayers: PropTypes.array,
  onToggleLayer: PropTypes.func,
  onLayerInfo: PropTypes.func,
  locale: PropTypes.string,
};

export default GroupLayers;
