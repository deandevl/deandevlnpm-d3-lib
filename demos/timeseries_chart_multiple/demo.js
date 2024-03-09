/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

import * as d3 from "d3";
import { d3_timeseries } from "@deandevlnpm/d3-lib";
//import { d3_timeseries } from "../../src/d3_timeseries";

const draw_chart = async function() {
  // read csv formatted stock prices
	const data = await d3.csv('../data/sector_prices_wide.csv', function(d){
		const val = {
			Date: d.Date,
			XLY: +(+d.XLY).toFixed(2),
			XLP: +(+d.XLP).toFixed(2),
			XLV: +(+d.XLV).toFixed(2)
		}
    return val
	})
  // define the options for 'd3_histogram'
  let options = {
    chart_id: 'chart',
    dataset: data,
    variable_x: 'Date',
    variables_y: ['XLY','XLP','XLV'],
    //y_data_min_max: [0, 200],
    title: 'Stock Sector Close Price',
    x_title: 'Date',
    y_title: 'Close Price',
    variables_y_labels:[
      'Consumer Discretionary Select Sector',
      'Consumer Staples Select Sector SPDR Fund',
      'Health Care Select Sector SPDR Fund'
    ],
    y_track: 'XLY',
    margin_right: 220
  }
  d3_timeseries(options)
}

draw_chart()
		