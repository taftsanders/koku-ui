import { getQuery } from 'api/ocpCloudQuery';
import { OcpCloudReport, OcpCloudReportType } from 'api/ocpCloudReports';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import {
  ocpCloudReportsActions,
  ocpCloudReportsSelectors,
} from 'store/ocpCloudReports';
import { ComputedOcpCloudReportItem } from 'utils/getComputedOcpCloudReportItems';

interface DetailsTagViewOwnProps {
  groupBy: string;
  item: ComputedOcpCloudReportItem;
  project: string | number;
}

interface DetailsTagViewStateProps {
  queryString?: string;
  report?: OcpCloudReport;
  reportFetchStatus?: FetchStatus;
}

interface DetailsTagViewDispatchProps {
  fetchReport?: typeof ocpCloudReportsActions.fetchReport;
}

type DetailsTagViewProps = DetailsTagViewOwnProps &
  DetailsTagViewStateProps &
  DetailsTagViewDispatchProps &
  InjectedTranslateProps;

const reportType = OcpCloudReportType.tag;

class DetailsTagViewBase extends React.Component<DetailsTagViewProps> {
  public componentDidMount() {
    const { fetchReport, queryString } = this.props;
    fetchReport(reportType, queryString);
  }

  public componentDidUpdate(prevProps: DetailsTagViewProps) {
    const { fetchReport, queryString } = this.props;
    if (prevProps.queryString !== queryString) {
      fetchReport(reportType, queryString);
    }
  }

  private getTags = () => {
    const { report } = this.props;
    const tags = [];

    if (report) {
      for (const tag of report.data) {
        for (const val of tag.values) {
          tags.push(`${(tag as any).key}: ${val}`);
        }
      }
    }
    return tags;
  };

  public render() {
    const tags = this.getTags();

    return tags.map((tag, index) => <div key={`tag-${index}`}>{tag}</div>);
  }
}

const mapStateToProps = createMapStateToProps<
  DetailsTagViewOwnProps,
  DetailsTagViewStateProps
>((state, { project }) => {
  const queryString = getQuery({
    filter: {
      project,
      resolution: 'monthly',
      time_scope_units: 'month',
      time_scope_value: -1,
    },
  });
  const report = ocpCloudReportsSelectors.selectReport(
    state,
    reportType,
    queryString
  );
  const reportFetchStatus = ocpCloudReportsSelectors.selectReportFetchStatus(
    state,
    reportType,
    queryString
  );
  return {
    queryString,
    report,
    reportFetchStatus,
  };
});

const mapDispatchToProps: DetailsTagViewDispatchProps = {
  fetchReport: ocpCloudReportsActions.fetchReport,
};

const DetailsTagView = translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DetailsTagViewBase)
);

export { DetailsTagView, DetailsTagViewProps };