/**
 *
 * PolicyOptionList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Button, Text } from 'grommet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { groupBy } from 'lodash/collection';
import { DEFAULT_LOCALE } from 'i18n';

import messages from './messages';

// prettier-ignore
const DropOption = styled(p => <Button plain {...p} />)`
  text-align: left;
  padding: 2px ${({ theme }) => theme.global.edgeSize.small};
  display: block;
  width: 100%;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  opacity: 1;
  color: ${({ theme }) => theme.global.colors.black };
  border-top: 1px solid ${({ theme }) => theme.global.colors.border.light };
  font-size: ${({ theme }) => theme.text.xsmall.size};
  min-width: 140px;
  &:last-child {
    border-bottom: 1px solid
      ${({ theme, noBorderLast }) => noBorderLast
    ? 'transparent'
    : theme.global.colors.border.light};
  }
  &:hover {
    text-decoration: ${({ active }) => (active ? 'none' : 'underline')};
  }
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 4px 32px 4px 12px;
    font-size: ${({ theme }) => theme.text.medium.size};
  }
`;
const GroupLabelWrap = styled(p => <Box margin={{ top: 'medium' }} {...p} />)`
  padding: 2px ${({ theme }) => theme.global.edgeSize.small};
  @media (min-width: ${({ theme }) => theme.sizes.medium.minpx}) {
    padding: 4px 32px 4px 12px;
  }
`;
const GroupLabel = styled(p => (
  <Text size="small" color="textSecondary" {...p} />
))`
  font-family: 'wwfregular';
  text-transform: uppercase;
`;

export function PolicyOptionList({ active, options, onSelect, intl }) {
  const { locale } = intl;
  const optionGroups = groupBy(options, option =>
    option.archived ? 'archived' : 'regular',
  );
  return (
    <Box margin="small" background="white" elevation="small">
      {options && optionGroups.regular && (
        <Box>
          <GroupLabelWrap>
            <GroupLabel>
              <FormattedMessage {...messages.selectCurrentTopics} />
            </GroupLabel>
          </GroupLabelWrap>
          {optionGroups.regular.map(option => (
            <DropOption
              key={option.id}
              onClick={() => onSelect(option.id)}
              active={active === option.id}
              disabled={active === option.id}
            >
              {option[`short_${locale}`] || option[`short_${DEFAULT_LOCALE}`]}
            </DropOption>
          ))}
        </Box>
      )}
      {options && optionGroups.archived && (
        <Box>
          <GroupLabelWrap>
            <GroupLabel>
              <FormattedMessage {...messages.selectArchivedTopics} />
            </GroupLabel>
          </GroupLabelWrap>
          {optionGroups.archived.map(option => (
            <DropOption
              key={option.id}
              onClick={() => onSelect(option.id)}
              active={active === option.id}
              disabled={active === option.id}
            >
              {option[`short_${locale}`] || option[`short_${DEFAULT_LOCALE}`]}
            </DropOption>
          ))}
        </Box>
      )}
    </Box>
  );
}
PolicyOptionList.propTypes = {
  onSelect: PropTypes.func,
  active: PropTypes.string,
  options: PropTypes.array,
  intl: intlShape,
};
export default injectIntl(PolicyOptionList);
