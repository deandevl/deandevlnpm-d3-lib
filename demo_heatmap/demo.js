/**
 * Created by Rick Dean on 2024-02-17.
 */
'use strict';

//import {app_heatmap} from '@deandevlnpm/d3-lib'
import { json } from 'd3-fetch'
import { select } from 'd3-selection';
import { schemeOranges, schemePurples, schemeBlues, schemeGreens } from 'd3-scale-chromatic';
import { app_heatmap } from '../src/app_heatmap';

// read json formatted data
const draw_chart = async function(){
  const data = await json('../data/heat_data.json');
  const heatmap_chart = app_heatmap()
  .init('heatmap_chart', data)
  .set_title('quantile')
  .set_scale('quantile')
  .draw_heatmap();

  // events
  select("#scale").on('change', (e) => {
    e.preventDefault();
    heatmap_chart
    .set_title(e.target.value + ' scale')
    .set_scale(e.target.value);
    if(e.target.value === 'threshold'){
      heatmap_chart
      .set_thresholds([45200, 135600]);
    };
    heatmap_chart
    .draw_heatmap();
  });
  select("#color").on('change', (e) => {
    e.preventDefault();
    switch(e.target.value){
      case 'default':
        heatmap_chart
        .set_colors(['white','pink','red']);
        break;
      case 'orange':
        heatmap_chart
        .set_colors(schemeOranges[3]);
        break;
      case 'purple':
        heatmap_chart
        .set_colors(schemePurples[3]);
        break;
      case 'blue':
        heatmap_chart
        .set_colors(schemeBlues[3]);
        break;
      case 'green':
        heatmap_chart
        .set_colors(schemeGreens[3]);
        break;
    }
    heatmap_chart
    .draw_heatmap();
  });
}

draw_chart();