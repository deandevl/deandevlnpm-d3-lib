/**
 * Created by Rick Dean on 2024-02-14.
 */
'use strict';

//import { app_timeseries } from '@deandevlnpm/d3-lib';
import { csv } from 'd3-fetch'
import { select } from 'd3-selection';
import {utcYears, utcMonths, timeMonth} from 'd3-time';
import { app_timeseries } from '../../src/app_timeseries';

const draw_chart = async function(){
  // read csv formatted stock prices
  const data = await csv('../../data/stock_market.csv', function(d){
		return {
			date: d.date,
			close: +d.close
		}
  })

  const timeseries_chart = app_timeseries()
  .init('timeseries_chart', data)
  .set_variable_x('date')
  .set_variables_y(['close'])
  .set_x_ticks_format('%Y-%b')
  .set_titles(
    'Stock Market Close Prices',
    'Date',
    'Close Price'
  )
  .set_y_track('close')
  .draw_timeseries();

  select('#year1').on('click', (e) => {
    timeseries_chart
    .set_x_ticks_format('%Y')
    .set_x_ticks(utcYears(new Date('2007-01-01'),new Date('2014-01-01'),1))
    .draw_timeseries();
  })
  select('#months6').on('click', (e) => {
    timeseries_chart
    .set_x_ticks_format('%Y-%b')
    .set_x_ticks(utcMonths(new Date('2007-01-01'),new Date('2013-01-01'),6))
    .draw_timeseries();
  })
  select('#year2008').on('click', (e) => {
    // alternative ways of setting start/stop times and intervals for x axis ticks
    const tick_intervals = timeMonth.every(1)?.range(new Date('2008-01-01'), new Date('2008-12-31'));
    //const tick_intervals = utcMonths(new Date('2008-01-01'), new Date('2008-12-31'),1);
    timeseries_chart
    .set_x_ticks(tick_intervals)
    .set_x_ticks_format('%b')
    .set_titles(
      'Stock Market Close Prices (2008)',
      'Month (2008)',
      'Close Price'
    )
    .draw_timeseries();
  })
  
  // define the options for 'd3_histogram'
 /* let options = {
    chart_id: 'chart',
    dataset: data,
    variable_x: 'date',
    variables_y: ['close'],
    y_track: 'close',
    //x_axis_ticks: d3.utcYears(new Date('2007-01-01'),new Date('2014-01-01'),1),
    //x_axis_ticks: d3.utcMonths(new Date('2007-01-01'),new Date('2014-01-01'),6),
    //x_axis_min_max:  [new Date('2008-01-01'), new Date('2008-12-31')],
    x_ticks_format: '%Y-%b',
    title: 'Stock Market Close Prices',
    x_title: 'Date',
    y_title: 'Close Price'
  }
  d3_timeseries(options)*/
}

draw_chart()
