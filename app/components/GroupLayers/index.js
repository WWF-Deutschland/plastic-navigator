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
import qe from 'utils/quasi-equals';
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
  isPolicy,
  showArchived,
  // group,
}) {
  const layers = [];
  if (layersConfig) {
    layersConfig.forEach(config => {
      let id;
      let title;
      if (isPolicy && config.indicators) {
        config.indicators.indicators
          .filter(indicator => {
            const isArchive = indicator.archive && qe(indicator.archive, 1);
            // console.log(layer, isArchiveLayer, showArchived)
            return showArchived ? isArchive : !isArchive;
          })
          .forEach(indicator => {
            layers.push({
              id: `${config.id}_${indicator.id}`,
              title: indicator.short
                ? indicator.short[locale] || indicator.short[DEFAULT_LOCALE]
                : indicator.title[locale] || indicator.title[DEFAULT_LOCALE],
              isArchive: indicator.archive ? qe(indicator.archive, 1) : false,
              config,
              configIndicator: indicator,
            });
          });
      } else {
        if (projects) {
          id = `${PROJECT_CONFIG.id}-${config.project_id}`;
          title =
            config[`project_title_${locale}`] ||
            config[`project_title_${DEFAULT_LOCALE}`];
        } else {
          /* eslint-disable prefer-destructuring */
          id = config.id;
          title = config.title[locale] || config.title[DEFAULT_LOCALE];
        }
        layers.push({ id, title, config });
      }
    });
  }
  // console.log(showArchived, layers, group)
  return (
    <Styled>
      <ListHeader>
        <ListHeaderRow>
          <ListHeaderCell>
            <Box direction="row" gap="small" align="center">
              <Layer color="dark-4" />
              {projects && <FormattedMessage {...messages.columnProject} />}
              {isPolicy && <FormattedMessage {...messages.columnIndicator} />}
              {!isPolicy && !projects && (
                <FormattedMessage {...messages.columnLayer} />
              )}
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
        {layers &&
          layers.map(({ id, title, config }) => (
            <ListBodyRow key={id}>
              <ListBodyCell>
                <Checkbox
                  checked={activeLayers.indexOf(id) > -1}
                  onToggle={() => onToggleLayer(id)}
                  label={title}
                />
              </ListBodyCell>
              <ListBodyCellCenter>
                {(config.key || config['styles-by-value']) && (
                  <KeyWrap>
                    <KeyIcon config={projects ? PROJECT_CONFIG : config} />
                  </KeyWrap>
                )}
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
          ))}
      </ListBody>
    </Styled>
  );
}

GroupLayers.propTypes = {
  // group: PropTypes.object,
  layersConfig: PropTypes.array,
  projects: PropTypes.bool,
  isPolicy: PropTypes.bool,
  activeLayers: PropTypes.array,
  onToggleLayer: PropTypes.func,
  onLayerInfo: PropTypes.func,
  locale: PropTypes.string,
  showArchived: PropTypes.bool,
};

export default GroupLayers;
