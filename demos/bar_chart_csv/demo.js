/**
 * Created by Rick Dean on 2024-01-28.
 */
'use strict';

import * as d3 from "d3";
import {d3_bar} from "@deandevlnpm/d3-lib"
//import { d3_bar } from "../../src/d3_bar";

// read csv formatted population data
try {
	d3.csv('../data/population.csv', function(d){
		return {
      'State': d['State'],
			'Under 5 Years': +d['Under 5 Years'],
			'5 to 13 Years': +d['5 to 13 Years'],
			'14 to 17 Years': +d['14 to 17 Years'],
			'18 to 24 Years': +d['18 to 24 Years'],
			'25 to 44 Years': +d['25 to 44 Years'],
			'45 to 64 Years': +d['45 to 64 Years'],
			'65 Years and Over': +d['65 Years and Over']
		}
	}).then(data => {
		// define the options for 'd3_bar' function
		let options = {
			chart_id: 'chart',
			dataset: data,
      select_var: 'State',
      select_title: 'Select a state',
      title: 'State Populations',
			x_title: 'Ages',
			y_title: 'Population',
      label_bars: true
		}
		
		d3_bar(options);
	})
} catch(e){
  console.log(e);
}
