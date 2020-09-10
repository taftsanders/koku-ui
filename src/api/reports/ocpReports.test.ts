jest.mock('axios');

import { ReportType } from 'api/reports/report';
import axios from 'axios';

import { runReport } from './ocpReports';

test('api run reports calls axios get', () => {
  const query = 'filter[resolution]=daily';
  runReport(ReportType.cost, query);
  expect(axios.get).toBeCalledWith(`reports/openshift/costs/?${query}`);
});
