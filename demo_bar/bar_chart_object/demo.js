/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

//import {app_bar} from '@deandevlnpm/d3-lib'
import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { Dimensions } from '../../src/helpers';
import { app_bar } from '../../src/app_bar';

const draw_chart = async function(){
  const data = await csv('../../data/weapons.csv')
  const obj = {}
  data.forEach((d) => {
    obj[d.Country] = +d.Value
  }) 

  const bar_chart = app_bar()
  .init('bar_chart',obj);

  // flip chart axis' with Country on y-axis
  select('#flip_button').on('click', (e) => {
    const dimensions = new Dimensions(900,700,40,40,120,10)
    bar_chart
    .set_axis_flip(true)
    .set_label_bars(true)
    .set_titles(
      'Weapons Count by Country',
      'Count',
      'Country'
    )
    .set_dimes(dimensions)
    .set_rotate_x_tic(false)
    .draw_object();
  })

  // un-flip with Country on x-axis 
  // reset titles
  // redefine Dimensions
  // slant the x-tic Country names
  select('#unflip_button').on('click',(e) => {
    const dimensions = new Dimensions(900,700,40,120,50,10)
    bar_chart
    .set_axis_flip(false)
    .set_titles(
      'Weapons Count by Country',
      'Country',
      'Count'
    )
    .set_dimes(dimensions)
    .set_rotate_x_tic(true)
    .draw_object();
  })
}

draw_chart()
