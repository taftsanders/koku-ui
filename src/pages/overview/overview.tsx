import {
  Button,
  ButtonType,
  ButtonVariant,
  Tab,
  Tabs,
  Title,
  TitleSize,
} from '@patternfly/react-core';
import { Providers, ProviderType } from 'api/providers';
import { getProvidersQuery } from 'api/providersQuery';
import { AxiosError } from 'axios';
import { ErrorState } from 'components/state/errorState/errorState';
import { LoadingState } from 'components/state/loadingState/loadingState';
import { NoProvidersState } from 'components/state/noProvidersState/noProvidersState';
import AwsDashboard from 'pages/awsDashboard/awsDashboard';
import OcpDashboard from 'pages/ocpDashboard/ocpDashboard';
import OcpOnAwsDashboard from 'pages/ocpOnAwsDashboard/ocpOnAwsDashboard';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { onboardingActions } from 'store/onboarding';
import {
  awsProvidersQuery,
  ocpProvidersQuery,
  providersSelectors,
} from 'store/providers';
import { uiActions } from 'store/ui';
import { getTestProps, testIds } from 'testIds';

const enum OverviewTab {
  aws = 'aws',
  ocp = 'ocp',
  ocpOnAws = 'ocpOnAws',
}

export const getIdKeyForTab = (tab: OverviewTab) => {
  switch (tab) {
    case OverviewTab.aws:
      return 'aws';
    case OverviewTab.ocp:
      return 'ocp';
    case OverviewTab.ocpOnAws:
      return 'ocpOnAws';
  }
};

type OverviewOwnProps = RouteComponentProps<{}> & InjectedTranslateProps;

interface OverviewStateProps {
  awsProviders: Providers;
  awsProvidersError: AxiosError;
  awsProvidersFetchStatus: FetchStatus;
  awsProvidersQueryString: string;
  availableTabs?: OverviewTab[];
  currentTab?: OverviewTab;
  ocpProviders: Providers;
  ocpProvidersError: AxiosError;
  ocpProvidersFetchStatus: FetchStatus;
  ocpProvidersQueryString: string;
}

interface OverviewDispatchProps {
  openProvidersModal: typeof uiActions.openProvidersModal;
}

type OverviewProps = OverviewOwnProps &
  OverviewStateProps &
  OverviewDispatchProps;

class OverviewBase extends React.Component<OverviewProps> {
  public state = {
    activeTabKey: 0,
  };

  private getAddSourceButton = () => {
    const { openProvidersModal, t } = this.props;

    return (
      <Button
        {...getTestProps(testIds.providers.add_btn)}
        onClick={openProvidersModal}
        type={ButtonType.submit}
        variant={ButtonVariant.secondary}
      >
        {t('providers.add_source')}
      </Button>
    );
  };

  private getTab = (tab: OverviewTab, index: number) => {
    return (
      <Tab
        eventKey={index}
        key={`${getIdKeyForTab(tab)}-tab`}
        title={this.getTabTitle(tab)}
      >
        {this.getTabItem(tab, index)}
      </Tab>
    );
  };

  private getTabItem = (tab: OverviewTab, index: number) => {
    const { activeTabKey } = this.state;
    const currentTab = getIdKeyForTab(tab);

    if (currentTab === OverviewTab.ocpOnAws) {
      return activeTabKey === index ? <OcpOnAwsDashboard /> : null;
    } else if (currentTab === OverviewTab.ocp) {
      return activeTabKey === index ? <OcpDashboard /> : null;
    } else if (currentTab === OverviewTab.aws) {
      return activeTabKey === index ? <AwsDashboard /> : null;
    } else {
      return null;
    }
  };

  private getTabs = () => {
    const { awsProviders, ocpProviders } = this.props;
    const { activeTabKey } = this.state;
    const availableTabs = [];

    if (
      awsProviders &&
      awsProviders.meta &&
      awsProviders.meta.count &&
      (ocpProviders && ocpProviders.meta && ocpProviders.meta.count)
    ) {
      availableTabs.push(OverviewTab.ocpOnAws);
    }
    if (ocpProviders && ocpProviders.meta && ocpProviders.meta.count) {
      availableTabs.push(OverviewTab.ocp);
    }
    if (awsProviders && awsProviders.meta && awsProviders.meta.count) {
      availableTabs.push(OverviewTab.aws);
    }

    return (
      <Tabs activeKey={activeTabKey} onSelect={this.handleTabClick}>
        {availableTabs.map((tab, index) => this.getTab(tab, index))}
      </Tabs>
    );
  };

  private getTabTitle = (tab: OverviewTab) => {
    const { t } = this.props;

    if (tab === OverviewTab.aws) {
      return t('overview.aws');
    } else if (tab === OverviewTab.ocp) {
      return t('overview.ocp');
    } else if (tab === OverviewTab.ocpOnAws) {
      return t('overview.ocp_on_aws');
    }
  };

  private handleTabClick = (event, tabIndex) => {
    this.setState({
      activeTabKey: tabIndex,
    });
  };

  public render() {
    const {
      awsProviders,
      awsProvidersError,
      awsProvidersFetchStatus,
      ocpProviders,
      ocpProvidersError,
      ocpProvidersFetchStatus,
      t,
    } = this.props;

    const error = awsProvidersError || ocpProvidersError;
    const isLoading =
      awsProvidersFetchStatus === FetchStatus.inProgress ||
      ocpProvidersFetchStatus === FetchStatus.inProgress;
    const noAwsProviders =
      awsProviders !== undefined &&
      awsProviders.meta !== undefined &&
      awsProviders.meta.count === 0 &&
      awsProvidersFetchStatus === FetchStatus.complete;
    const noOcpProviders =
      ocpProviders !== undefined &&
      ocpProviders.meta !== undefined &&
      ocpProviders.meta.count === 0 &&
      ocpProvidersFetchStatus === FetchStatus.complete;
    const noProviders = noAwsProviders && noOcpProviders;

    return (
      <>
        <section className="pf-l-page-header pf-c-page-header pf-l-page__main-section pf-c-page__main-section pf-m-light">
          <header className="pf-u-display-flex pf-u-justify-content-space-between pf-u-align-items-center">
            <Title size={TitleSize.lg}>{t('overview.title')}</Title>
            {this.getAddSourceButton()}
          </header>
        </section>
        <section
          className="pf-l-page__main-section pf-c-page__main-section"
          page-type="cost-management-overview"
        >
          {Boolean(error) ? (
            <ErrorState error={error} />
          ) : Boolean(noProviders) ? (
            <NoProvidersState />
          ) : Boolean(isLoading) ? (
            <LoadingState />
          ) : (
            this.getTabs()
          )}
        </section>
      </>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  OverviewOwnProps,
  OverviewStateProps
>(state => {
  const awsProvidersQueryString = getProvidersQuery(awsProvidersQuery);
  const awsProviders = providersSelectors.selectProviders(
    state,
    ProviderType.aws,
    awsProvidersQueryString
  );
  const awsProvidersError = providersSelectors.selectProvidersError(
    state,
    ProviderType.aws,
    awsProvidersQueryString
  );
  const awsProvidersFetchStatus = providersSelectors.selectProvidersFetchStatus(
    state,
    ProviderType.aws,
    awsProvidersQueryString
  );

  const ocpProvidersQueryString = getProvidersQuery(ocpProvidersQuery);
  const ocpProviders = providersSelectors.selectProviders(
    state,
    ProviderType.ocp,
    ocpProvidersQueryString
  );
  const ocpProvidersError = providersSelectors.selectProvidersError(
    state,
    ProviderType.ocp,
    ocpProvidersQueryString
  );
  const ocpProvidersFetchStatus = providersSelectors.selectProvidersFetchStatus(
    state,
    ProviderType.ocp,
    ocpProvidersQueryString
  );

  return {
    awsProviders,
    awsProvidersError,
    awsProvidersFetchStatus,
    awsProvidersQueryString,
    ocpProviders,
    ocpProvidersError,
    ocpProvidersFetchStatus,
    ocpProvidersQueryString,
  };
});

const Overview = translate()(
  connect(
    mapStateToProps,
    {
      openProvidersModal: onboardingActions.openModal,
    }
  )(OverviewBase)
);

export default Overview;
