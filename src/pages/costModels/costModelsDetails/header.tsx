import { Button, ButtonVariant, Popover, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { TranslationFunction } from 'i18next';
import React from 'react';
import { I18n } from 'react-i18next';

import { styles } from './costModelsDetails.styles';

interface HeaderProps {
  title: string;
  popover: string;
}

const translateHeaderProps = (t: TranslationFunction, props: HeaderProps) => {
  return {
    title: t(props.title),
    popover: t(props.popover),
  };
};

const Header: React.FunctionComponent<HeaderProps> = props => {
  return (
    <I18n>
      {t => {
        const translatedProps = translateHeaderProps(t, props);
        const { title, popover } = translatedProps;
        return (
          <header style={styles.header}>
            <Title headingLevel="h2" style={styles.title} size="2xl">
              {title}
              <Popover aria-label={'cost-models-popover'} bodyContent={popover} enableFlip>
                <Button variant={ButtonVariant.plain}>
                  <OutlinedQuestionCircleIcon />
                </Button>
              </Popover>
            </Title>
          </header>
        );
      }}
    </I18n>
  );
};

export default Header;
