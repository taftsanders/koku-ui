import { Button, ButtonVariant, FormGroup, Grid, GridItem, Radio, Switch } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MetricHash } from 'api/metrics';
import { RateInputBase } from 'pages/costModels/components/inputs/rateInput';
import { Selector } from 'pages/costModels/components/inputs/selector';
import { SimpleInput } from 'pages/costModels/components/inputs/simpleInput';
import React from 'react';
import { I18n } from 'react-i18next';

import { TaggingRatesForm } from './taggingRatesForm';
import { UseRateData } from './useRateForm';

interface RateFormProps {
  rateFormData: UseRateData;
  metricsHash: MetricHash;
}

export const RateForm: React.FunctionComponent<RateFormProps> = ({ metricsHash, rateFormData }) => {
  const {
    step,
    description,
    metric,
    measurement: { value: measurement, isDirty: measurementDirty },
    calculation,
    rateKind,
    taggingRates: {
      tagKey: { value: tagKey, isDirty: isTagKeyDirty },
      defaultTag,
      tagValues,
    },
    tieredRates: {
      0: { value: regular, isDirty: regularDirty },
    },
    onTagBlur,
    onRegularBlur,
    setDescription,
    setMetric,
    setMeasurement,
    setCalculation,
    setRegular,
    toggleTaggingRate,
    setTagKey,
    updateTag,
    updateDefaultTag,
    removeTag,
    addTag,
    errors,
  } = rateFormData;
  const metricOptions = React.useMemo(() => {
    return Object.keys(metricsHash);
  }, [metricsHash]);
  const measurementOptions = React.useMemo(() => {
    if (!metricOptions.includes(metric)) {
      return [];
    }
    return Object.keys(metricsHash[metric]);
  }, [metricOptions, metric]);
  const style = { width: '360px' };
  const addStyle = {
    paddingLeft: '0',
    textAlign: 'left',
  } as React.CSSProperties;
  return (
    <>
      <SimpleInput
        style={style}
        id="description"
        label="cost_models.add_rate_form.description"
        value={description}
        onChange={setDescription}
      />
      <Grid hasGutter>
        <GridItem span={6}>
          <Selector
            isRequired
            style={style}
            id="metric"
            label="cost_models.add_rate_form.metric_select"
            value={metric}
            onChange={setMetric}
            options={[
              {
                label: 'cost_models.add_rate_form.default_option',
                value: '',
                isDisabled: true,
              },
              ...metricOptions.map(opt => {
                return {
                  label: opt,
                  value: opt,
                  isDisabled: false,
                };
              }),
            ]}
          />
        </GridItem>
        {step === 'initial' ? null : (
          <GridItem span={6}>
            <Selector
              isRequired
              helperTextInvalid={errors.measurement}
              isInvalid={errors.measurement && measurementDirty}
              style={style}
              id="measurement"
              label="cost_models.add_rate_form.measurement_select"
              value={measurement}
              onChange={setMeasurement}
              options={[
                {
                  label: 'cost_models.add_rate_form.default_option',
                  value: '',
                  isDisabled: true,
                },
                ...measurementOptions.map(opt => {
                  return {
                    value: opt,
                    label: opt,
                    isDisabled: false,
                  };
                }),
              ]}
            />
          </GridItem>
        )}
      </Grid>
      {step === 'set_rate' ? (
        <>
          <I18n>
            {t => {
              return (
                <>
                  <FormGroup
                    isInline
                    style={style}
                    fieldId="calculation"
                    label={t('cost_models.add_rate_form.calculation_type')}
                  >
                    <Radio
                      name="calculation"
                      id="calculation_infra"
                      label={t('cost_models.add_rate_form.infrastructure')}
                      isChecked={calculation === 'Infrastructure'}
                      onChange={() => setCalculation('Infrastructure')}
                    />
                    <Radio
                      name="calculation"
                      id="calculation_suppl"
                      label={t('cost_models.add_rate_form.supplementary')}
                      isChecked={calculation === 'Supplementary'}
                      onChange={() => setCalculation('Supplementary')}
                    />
                  </FormGroup>
                  <Switch
                    aria-label="Enter rate by tag"
                    label={t('cost_models.add_rate_form.rate_switch')}
                    isChecked={rateKind === 'tagging'}
                    onChange={toggleTaggingRate}
                  />
                </>
              );
            }}
          </I18n>
          {rateKind === 'regular' ? (
            <RateInputBase
              style={style}
              helperTextInvalid={errors.tieredRates}
              validated={errors.tieredRates && regularDirty ? 'error' : 'default'}
              value={regular}
              onChange={setRegular}
              onBlur={onRegularBlur}
              fieldId="regular-rate"
            />
          ) : (
            <>
              <SimpleInput
                isRequired
                style={style}
                value={tagKey}
                onChange={setTagKey}
                id="tag-key"
                label="cost_models.add_rate_form.tag_key"
                validated={errors.tagKey && isTagKeyDirty ? 'error' : 'default'}
                helperTextInvalid={errors.tagKey}
              />
              <TaggingRatesForm
                onTagBlur={onTagBlur}
                errors={{ tagValues: errors.tagValues, tagValueValues: errors.tagValueValues }}
                updateDefaultTag={updateDefaultTag}
                defaultTag={defaultTag}
                tagValues={tagValues}
                updateTag={updateTag}
                removeTag={removeTag}
              />
              <Button data-testid="add_more" style={addStyle} variant={ButtonVariant.link} onClick={addTag}>
                <PlusCircleIcon /> Add more tags
              </Button>
            </>
          )}
        </>
      ) : null}
    </>
  );
};
