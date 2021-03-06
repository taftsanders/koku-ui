import { Report } from 'api/reports/report';
import endOfMonth from 'date-fns/end_of_month';
import format from 'date-fns/format';
import formatDate from 'date-fns/format';
import getDate from 'date-fns/get_date';
import getYear from 'date-fns/get_year';
import startOfMonth from 'date-fns/start_of_month';
import i18next from 'i18next';
import { ComputedReportItem, getComputedReportItems } from 'utils/computedReport/getComputedReportItems';
import { FormatOptions, unitLookupKey, ValueFormatter } from 'utils/formatValue';
import { SortDirection } from 'utils/sort';

export interface ChartDatum {
  childName?: string;
  key: string | number;
  name?: string | number;
  show?: boolean;
  tooltip?: string;
  units: string;
  x: string | number;
  y: number;
}

// The computed report cost or usage item
// eslint-disable-next-line no-shadow
export const enum ComputedReportItemType {
  cost = 'cost', // cost.total.value
  infrastructure = 'infrastructure', // infrastructure.total.value
  supplementary = 'supplementary', // supplementary.total.value
  usage = 'usage', // usage.value
}

// The computed report value
// eslint-disable-next-line no-shadow
export const enum ComputedReportItemValueType {
  none = 'none', // A value type is not used in this scenario (e.g., usage.value)
  markup = 'markup', // infrastructure.markup.value
  raw = 'raw', // infrastructure.raw.value
  total = 'total', // // infrastructure.total.value
  usage = 'usage', // infrastructure.usage.value
}

// eslint-disable-next-line no-shadow
export const enum ChartType {
  rolling,
  daily,
  monthly,
}

export function transformReport(
  report: Report,
  type: ChartType = ChartType.daily,
  key: any = 'date',
  reportItem: string = 'cost',
  reportItemValue: string = 'total'
): ChartDatum[] {
  if (!report) {
    return [];
  }
  const items = {
    idKey: key,
    report,
    reportItemValue,
    sortKey: 'id',
    sortDirection: SortDirection.desc,
  } as any;
  const computedItems = getComputedReportItems(items);
  let result;
  if (type === ChartType.daily || type === ChartType.monthly) {
    result = computedItems.map(i => createDatum(i[reportItem], i, key, reportItem));
  } else {
    result = computedItems.reduce<ChartDatum[]>((acc, d) => {
      const prevValue = acc.length ? acc[acc.length - 1].y : 0;
      return [...acc, createDatum(prevValue + d[reportItem], d, key, reportItem)];
    }, []);
  }
  return key === 'date' ? padComputedReportItems(result) : result;
}

export function createDatum<T extends ComputedReportItem>(
  value: number,
  computedItem: T,
  idKey = 'date',
  reportItem: string = 'cost'
): ChartDatum {
  const xVal = idKey === 'date' ? getDate(computedItem.id) : computedItem.label;
  const yVal = isFloat(value) ? parseFloat(value.toFixed(2)) : isInt(value) ? value : 0;
  return {
    x: xVal,
    y: value === null ? null : yVal, // For displaying "no data" labels in chart tooltips
    key: computedItem.id,
    name: computedItem.id,
    units: computedItem.units ? computedItem.units[reportItem] : undefined,
  };
}

// This pads computed report items with null datum objects, representing missing data at the begining and end of the
// data series. The remaining data is left as is to allow for extrapolation. This allows us to display a "no data"
// message in the tooltip, which helps distinguish between zero values and when there is no data available.
export function padComputedReportItems(datums: ChartDatum[]): ChartDatum[] {
  const result = [];
  if (!datums || datums.length === 0) {
    return result;
  }
  const firstDate = new Date(datums[0].key + 'T00:00:00');
  const lastDate = new Date(datums[datums.length - 1].key + 'T00:00:00');

  // Pad start for missing data
  let padDate = startOfMonth(firstDate);
  for (let i = padDate.getDate(); i < firstDate.getDate(); i++) {
    padDate.setDate(i);
    const id = formatDate(padDate, 'YYYY-MM-DD');
    result.push(createDatum(null, { id }, 'date', null));
  }

  // Fill middle with existing data
  result.push(...datums);

  // Pad end for missing data
  padDate = new Date(lastDate);
  for (let i = padDate.getDate() + 1; i <= endOfMonth(lastDate).getDate(); i++) {
    padDate.setDate(i);
    const id = formatDate(padDate, 'YYYY-MM-DD');
    result.push(createDatum(null, { id }, 'date', null));
  }
  return result;
}

export function getDatumDateRange(datums: ChartDatum[], offset: number = 0): [Date, Date] {
  if (!(datums && datums.length)) {
    const today = new Date();

    // If datums is empty, obtain the month based on offset (e.g., to show previous month in chart legends)
    if (offset) {
      today.setMonth(today.getMonth() - offset);
    }
    const firstOfMonth = startOfMonth(today);
    return [firstOfMonth, today];
  }

  const start = new Date(datums[0].key + 'T00:00:00');
  const end = new Date(datums[datums.length - 1].key + 'T00:00:00');
  return [start, end];
}

export function getDateRange(
  datums: ChartDatum[],
  firstOfMonth: boolean = true,
  lastOfMonth: boolean = false,
  offset: number = 0
): [Date, Date] {
  const [start, end] = getDatumDateRange(datums, offset);

  // Show the date range we are trying to cover (i.e., days 1-30/31)
  if (firstOfMonth && start.setDate) {
    start.setDate(1);
  }
  if (lastOfMonth && start.setDate) {
    const lastDate = endOfMonth(start).getDate();
    end.setDate(lastDate);
  }
  return [start, end];
}

export function getDateRangeString(
  datums: ChartDatum[],
  firstOfMonth: boolean = false,
  lastOfMonth: boolean = false,
  offset: number = 0
) {
  const [start, end] = getDateRange(datums, firstOfMonth, lastOfMonth, offset);

  return i18next.t(`chart.date_range`, {
    count: getDate(end),
    endDate: formatDate(end, 'DD'),
    month: Number(formatDate(start, 'M')) - 1,
    startDate: formatDate(start, 'DD'),
    year: getYear(end),
  });
}

export function getMonthRangeString(
  datums: ChartDatum[],
  key: string = 'chart.month_legend_label',
  offset: number = 0
): [string, string] {
  const [start, end] = getDateRange(datums, true, false, offset);

  return [
    i18next.t(key, {
      month: Number(formatDate(start, 'M')) - 1,
    }),
    i18next.t(key, {
      month: Number(formatDate(end, 'M')) - 1,
    }),
  ];
}

export function getMaxValue(datums: ChartDatum[]) {
  let max = 0;
  if (datums && datums.length) {
    datums.forEach(datum => {
      if (datum.y > max) {
        max = datum.y;
      }
    });
  }
  return max;
}

export function getTooltipContent(formatValue) {
  return function labelFormatter(value: number, unit: string = null, options: FormatOptions = {}) {
    const lookup = unitLookupKey(unit);
    switch (lookup) {
      case 'core-hours':
      case 'hrs':
      case 'gb':
      case 'gb-hours':
      case 'gb-mo':
      case 'vm-hours':
        return i18next.t(`unit_tooltips.${lookup}`, {
          value: `${formatValue(value, unit, options)}`,
        });
      default:
        return `${formatValue(value, unit, options)}`;
    }
  };
}

export function getTooltipLabel(
  datum: ChartDatum,
  formatValue: ValueFormatter,
  formatOptions?: FormatOptions,
  idKey: any = 'date',
  units?: string
) {
  if (!datum.key) {
    return '';
  }
  if (idKey === 'date') {
    const date = format(datum.key, 'DD MMM YYYY');
    return `${date} ${formatValue(datum.y, units ? units : datum.units, formatOptions)}`;
  }
  return datum.key.toString();
}

export function getCostRangeString(
  datums: ChartDatum[],
  key: string = 'chart.cost_legend_label',
  firstOfMonth: boolean = false,
  lastOfMonth: boolean = false,
  offset: number = 0
) {
  const [start, end] = getDateRange(datums, firstOfMonth, lastOfMonth, offset);

  return i18next.t(key, {
    count: getDate(end),
    endDate: formatDate(end, 'D'),
    month: Number(formatDate(start, 'M')) - 1,
    startDate: formatDate(start, 'D'),
    year: getYear(end),
  });
}

export function getUsageRangeString(
  datums: ChartDatum[],
  key: string = 'chart.usage_legend_label',
  firstOfMonth: boolean = false,
  lastOfMonth: boolean = false,
  offset: number = 0
) {
  return getCostRangeString(datums, key, firstOfMonth, lastOfMonth, offset);
}

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
