import { CostModel, CostModels } from 'api/costModels';
import { AxiosError } from 'axios';
import { FetchStatus } from 'store/common';
import { ActionType, getType } from 'typesafe-actions';

import {
  deleteCostModelsFailure,
  deleteCostModelsRequest,
  deleteCostModelsSuccess,
  fetchCostModelsFailure,
  fetchCostModelsRequest,
  fetchCostModelsSuccess,
  resetCostModel,
  selectCostModel,
  setCostModelDialog,
  updateCostModelsFailure,
  updateCostModelsRequest,
  updateCostModelsSuccess,
  updateFilterToolbar,
} from './actions';

export const stateKey = 'costModels';

export type CostModelsState = Readonly<{
  costModels: CostModels;
  error: AxiosError;
  status: FetchStatus;
  currentFilterType: string;
  currentFilterValue: string;
  isDialogOpen: {
    addSource: boolean;
    deleteSource: boolean;
    deleteRate: boolean;
    addRate: boolean;
    updateRate: boolean;
    updateCostModel: boolean;
    deleteCostModel: boolean;
    deleteMarkup: boolean;
    updateMarkup: boolean;
  };
  update: {
    error: AxiosError;
    status: FetchStatus;
    current: CostModel;
  };
  delete: {
    error: AxiosError;
    status: FetchStatus;
  };
}>;

export const defaultState: CostModelsState = {
  costModels: null,
  error: null,
  status: FetchStatus.none,
  currentFilterType: 'name',
  currentFilterValue: '',
  isDialogOpen: {
    deleteRate: false,
    deleteSource: false,
    addSource: false,
    addRate: false,
    updateRate: false,
    deleteCostModel: false,
    updateCostModel: false,
    deleteMarkup: false,
    updateMarkup: false,
  },
  update: {
    error: null,
    status: FetchStatus.none,
    current: null,
  },
  delete: {
    error: null,
    status: FetchStatus.none,
  },
};

export type CostModelsAction = ActionType<
  | typeof updateCostModelsFailure
  | typeof updateCostModelsRequest
  | typeof updateCostModelsSuccess
  | typeof deleteCostModelsFailure
  | typeof deleteCostModelsRequest
  | typeof deleteCostModelsSuccess
  | typeof fetchCostModelsFailure
  | typeof fetchCostModelsRequest
  | typeof fetchCostModelsSuccess
  | typeof updateFilterToolbar
  | typeof setCostModelDialog
  | typeof selectCostModel
  | typeof resetCostModel
>;

export const reducer = (
  state: CostModelsState = defaultState,
  action: CostModelsAction
): CostModelsState => {
  switch (action.type) {
    case getType(resetCostModel):
      return {
        ...state,
        update: {
          ...state.update,
          current: null,
        },
      };
    case getType(selectCostModel):
      return {
        ...state,
        update: {
          ...state.update,
          current: action.payload,
        },
      };
    case getType(updateCostModelsRequest):
      return {
        ...state,
        update: {
          ...state.update,
          status: FetchStatus.inProgress,
        },
      };
    case getType(updateCostModelsSuccess):
      return {
        ...state,
        update: {
          error: null,
          status: FetchStatus.complete,
          current: action.payload.data,
        },
      };
    case getType(updateCostModelsFailure):
      return {
        ...state,
        update: {
          ...state.update,
          status: FetchStatus.complete,
          error: action.payload,
        },
      };
    case getType(fetchCostModelsRequest):
      return {
        ...state,
        status: FetchStatus.inProgress,
      };
    case getType(fetchCostModelsSuccess):
      return {
        ...state,
        currentFilterValue: '',
        status: FetchStatus.complete,
        error: null,
        costModels: action.payload.data,
      };
    case getType(fetchCostModelsFailure):
      return {
        ...state,
        status: FetchStatus.complete,
        error: action.payload,
      };
    case getType(deleteCostModelsRequest):
      return {
        ...state,
        delete: {
          ...state.delete,
          status: FetchStatus.inProgress,
        },
      };
    case getType(deleteCostModelsSuccess):
      return {
        ...state,
        delete: {
          error: null,
          status: FetchStatus.complete,
        },
      };
    case getType(deleteCostModelsFailure):
      return {
        ...state,
        delete: {
          status: FetchStatus.complete,
          error: action.payload,
        },
      };

    case getType(updateFilterToolbar):
      return {
        ...state,
        ...action.payload,
      };
    case getType(setCostModelDialog):
      return {
        ...state,
        isDialogOpen: {
          ...state.isDialogOpen,
          [action.payload.name]: action.payload.isOpen,
        },
      };
    default:
      return state;
  }
};
