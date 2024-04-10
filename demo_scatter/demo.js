/**
 * Created by Rick Dean on 2024-01-28.
 */
'use strict';

//import { app_scatter } from '@deandevlnpm/d3-lib'
import { csv } from 'd3-fetch'
import { select, selectAll } from 'd3-selection';
import { app_scatter } from '../src/app_scatter';
import { Dimensions } from '../src/helpers';

const draw_chart = async function(){
  const data_raw = await csv('../data/Advertising.csv')

  let data = [];
  data_raw.forEach((row) => {
    data.push({
      'TV': +row['TV'],
      'Radio': +row['radio'],
      'Newspaper': +row['newspaper'],
      'Sales': +row['sales']
    })
  })
  const dimensions = new Dimensions(1000,700,30,40,50,80)
  const scatter_chart = app_scatter()
  .init('scatter_chart', data)
  .set_dimes(dimensions)
  .set_variable_y('Sales')
  .set_titles(
    'Advertising Dollars vs Sales',
    'Advertising Dollars',
    'Sales'
  )
  .set_x_ticks_format((d) => '$' + d)
  .set_y_ticks_format((d) => '$' + d)
  //.set_y_ticks([0, 5, 10, 15, 20, 25, 30])
  .set_x_min_max([0, 300])
  .set_y_min_max([0, 35])
  

  select('#submit_button').on('click', (e) => {
    e.preventDefault();
    const checked_x = [];
    selectAll('.vars_check')
    .nodes()
    .filter((d) => {
      if(d.checked){
        checked_x.push(d.value);
      }
    })
    if(checked_x.length > 0){
      scatter_chart
      .set_variables_x(checked_x)
      .draw_scatter();
    }
  })
}

draw_chart()
