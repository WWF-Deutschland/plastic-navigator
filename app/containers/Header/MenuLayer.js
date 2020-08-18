import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { Layer, Button, Box, ResponsiveContext, Heading } from 'grommet';
import { Close } from 'components/Icons';

import LocaleToggle from 'containers/LocaleToggle';

import { isMaxSize } from 'utils/responsive';

import { LOCALE_TOGGLE } from 'config';
import commonMessages from 'messages';
import messages from './messages';

const Section = styled.div`
  margin-bottom: 30px;
`;
const SectionTitle = styled(p => <Heading level="5" {...p} />)`
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 10px;
`;
const Primary = styled(props => <Button {...props} plain />)`
  color: white !important;
  background: transparent !important;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  padding: ${({ theme }) => theme.global.edgeSize.small} 0;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.global.colors.dark};
  &:last-child {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.global.colors.dark};
  }
}`;

// prettier-ignore
const Secondary = styled(props => <Button {...props} plain fill="horizontal" />)`
  padding: ${({ theme }) => theme.global.edgeSize.small} 0;
  color: ${({ theme }) => theme.global.colors.white};
  background: transparent;
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.global.colors.dark};
  &:last-child {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.global.colors.dark};
  }
`;
const ButtonClose = styled(p => (
  <Button icon={<Close color="white" />} plain {...p} />
))`
  position: absolute;
  top: 0;
  right: 6px;
  padding: 5px;
  width: 40px;
  height: 50px;
`;

function MenuLayer({ navPage, onClose, pagesArray, modulesArray, nav, route }) {
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layer full>
          <Box
            background="black"
            fill
            flex={false}
            pad={{ top: 'xlarge', bottom: 'small', horizontal: 'medium' }}
            responsive={false}
          >
            <ButtonClose onClick={() => onClose()} />
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.navSectionModules} />
              </SectionTitle>
              <Box>
                {modulesArray.map(m => (
                  <Primary
                    key={m.key}
                    onClick={() => {
                      onClose();
                      nav(m.path);
                    }}
                    active={route === m.path}
                  >
                    <Box direction="row" align="center" gap="ms">
                      <>{m.iconS}</>
                      <FormattedMessage
                        {...commonMessages[`module_${m.key}`]}
                      />
                    </Box>
                  </Primary>
                ))}
              </Box>
            </Section>
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.navSectionPages} />
              </SectionTitle>
              {pagesArray.map(p => (
                <Secondary
                  key={p.key}
                  onClick={() => {
                    onClose();
                    navPage(p.key);
                  }}
                  label={
                    <FormattedMessage {...commonMessages[`page_${p.key}`]} />
                  }
                />
              ))}
            </Section>
            {isMaxSize(size, 'small') && LOCALE_TOGGLE && (
              <Section>
                <SectionTitle>
                  <FormattedMessage {...messages.navSectionLanguages} />
                </SectionTitle>
                <LocaleToggle list />
              </Section>
            )}
          </Box>
        </Layer>
      )}
    </ResponsiveContext.Consumer>
  );
}

MenuLayer.propTypes = {
  nav: PropTypes.func,
  navPage: PropTypes.func,
  onClose: PropTypes.func,
  pagesArray: PropTypes.array,
  route: PropTypes.string,
  modulesArray: PropTypes.array,
};

export default MenuLayer;
