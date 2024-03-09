/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

import * as d3 from "d3";
import {d3_histogram} from "@deandevlnpm/d3-lib";
//import { d3_histogram } from "../../src/d3_histogram";

// read csv formatted stock prices
try {
	d3.csv('../data/stock_market.csv', function(d){
		return {
			date: d.date,
			close: +d.close
		}
	}).then(data => {
		// define the options for 'd3_histogram'
		let options = {
			chart_id: 'chart',
			dataset: data,
			//n_bins: 7,
			//bins: [0,100,200,300,400,500,600,700,800,900],
			bins_nice: [0,800,10],
			variable: 'close',
      title: 'Count on Stock Prices',
			x_title: 'Stock Price',
			y_title: 'Count',
      label_bars: true
		}
		d3_histogram(options);
	})
}catch(e){
  console.log(e);
}