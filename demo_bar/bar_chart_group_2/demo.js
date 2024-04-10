/**
 * Created by Rick Dean on 2024-02-11.
 */
'use strict';

//import {app_bar} from '@deandevlnpm/d3-lib';
import {json} from 'd3-fetch';
import { Dimensions } from '../../src/helpers';
import { app_bar } from "../../src/app_bar";

// read json formatted revenues data
const draw_chart =  async function(){
	let data = [];
	const data_raw = await json('../../data/revenues.json')
	data_raw.forEach(el => {
		data.push({
			month: el.month,
			revenue: +el.revenue,
			profit: +el.profit
		})
	})
  const dimensions = new Dimensions(900,700,50,50,60,100)
	app_bar()
  .init('bar_chart', data)
  .set_titles(
    'Monthly Revenues and Profits',
    'Month',
    'Dollars'
  )
  .set_group_var('month')
  .set_dimes(dimensions)
  .draw_array_of_objects();
}

draw_chart() 
