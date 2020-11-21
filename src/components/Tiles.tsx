import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Card, Typography, CardContent } from '@material-ui/core';
import { IState } from '../store';

const getMeasurementData = ({ metric }: IState) => metric.measurementData;

const Tiles: React.FC = () => {
  const measurementData = useSelector(getMeasurementData);
  const list = useMemo(() => {
    const mList: Array<number | string> = [];
    if (Array.isArray(measurementData)) {
      measurementData.forEach((metric: any) => {
        if(measurementData[metric] && measurementData[metric].metric) {
          mList.push(measurementData[metric]);
        }
      });
    }
    return mList;
  }, [measurementData]);
  
  return (
    <div style={{overflow: "hidden"}}>
      <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
        {list
          ? list.map(({ metric, value, unit }: any) => {
            return (
              <Grid key={metric} item sm={2} xs={1}>
                <Card>
                  <CardContent>
                    <Typography component="h5" variant="h5">{value} {unit}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">{metric}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
          : null}
      </Grid>
    </div>
  );
};

export default Tiles;

