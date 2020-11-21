import { createSlice, PayloadAction } from 'redux-starter-kit';

interface IMetricsState {
  metrics: string[];
  selectedMetrics: string[];
  measurementData: any;
  graphData: any;
}

export type ApiErrorAction = {
  error: string;
}

const initialState: IMetricsState = {
  metrics: [],
  graphData: {},
  measurementData: {},
  selectedMetrics: []
}

const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const metricSlice = createSlice({
  name: 'metric',
  initialState,
  reducers: {
    setMetrics: (state: IMetricsState, { payload }: PayloadAction<string []>) => {
      state.metrics = payload;
    },
    updateSelected: (state: IMetricsState, { payload }) => {
      const { measurementData } = state;
      payload.forEach((metric: string) => {
        if (!measurementData[metric]) {
          measurementData[metric] = {};
        }
      });
      state.selectedMetrics = payload;
      state.measurementData = measurementData;
    },
    setGraphData: (state: IMetricsState, { payload }: PayloadAction<any>) => {
      const graphData: any  = {};
      for (const metric in payload) {
        if(!graphData[metric]) {
          graphData[metric] = {
            unit: payload[metric].unit,
            data: payload[metric].data,
            color: getRandomColor(),
          };
        }
      }
      state.graphData = graphData;
    },
    setMeasurementData: (state: IMetricsState, { payload }: PayloadAction<any>) => {
      const { metric } = payload;
      const { graphData, selectedMetrics, measurementData } = state;
      if(selectedMetrics.indexOf(metric) > -1) {
        measurementData[metric] = payload;
      }
      const { data = [] } = graphData[metric] || {}; 
      if(data.length > 0) {
        graphData[metric].data.push(payload);
        graphData[metric].data.shift()
      }
      state.graphData = graphData;
      state.measurementData = measurementData;
    },
    apiErrorAction: (state, action: PayloadAction<ApiErrorAction>) => state,
  }
});

const { reducer, actions } = metricSlice;
export { reducer, actions };

