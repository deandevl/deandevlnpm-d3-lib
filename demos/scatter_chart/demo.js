/**
 * Created by Rick Dean on 2024-01-28.
 */
'use strict';

import * as d3 from "d3";
import { d3_scatter } from "@deandevlnpm/d3-lib";
//import { d3_scatter } from "../../src/d3_scatter";

const draw_chart = async function(){
  const data = await d3.csv('../data/Advertising.csv')

  const data_ar = new Array()
  data.forEach((row) => {
    data_ar.push({
      'TV': +row['TV'],
      'Radio': +row['radio'],
      'Newspaper': +row['newspaper'],
      'Sales': +row['sales']
    })
  })
  
  let options = {
    chart_id: 'chart',
    dataset: data_ar,
    variables_x: ['TV', 'Radio', 'Newspaper'],
    variable_y: 'Sales',
    title: 'Advertising Dollars vs Sales',
    x_title: 'Advertising Dollars',
    y_title: 'Sales',
    checkbox_title: 'Choose the advertising',
    x_ticks_format: (d) => '$' + d,
    // x_ticks_n: 5,
    // x_min_max: [0,325],
    y_ticks_format: (d) => '$' + d,
    y_ticks_values: [0, 5, 10, 15, 20, 25, 30]
  }
  d3_scatter(options);
}

draw_chart()
