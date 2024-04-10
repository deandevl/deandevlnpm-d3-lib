/**
 * Created by Rick Dean on 2022-03-16.
 */
'use strict';

//import {app_histo} from '@deandevlnpm/d3-lib';
import { csv } from 'd3-fetch'
import { select } from 'd3-selection';
import { app_histo } from '../src/app_histo';

const draw_chart = async function(){
  // read csv formatted stock prices and populate 'data' array
	const data_raw = await csv('../data/stock_market.csv');
  const data = data_raw.map(el => {
     return +el.close;
  })

  const histo_chart =  app_histo()
  .init('bar_chart', data)
  .set_variable('close')
  .set_label_bars(true)
  .set_titles(
    'Count on Stock Prices',
    'Stock Price',
    'Count'
  )

  // define bins with an array
  select('#array_bins').on('click', (e) => {
    const bins = [0,100,200,300,400,500,600,700,800,900];
    histo_chart.set_bins(bins)
    .draw_histo();
  })

  // define bins as 'nice' bins
  select('#nice_bins').on('click', (e) => {
    const bins_nice = [0,800,5];
    histo_chart.set_bins_nice(bins_nice)
    .draw_histo();
  })

  // define bins as 'n'
  select('#n_bins').on('change', (e) => {
    const n_bins = +e.target.value;
    histo_chart.set_n_bins(n_bins)
    .draw_histo();
  })  
}
		
draw_chart();