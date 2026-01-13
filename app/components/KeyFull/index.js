import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import DEFAULT_LOCALE from 'i18n';
import { PROJECT_CONFIG } from 'config';

import { getRange } from 'containers/Map/utils';

import coreMessages from 'messages';
import Gradient from './Gradient';
import Circles from './Circles';
import Areas from './Areas';
import Icon from './Icon';
// import IconAlt from './IconAlt';
import SubTitle from './SubTitle';

import messages from './messages';

const Styled = styled(p => <Box {...p} fill="horizontal" flex={false} />)`
  position: relative;
`;

const SubTitleWrap = styled.div`
  margin-bottom: 5px;
`;

export function KeyFull({
  id,
  indicatorId,
  simple,
  intl,
  dark,
  layerInfo,
  config,
  excludeEmpty,
  chartDate,
  positionsOverTime,
}) {
  const { key, render, style, data, featureStyle } = config;
  const myId = id || config.id;
  const { locale } = intl;
  const isGradient = key && key.stops && key.type === 'continuous';
  const isCircle = key && render && render.type === 'scaledCircle' && !!style;
  const isArea =
    (key && render && render.type === 'area' && !!featureStyle) ||
    config['styles-by-value'];
  const isIcon = false;
  const isIconAlt = false;
  // const isIcon =
  //   (key && key.icon && !!key.icon.datauri) ||
  //   (render && render.type === 'marker' && !!icon.datauri);
  // const isIconAlt = isIcon && key.style;
  // console.log('KeyFull', isIcon && key.style)
  /* eslint-disable react/no-danger */
  // prettier-ignore
  const range =
    isCircle &&
    render.attribute &&
    layerInfo &&
    layerInfo.data &&
    layerInfo.data.features
      ? getRange(layerInfo.data.features, render.attribute)
      : null;
  const hasTitle =
    (key && key.title && !isIcon && !isArea) || (!simple && data && data.unit);

  return (
    <Styled>
      {hasTitle && (
        <SubTitleWrap>
          {key && key.title && !isIcon && !isArea && (
            <SubTitle>
              {`${key.title[locale] || key.title[DEFAULT_LOCALE]} `}
              {simple &&
                data.type &&
                ` ${intl.formatMessage(messages[`by-${config.data.type}`])} `}
            </SubTitle>
          )}
          {!simple && data && data.unit && (
            <SubTitle>
              <FormattedMessage {...messages['in-unit']} />
              <span
                dangerouslySetInnerHTML={{
                  __html: ` ${data.unit[locale] || data.unit[DEFAULT_LOCALE]}${
                    data['unit-additional'] ? '<sup>*</sup> ' : ' '
                  }`,
                }}
              />
            </SubTitle>
          )}
        </SubTitleWrap>
      )}
      {isIcon && !isIconAlt && (
        <Icon
          id={myId}
          config={config}
          simple={simple}
          dark={dark}
          title={
            myId === PROJECT_CONFIG.id
              ? intl.formatMessage(coreMessages.projectLocation)
              : null
          }
          excludeEmpty={excludeEmpty}
        />
      )}
      {isGradient && (
        <Gradient id={myId} config={config} simple={simple} dark={dark} />
      )}
      {isCircle && (
        <Circles
          id={myId}
          config={config}
          simple={simple}
          dark={dark}
          range={range}
        />
      )}
      {isArea && (
        <Areas
          id={myId}
          config={config}
          simple={simple}
          dark={dark}
          layerInfo={layerInfo}
          excludeEmpty={excludeEmpty}
          chartDate={chartDate}
          indicatorId={indicatorId}
          positionsOverTime={positionsOverTime}
        />
      )}
      {!simple && data && data.unit && data['unit-additional'] && (
        <div>
          <Text
            size="xxsmall"
            dangerouslySetInnerHTML={{
              __html: `<sup>*</sup> ${data['unit-additional'][locale] ||
                data['unit-additional'][DEFAULT_LOCALE]}`,
            }}
          />
        </div>
      )}
    </Styled>
  );
  /* eslint-enable react/no-danger */
}

KeyFull.propTypes = {
  layerInfo: PropTypes.object, // { config, data }
  config: PropTypes.object, // { config, data }
  positionsOverTime: PropTypes.object,
  id: PropTypes.string,
  indicatorId: PropTypes.string,
  chartDate: PropTypes.string,
  simple: PropTypes.bool,
  dark: PropTypes.bool,
  excludeEmpty: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(KeyFull);
