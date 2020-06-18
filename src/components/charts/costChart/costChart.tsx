import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  createContainer,
  getInteractiveLegendEvents,
  getInteractiveLegendItemStyles,
} from '@patternfly/react-charts';
import { default as ChartTheme } from 'components/charts/chartTheme';
import { chartOverride } from 'components/charts/common/chart.styles';
import {
  getCostRangeString,
  getDateRange,
  getMaxValue,
  getTooltipContent,
} from 'components/charts/common/chartUtils';
import getDate from 'date-fns/get_date';
import React from 'react';
import { FormatOptions, ValueFormatter } from 'utils/formatValue';
import { DomainTuple, VictoryStyleInterface } from 'victory-core';
import { chartStyles } from './costChart.styles';

interface CostChartProps {
  adjustContainerHeight?: boolean;
  containerHeight?: number;
  currentCostData: any;
  currentInfrastructureCostData?: any;
  formatDatumValue?: ValueFormatter;
  formatDatumOptions?: FormatOptions;
  height?: number;
  legendItemsPerRow?: number;
  padding?: any;
  previousInfrastructureCostData?: any;
  previousCostData?: any;
  title?: string;
}

interface TrendChartData {
  name?: string;
}

interface TrendChartLegendItem {
  name?: string;
  symbol?: any;
}

interface TrendChartSeries {
  childName?: string;
  data?: [TrendChartData];
  legendItem?: TrendChartLegendItem;
  style?: VictoryStyleInterface;
}

interface State {
  hiddenSeries: Set<number>;
  series?: TrendChartSeries[];
  width: number;
}

class CostChart extends React.Component<CostChartProps, State> {
  private containerRef = React.createRef<HTMLDivElement>();
  public navToggle: any;
  public state: State = {
    hiddenSeries: new Set(),
    width: 0,
  };

  public componentDidMount() {
    setTimeout(() => {
      if (this.containerRef.current) {
        this.setState({ width: this.containerRef.current.clientWidth });
      }
      window.addEventListener('resize', this.handleResize);
      this.navToggle = insights.chrome.on(
        'NAVIGATION_TOGGLE',
        this.handleNavToggle
      );
    });
    this.initDatum();
  }

  public componentDidUpdate(prevProps: CostChartProps) {
    if (
      prevProps.currentInfrastructureCostData !==
        this.props.currentInfrastructureCostData ||
      prevProps.currentCostData !== this.props.currentCostData ||
      prevProps.previousInfrastructureCostData !==
        this.props.previousInfrastructureCostData ||
      prevProps.previousCostData !== this.props.previousCostData
    ) {
      this.initDatum();
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.navToggle) {
      this.navToggle();
    }
  }

  private initDatum = () => {
    const {
      currentInfrastructureCostData,
      currentCostData,
      previousInfrastructureCostData,
      previousCostData,
    } = this.props;

    const costKey = 'chart.cost_legend_label';
    const costInfrastructureKey = 'chart.cost_infrastructure_legend_label';

    // Show all legends, regardless of length -- https://github.com/project-koku/koku-ui/issues/248

    this.setState({
      series: [
        {
          childName: 'previousCost',
          data: previousCostData,
          legendItem: {
            name: getCostRangeString(previousCostData, costKey, true, true, 1),
            symbol: {
              fill: chartStyles.previousColorScale[0],
              type: 'minus',
            },
          },
          style: {
            data: {
              ...chartStyles.previousCostData,
              stroke: chartStyles.previousColorScale[0],
            },
          },
        },
        {
          childName: 'currentCost',
          data: currentCostData,
          legendItem: {
            name: getCostRangeString(currentCostData, costKey, true, false),
            symbol: {
              fill: chartStyles.currentColorScale[0],
              type: 'minus',
            },
          },
          style: {
            data: {
              ...chartStyles.currentCostData,
              stroke: chartStyles.currentColorScale[0],
            },
          },
        },
        {
          childName: 'previousInfrastructureCost',
          data: previousInfrastructureCostData,
          legendItem: {
            name: getCostRangeString(
              previousInfrastructureCostData,
              costInfrastructureKey,
              true,
              true,
              1
            ),
            symbol: {
              fill: chartStyles.previousColorScale[1],
              type: 'dash',
            },
          },
          style: {
            data: {
              ...chartStyles.previousInfrastructureCostData,
              stroke: chartStyles.previousColorScale[1],
            },
          },
        },
        {
          childName: 'currentInfrastructureCost',
          data: currentInfrastructureCostData,
          legendItem: {
            name: getCostRangeString(
              currentInfrastructureCostData,
              costInfrastructureKey,
              true,
              false
            ),
            symbol: {
              fill: chartStyles.currentColorScale[1],
              type: 'dash',
            },
          },
          style: {
            data: {
              ...chartStyles.currentInfrastructureCostData,
              stroke: chartStyles.currentColorScale[1],
            },
          },
        },
      ],
    });
  };

  private handleNavToggle = () => {
    setTimeout(this.handleResize, 500);
  };

  private handleResize = () => {
    if (this.containerRef.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  private getChart = (series: TrendChartSeries, index: number) => {
    const { hiddenSeries } = this.state;
    return (
      <ChartArea
        data={!hiddenSeries.has(index) ? series.data : [{ y: null }]}
        interpolation="monotoneX"
        key={series.childName}
        name={series.childName}
        style={series.style}
      />
    );
  };

  private getDomain() {
    const {
      currentInfrastructureCostData,
      currentCostData,
      previousInfrastructureCostData,
      previousCostData,
    } = this.props;
    const domain: { x: DomainTuple; y?: DomainTuple } = { x: [1, 31] };

    const maxCurrentInfrastructure = currentInfrastructureCostData
      ? getMaxValue(currentInfrastructureCostData)
      : 0;
    const maxCurrentUsage = currentCostData ? getMaxValue(currentCostData) : 0;
    const maxPreviousInfrastructure = previousInfrastructureCostData
      ? getMaxValue(previousInfrastructureCostData)
      : 0;
    const maxPreviousUsage = previousCostData
      ? getMaxValue(previousCostData)
      : 0;
    const maxValue = Math.max(
      maxCurrentInfrastructure,
      maxCurrentUsage,
      maxPreviousInfrastructure,
      maxPreviousUsage
    );
    const max = maxValue > 0 ? Math.ceil(maxValue + maxValue * 0.1) : 0;

    if (max > 0) {
      domain.y = [0, max];
    }
    return domain;
  }

  private getEndDate() {
    const {
      currentInfrastructureCostData,
      currentCostData,
      previousInfrastructureCostData,
      previousCostData,
    } = this.props;
    const currentInfrastructureDate = currentInfrastructureCostData
      ? getDate(getDateRange(currentInfrastructureCostData, true, true)[1])
      : 0;
    const currentUsageDate = currentCostData
      ? getDate(getDateRange(currentCostData, true, true)[1])
      : 0;
    const previousInfrastructureDate = previousInfrastructureCostData
      ? getDate(getDateRange(previousInfrastructureCostData, true, true)[1])
      : 0;
    const previousUsageDate = previousCostData
      ? getDate(getDateRange(previousCostData, true, true)[1])
      : 0;

    return currentInfrastructureDate > 0 ||
      currentUsageDate > 0 ||
      previousInfrastructureDate > 0 ||
      previousUsageDate > 0
      ? Math.max(
          currentInfrastructureDate,
          currentUsageDate,
          previousInfrastructureDate,
          previousUsageDate
        )
      : 31;
  }

  private getLegend = () => {
    const { legendItemsPerRow } = this.props;
    const { width } = this.state;

    // Todo: use PF legendAllowWrap feature
    const itemsPerRow = legendItemsPerRow
      ? legendItemsPerRow
      : width > 400
      ? chartStyles.itemsPerRow
      : 1;

    return (
      <ChartLegend
        height={25}
        gutter={10}
        itemsPerRow={itemsPerRow}
        name="legend"
        responsive={false}
        style={chartStyles.legend}
      />
    );
  };

  private getTooltipLabel = ({ datum }) => {
    const { formatDatumValue, formatDatumOptions } = this.props;
    const formatter = getTooltipContent(formatDatumValue);
    return formatter(datum.y, datum.units, formatDatumOptions);
  };

  // Interactive legend

  // Hide each data series individually
  private handleLegendClick = props => {
    if (!this.state.hiddenSeries.delete(props.index)) {
      this.state.hiddenSeries.add(props.index);
    }
    this.setState({ hiddenSeries: new Set(this.state.hiddenSeries) });
  };

  // Returns true if at least one data series is available
  private isDataAvailable = () => {
    const { series } = this.state;

    // API data may not be available (e.g., on 1st of month)
    const unavailable = [];
    if (series) {
      series.forEach((s: any, index) => {
        if (this.isSeriesHidden(index) || (s.data && s.data.length === 0)) {
          unavailable.push(index);
        }
      });
    }
    return unavailable.length === (series ? series.length : 0);
  };

  // Returns true if data series is hidden
  private isSeriesHidden = index => {
    const { hiddenSeries } = this.state; // Skip if already hidden
    return hiddenSeries.has(index);
  };

  // Returns groups of chart names associated with each data series
  private getChartNames = () => {
    const { series } = this.state;
    const result = [];
    if (series) {
      series.map((serie, index) => {
        // Each group of chart names are hidden / shown together
        result.push(serie.childName);
      });
    }
    return result as any;
  };

  // Returns onMouseOver, onMouseOut, and onClick events for the interactive legend
  private getEvents = () => {
    const result = getInteractiveLegendEvents({
      chartNames: this.getChartNames(),
      isHidden: this.isSeriesHidden,
      legendName: 'legend',
      onLegendClick: this.handleLegendClick,
    });
    return result;
  };

  // Returns legend data styled per hiddenSeries
  private getLegendData = () => {
    const { hiddenSeries, series } = this.state;
    if (series) {
      const result = series.map((s, index) => {
        return {
          ...s.legendItem, // name property
          ...getInteractiveLegendItemStyles(hiddenSeries.has(index)), // hidden styles
        };
      });
      return result;
    }
    return undefined;
  };

  public render() {
    const {
      adjustContainerHeight,
      height,
      containerHeight = height,
      padding,
      title,
    } = this.props;
    const { series, width } = this.state;

    // Note: Container order is important
    const CursorVoronoiContainer = createContainer('cursor', 'voronoi');
    const isDataAvailable = this.isDataAvailable();
    const domain = this.getDomain();
    const endDate = this.getEndDate();
    const midDate = Math.floor(endDate / 2);
    const legendData = this.getLegendData();

    const adjustedContainerHeight = adjustContainerHeight
      ? width > 400
        ? containerHeight
        : containerHeight + 75
      : containerHeight;

    return (
      <div
        className={chartOverride}
        ref={this.containerRef}
        style={{ height: adjustedContainerHeight }}
      >
        {title}
        <div style={{ height, width }}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={!isDataAvailable ? this.getTooltipLabel : undefined}
                labelComponent={<ChartLegendTooltip legendData={legendData} />}
                mouseFollowTooltips
                voronoiDimension="x"
              />
            }
            domain={domain}
            events={this.getEvents()}
            height={height}
            legendComponent={this.getLegend()}
            legendData={legendData}
            legendPosition="bottom-left"
            padding={padding}
            theme={ChartTheme}
            width={width}
          >
            {series &&
              series.map((s, index) => {
                return this.getChart(s, index);
              })}
            <ChartAxis
              style={chartStyles.xAxis}
              tickValues={[1, midDate, endDate]}
            />
            <ChartAxis dependentAxis style={chartStyles.yAxis} />
          </Chart>
        </div>
      </div>
    );
  }
}

export { CostChart, CostChartProps };
