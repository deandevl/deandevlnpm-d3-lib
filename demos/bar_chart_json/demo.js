/**
 * Created by Rick Dean on 2024-02-11.
 */
'use strict';

import * as d3 from "d3";
import {d3_bar} from "@deandevlnpm/d3-lib";
//import { d3_bar } from "../../src/d3_bar";

// read json formatted revenues data
async function readJSON(){
	let data = [];
	const data_raw = await d3.json('../data/revenues.json')
	data_raw.forEach(el => {
		data.push({
			month: el.month,
			revenue: +el.revenue,
			profit: +el.profit
		})
	})
	return data;
}
readJSON().then(data => {
	const options = {
		chart_id: 'chart',
		dataset: data,
		group_var: 'month',
    title: 'Monthly Revenues and Profits',
    x_title: 'Month',
    y_title: 'Dollars'
	}
	d3_bar(options)
})

