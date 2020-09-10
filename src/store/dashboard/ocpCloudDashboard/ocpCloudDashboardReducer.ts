import { ActionType, getType } from 'typesafe-actions';

import { setWidgetTab } from './ocpCloudDashboardActions';
import { OcpCloudDashboardWidget } from './ocpCloudDashboardCommon';
import {
  computeWidget,
  costSummaryWidget,
  databaseWidget,
  networkWidget,
  storageWidget,
} from './ocpCloudDashboardWidgets';

export type OcpCloudDashboardAction = ActionType<typeof setWidgetTab>;

export type OcpCloudDashboardState = Readonly<{
  widgets: Record<number, OcpCloudDashboardWidget>;
  currentWidgets: number[];
}>;

export const defaultState: OcpCloudDashboardState = {
  currentWidgets: [
    costSummaryWidget.id,
    computeWidget.id,
    storageWidget.id,
    networkWidget.id,
    databaseWidget.id,
  ],
  widgets: {
    [costSummaryWidget.id]: costSummaryWidget,
    [computeWidget.id]: computeWidget,
    [databaseWidget.id]: databaseWidget,
    [networkWidget.id]: networkWidget,
    [storageWidget.id]: storageWidget,
  },
};

export function ocpCloudDashboardReducer(
  state = defaultState,
  action: OcpCloudDashboardAction
): OcpCloudDashboardState {
  switch (action.type) {
    case getType(setWidgetTab):
      return {
        ...state,
        widgets: {
          ...state.widgets,
          [action.payload.id]: {
            ...state.widgets[action.payload.id],
            currentTab: action.payload.tab,
          },
        },
      };
    default:
      return state;
  }
}
