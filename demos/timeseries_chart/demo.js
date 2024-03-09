/**
 * Created by Rick Dean on 2024-02-14.
 */
'use strict';

import * as d3 from "d3";
import { d3_timeseries } from "@deandevlnpm/d3-lib";
//import { d3_timeseries } from "../../src/d3_timeseries";

const draw_chart = async function(){
  // read csv formatted stock prices
  const data = await d3.csv('../data/stock_market.csv', function(d){
		return {
			date: d.date,
			close: +d.close
		}
  })
  // define the options for 'd3_histogram'
  let options = {
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
  d3_timeseries(options)
}

draw_chart()
