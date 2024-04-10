/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

//import {app_bar} from '@deandevlnpm/d3-lib'
import {csv} from 'd3-fetch';
import { app_bar } from "../../src/app_bar";
import { Dimensions } from '../../src/helpers';

const draw_chart = async function(){
  const data = await csv('../../data/weapons.csv')
  const obj = {}
  data.forEach((d) => {
    obj[d.Country] = +d.Value
  }) 
  
  const dimensions = new Dimensions(900,700,30,80,50,10)
  app_bar()
  .init('bar_chart',obj)
  .set_dimes(dimensions)
  .set_label_bars(true)
  .set_titles(
    'Weapons Count by Country',
    'Count',
    'Country'
  )
  .set_rotate_x_tic(true)
  .draw_object();
}

draw_chart()
