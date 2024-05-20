/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

//import { app_table } from "@deandevlnpm/d3-lib";
import {csv} from 'd3-fetch';
import { app_table } from "../src/app_table";

const draw_table = async function(){
  const data = await csv('../data/population.csv');
  const variables = [
    'State',
    'Under 5 Years',
    '5 to 13 Years',
    '14 to 17 Years',
    '18 to 24 Years',
    '25 to 44 Years',
    '45 to 64 Years',
    '65 Years and Over'
  ];
  const headings = [
    'State',
    'Under 5',
    '5 to 13',
    '14 to 17',
    '18 to 24',
    '25 to 44',
    '45 to 64',
    'Over 64'
  ];

  app_table()
  .init('table_div', data)
  .set_variables(variables)
  .set_headings(headings)
  .set_title('Population Counts by Age')
  .set_head_backgrd('#0099FF')
  .set_head_fill('white')
  .set_cell_backgrd('#66FFFF')
  .set_cell_fill('black')
  .set_cell_stroke('white')
  .draw_table();
};

draw_table();