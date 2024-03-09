/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

import * as d3 from "d3";
import {d3_bar} from "@deandevlnpm/d3-lib"
//import { d3_bar } from "../../src/d3_bar";

const draw_chart = async function(){
  const data = await d3.csv('../data/weapons.csv')
  const obj = {}
  data.forEach((d) => {
    obj[d.Country] = +d.Value
  }) 
  // define the options for 'd3_bar' function
  let options = {
    chart_id: 'chart',
    dataset: obj,
    title: 'Weapons Count by Country',
    x_title: 'Country',
    y_title: 'Count',
    rotate_x_tic: true,
    margin_bottom: 75
  }

  d3_bar(options);
}

draw_chart()
