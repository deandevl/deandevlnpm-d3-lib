/**
 * Created by Rick Dean on 2024-01-28.
 */
'use strict';

//import {app_bar} from '@deandevlnpm/d3-lib'
import {csv} from 'd3-fetch';
import { Dimensions } from '../../src/helpers';
import { app_bar } from '../../src/app_bar';

const draw_chart = async function(){
  const data = await csv('../../data/population.csv');
  const keys = Object.keys(data[0])
  data.forEach(row => {
    for(let i = 1; i < keys.length; i++) {
       row[keys[i]] = +row[keys[i]];
    }
  })

  const dimensions = new Dimensions(1000,700,30,40,50,125)
  app_bar()
  .init('bar_chart', data)
  .set_titles(
    'Grouping Population Variables by State',
    'State',
    'Population'
  )
  .set_group_var('State')
  .set_dimes(dimensions)
  .draw_array_of_objects();
}

draw_chart() 
