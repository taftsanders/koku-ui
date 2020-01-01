jest
  .mock('date-fns/start_of_month')
  .mock('date-fns/get_date')
  .mock('date-fns/format')
  .mock('date-fns/get_month');

import { OcpCloudReportType } from 'api/ocpCloudReports';
import { ChartType } from 'components/charts/commonChart/chartUtils';
import formatDate from 'date-fns/format';
import getDate from 'date-fns/get_date';
import getMonth from 'date-fns/get_month';
import startOfMonth from 'date-fns/start_of_month';
import { shallow } from 'enzyme';
import React from 'react';
import { FetchStatus } from 'store/common';
import { OcpCloudDashboardTab } from 'store/ocpCloudDashboard';
import { mockDate } from 'testUtils';
import {
  getIdKeyForTab,
  OcpCloudDashboardWidgetBase,
  OcpCloudDashboardWidgetProps,
} from './ocpCloudDashboardWidget';

const props: OcpCloudDashboardWidgetProps = {
  widgetId: 1,
  id: 1,
  t: jest.fn(v => v),
  current: { data: [] },
  previous: { data: [] },
  tabs: { data: [] },
  fetchReports: jest.fn(),
  updateTab: jest.fn(),
  titleKey: 'title',
  reportType: OcpCloudReportType.cost,
  trend: {
    type: ChartType.rolling,
    titleKey: 'trend title',
    formatOptions: {},
  },
  status: FetchStatus.none,
  currentQuery: '',
  previousQuery: '',
  tabsQuery: '',
  details: {
    labelKey: 'detail label',
    labelKeyContext: 'label context',
    descriptionKeyRange: 'detail description range',
    descriptionKeySingle: 'detail description single',
    formatOptions: {},
  },
  topItems: { formatOptions: {} },
  availableTabs: [OcpCloudDashboardTab.projects],
  currentTab: OcpCloudDashboardTab.projects,
};

const getDateMock = getDate as jest.Mock;
const formatDateMock = formatDate as jest.Mock;
const startOfMonthMock = startOfMonth as jest.Mock;
const getMonthMock = getMonth as jest.Mock;

beforeEach(() => {
  mockDate();
  getDateMock.mockReturnValue(1);
  formatDateMock.mockReturnValue('formated date');
  startOfMonthMock.mockReturnValue(1);
  getMonthMock.mockReturnValue(1);
});

test('reports are fetched on mount', () => {
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(props.fetchReports).toBeCalledWith(props.widgetId);
});

test('title is translated', () => {
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(getTranslateCallForKey(props.titleKey)).toMatchSnapshot();
});

test('detail label is translated', () => {
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(getTranslateCallForKey(props.details.unitsKey)).toMatchSnapshot();
});

test('subtitle is translated with single date', () => {
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(
    getTranslateCallForKey('ocp_on_cloud_dashboard.widget_subtitle')
  ).toMatchSnapshot();
});

test('subtitle is translated with date range', () => {
  getDateMock.mockReturnValueOnce(2);
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(
    getTranslateCallForKey('ocp_on_cloud_dashboard.widget_subtitle')
  ).toMatchSnapshot();
});

test('trend title is translated', () => {
  shallow(<OcpCloudDashboardWidgetBase {...props} />);
  expect(getTranslateCallForKey(props.trend.titleKey)).toMatchSnapshot();
});

test('id key for dashboard tab is the tab name in singular form', () => {
  [
    OcpCloudDashboardTab.clusters,
    OcpCloudDashboardTab.nodes,
    OcpCloudDashboardTab.projects,
  ].forEach(value => {
    expect(getIdKeyForTab(value)).toEqual(value.slice(0, -1));
  });

  expect(getIdKeyForTab(OcpCloudDashboardTab.projects)).toEqual('project');
});

function getTranslateCallForKey(key: string) {
  return (props.t as jest.Mock).mock.calls.find(([k]) => k === key);
}