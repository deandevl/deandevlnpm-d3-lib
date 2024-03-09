/**
 * Created by Rick Dean on 2024-01-28.
 */
'use strict';

import * as d3 from "d3";
import {d3_bar} from "@deandevlnpm/d3-lib"
//import { d3_bar } from "../../src/d3_bar";

const draw_chart = async function(){
  const data = await d3.csv('../data/population.csv')

  data.forEach(row => {
    for(let i=1; i<data.columns.length; i++) {
       row[data.columns[i]] = +row[data.columns[i]];
    }
  })

  // define the options for 'd3_bar' function
  const options = {
    chart_id: 'chart',
    dataset: data,
    group_var: 'State',
    title: 'Grouping Population Variables by State',
    x_title: 'State',
    y_title: 'Population'
  }
  d3_bar(options);
}

draw_chart() 
