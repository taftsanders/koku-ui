import {
  FormGroup,
  InputGroup,
  InputGroupText,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextInput,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { Form } from 'components/forms/form';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import { CostModelContext } from './context';

interface MarkupValidationState {
  isValid: boolean;
}

class Markup extends React.Component<InjectedTranslateProps, MarkupValidationState> {
  public state = {
    isValid: true,
  };

  public render() {
    const { t } = this.props;
    const { isValid } = this.state;

    return (
      <CostModelContext.Consumer>
        {({ onMarkupChange, markup }) => {
          return (
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h2" size="xl">
                  {t('cost_models_wizard.markup.title')}
                </Title>
              </StackItem>
              <StackItem>
                <TextContent>
                  <Text component={TextVariants.h6}>{t('cost_models_wizard.markup.sub_title')}</Text>
                </TextContent>
              </StackItem>
              <StackItem>
                <Form>
                  <FormGroup
                    label={t('cost_models_wizard.markup.markup_label')}
                    fieldId="markup"
                    helperTextInvalid={t('cost_models_wizard.markup.invalid_markup_text')}
                    validated={isValid ? 'default' : 'error'}
                  >
                    <InputGroup style={{ width: '150px' }}>
                      <TextInput
                        type="text"
                        id="markup"
                        name="markup"
                        value={markup}
                        onBlur={() => {
                          this.setState({ isValid: !isNaN(Number(markup)) });
                        }}
                        onChange={(value: string) => {
                          onMarkupChange(value);
                          if (value !== '-') {
                            this.setState({ isValid: !isNaN(Number(value)) });
                          }
                        }}
                        validated={isValid ? 'default' : 'error'}
                      />
                      <InputGroupText style={{ borderLeft: '0' }}>%</InputGroupText>
                    </InputGroup>
                  </FormGroup>
                </Form>
              </StackItem>
            </Stack>
          );
        }}
      </CostModelContext.Consumer>
    );
  }
}

export default translate()(Markup);
