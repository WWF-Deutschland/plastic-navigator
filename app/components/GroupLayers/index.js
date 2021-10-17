/**
 *
 * GroupLayers
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Button, Box } from 'grommet';
import { ExploreXS as Layer } from 'components/Icons';

import { DEFAULT_LOCALE } from 'i18n';

import { PROJECT_CONFIG } from 'config';

import KeyIcon from 'components/KeyIcon';
import Checkbox from 'components/Checkbox';

import messages from './messages';

const Styled = styled.div`
  display: table;
  table-layout: fixed;
  margin-top: 12px;
  margin-bottom: 20px;
  width: 100%;
`;
const ListHeader = styled.div`
  display: table-header-group;
`;
const ListHeaderRow = styled.div`
  display: table-row;
`;
const ListHeaderCell = styled.div`
  display: table-cell;
  font-size: 12px;
  line-height: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.global.colors['light-4']};
  vertical-align: middle;
  color: ${({ theme }) => theme.global.colors['dark-4']};
  white-space: nowrap;
`;
const ListHeaderKey = styled(ListHeaderCell)`
  width: 45px;
  text-align: center;
`;
const ListHeaderInfo = styled(ListHeaderCell)`
  width: 65px;
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

const InfoButton = styled(p => <Button {...p} plain />)`
  font-family: 'wwfregular';
  text-transform: uppercase;
  line-height: 16px;
  background: ${({ theme }) => theme.global.colors.black};
  color: ${({ theme }) => theme.global.colors.white};
  padding: 0 ${({ theme }) => theme.global.edgeSize.small};
  border-radius: 50px;
  height: 24px;
  &:hover {
    background: ${({ theme }) => theme.global.colors.dark};
  }
`;

const KeyWrap = styled.div`
  display: block;
  width: 24px;
  height: 24px;
  margin: 0 auto;
`;

function GroupLayers({
  layersConfig,
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
              <Layer color="dark-4" />
              <FormattedMessage
                {...messages[projects ? 'columnProject' : 'columnLayer']}
              />
            </Box>
          </ListHeaderCell>
          <ListHeaderKey>
            <FormattedMessage {...messages.columnKey} />
          </ListHeaderKey>
          {onLayerInfo && (
            <ListHeaderInfo>
              <FormattedMessage {...messages.columnInfo} />
            </ListHeaderInfo>
          )}
        </ListHeaderRow>
      </ListHeader>
      <ListBody>
        {layersConfig &&
          layersConfig.map(config => {
            const id = projects
              ? `${PROJECT_CONFIG.id}-${config.project_id}`
              : config.id;
            // const contentId = projects ? id : config['content-id'] || config.id;
            const title = projects
              ? config[`project_title_${locale}`] ||
                config[`project_title_${DEFAULT_LOCALE}`]
              : config.title[locale] || config.title[DEFAULT_LOCALE];
            return (
              <ListBodyRow key={id}>
                <ListBodyCell>
                  <Checkbox
                    checked={activeLayers.indexOf(id) > -1}
                    onToggle={() => onToggleLayer(id)}
                    label={title}
                  />
                </ListBodyCell>
                <ListBodyCellCenter>
                  <KeyWrap>
                    <KeyIcon config={projects ? PROJECT_CONFIG : config} />
                  </KeyWrap>
                </ListBodyCellCenter>
                {onLayerInfo && (
                  <ListBodyCellCenter>
                    <InfoButton
                      onClick={() => onLayerInfo(id)}
                      label={<FormattedMessage {...messages.info} />}
                    />
                  </ListBodyCellCenter>
                )}
              </ListBodyRow>
            );
          })}
      </ListBody>
    </Styled>
  );
}

GroupLayers.propTypes = {
  // group: PropTypes.object,
  layersConfig: PropTypes.array,
  projects: PropTypes.bool,
  activeLayers: PropTypes.array,
  onToggleLayer: PropTypes.func,
  onLayerInfo: PropTypes.func,
  locale: PropTypes.string,
};

export default GroupLayers;
