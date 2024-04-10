/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

//import { app_timeseries } from "@deandevlnpm/d3-lib";
import { csv } from 'd3-fetch';
import { select, selectAll } from 'd3-selection';
import { utcMonths } from 'd3-time';
import { app_timeseries } from "../../src/app_timeseries";
import { Dimensions } from '../../src/helpers';

const draw_chart = async function() {
  // read csv formatted stock prices
	const data = await csv('../../data/sector_prices_wide.csv', function(d){
		return {
			Date: d.Date,
			XLY: +(+d.XLY).toFixed(2),
			XLP: +(+d.XLP).toFixed(2),
			XLV: +(+d.XLV).toFixed(2)
		}
	})
  const dimensions = new Dimensions(1000, 600, 40, 40, 50, 70);
  const multiple_timeseries_chart = app_timeseries()
  .init('multiple_timeseries_chart', data)
  .set_variable_x('Date')
  .set_x_ticks_format('%b')
  .set_x_ticks(utcMonths(new Date('2022-01-01'), new Date('2023-01-01'),1))
  .set_titles(
    'Stock Sector Close Price',
    'Date',
    'Close Price'
  )
  .set_dimes(dimensions);

  select('#submit_button').on('click', (e) => {
    e.preventDefault();
    const checked_y = [];
    selectAll('.vars_check')
    .nodes()
    .filter((d) => {
      if(d.checked){
        checked_y.push(d.value);
      }
    })
    if(checked_y.length > 0){
      multiple_timeseries_chart
      .set_variables_y(checked_y)
      .set_y_min_max([0, 200])
      .set_y_ticks_n(8)
     // .set_y_ticks([0, 100, 200])
      .draw_timeseries();
    }
  })

  select('#select_track').on('change', (e) => {
    e.preventDefault();
    const var_name = e.target.value;
    if(var_name === 'None'){
      multiple_timeseries_chart
      .set_y_track(undefined)
      .draw_timeseries();
    }else {
      multiple_timeseries_chart
      .set_y_track(var_name)
      .draw_timeseries();
    }

  })
}

draw_chart()
		