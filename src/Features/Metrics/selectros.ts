import { IState } from '../../store';
import { createSelector } from 'redux-starter-kit';

export const getMetrics = createSelector(
  (state: IState) => state.metric,
  metric => metric.metrics,
);

export const getSelectedMetrics = createSelector(
  (state: IState) => state.metric,
  metric => metric.selectedMetrics,
);

export const getMeasurementData = createSelector(
  (state: IState) => state.metric,
  metric => metric.measurementData,
);

export const getGraphData = createSelector(
  (state: IState) => state.metric,
  metric => metric.graphData,
);
