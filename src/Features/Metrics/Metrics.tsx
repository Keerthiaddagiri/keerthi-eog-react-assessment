import {
  useQuery,
  useSubscription,
  Provider,
  createClient,
  defaultExchanges,
  subscriptionExchange
} from 'urql';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useCallback } from 'react';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { getMetrics, getSelectedMetrics } from './selectros';
import { actions } from './reducer';
import Tiles from '../../components/Tiles';
import Graph from '../../components/Graph';
import Dropdown from '../../components/Dropdown';
import classes from '*.module.css';


const useStyles = makeStyles({
  metricsContainer: {
    padding: '1rem',
  },
});

const socketClient = new SubscriptionClient('ws://react.eogresources.com/graphql',{ reconnect: true})

const client = createClient({
  url: 'https://react.eogresources.com/graphql',
  exchanges: [...defaultExchanges, subscriptionExchange({
    forwardSubscription: operation => socketClient.request(operation)
  })]
});


const query = `
  query {
    getMetrics
  }
`;

const getMeasurements = `
  query($measurementQuery:  [MeasurementQuery]) {
    getMultipleMeasurements(input: $measurementQuery) {
      metric
      measurements{
        metric
        at
        value
        unit
      }
    }
  }
`;

const subscription = `
  subscription {
    newMeasurement{
      metric
      at
      value
      unit
    }
  }
`;

const FetchMetricList = () => {
  const dispatch = useDispatch();

  const [result] = useQuery({
    query
  });
  const { data, error } = result;

  useEffect(() => {
    if (error) {
      dispatch(actions.apiErrorAction({ error: error.message }));
      return;
    }
    if (!data) return;
    const { getMetrics } = data;
    dispatch(actions.setMetrics(getMetrics));
  }, [dispatch, data, error]);
};


const FetchNewMeasurementData = () => {
  const dispatch = useDispatch();
  const receiveMeasurement = useCallback(
    measurement =>dispatch(actions.setMeasurementData(measurement)),
    [dispatch]
  );

  const [result] = useSubscription({
    query: subscription,
    variables: {}
  });
  const { data, error } = result;
  useEffect(() => {
    if (error) {
      dispatch(actions.apiErrorAction({ error: error.message }));
      return
    }
    if (!data) {
      return;
    }
    const { newMeasurement } = data;
    receiveMeasurement(newMeasurement);
  }, [data, error, dispatch, receiveMeasurement]);
};

const FetchMultipleMeasurements = (measurementQuery: any[]) => {
  const dispatch = useDispatch();
  const [result] = useQuery({
    query: getMeasurements,
    variables: {
      measurementQuery,
    }
  });
  const { data, error } = result;
  useEffect(() => {
    if (error) {
      dispatch(actions.apiErrorAction({ error: error.message }));
      return;
    }
    if (data) {
      const { getMultipleMeasurements } = data;
      const graphData: any = {};
      for (let i = 0; i < getMultipleMeasurements.length; i++) {
        graphData[getMultipleMeasurements[i].metric] = {
          unit: getMultipleMeasurements[i].measurements[0].unit,
          data: getMultipleMeasurements[i].measurements,
        };
      }
      dispatch(actions.setGraphData(graphData));
    }
  }, [dispatch, data, error]);
};

const Metrics: React.FC = () => {
  const dispatch = useDispatch();
  const metrics = useSelector(getMetrics);
  const selectedMetrics = useSelector(getSelectedMetrics);
  const measurementQuery = useMemo(() => selectedMetrics.map((item: string) => {
    return {
      metricName: item,
      after: (Date.now() - 1800000)
    }
  }), [selectedMetrics]);

  FetchMetricList();
  FetchNewMeasurementData();
  FetchMultipleMeasurements(measurementQuery);

  const handleSelectedChange = (_event: React.ChangeEvent<{}>, values: string[]) => {
    dispatch(actions.updateSelected(values));
  }
  const classes = useStyles();

  return (
    <Box className={classes.metricsContainer}>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column">
          <Dropdown items={metrics} handleSelectedChange={handleSelectedChange} />
        </Box>
      </Box>
      <Graph />
      <Tiles />
    </Box>
  );
};

export default () => {
  return (
    <Provider value={client}>
      <Metrics />
    </Provider>
  );
};
