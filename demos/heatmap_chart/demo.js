/**
 * Created by Rick Dean on 2024-02-17.
 */
'use strict';

import * as d3 from "d3";
import {d3_heatmap} from "@deandevlnpm/d3-lib"

// read json formatted data
try {
	d3.json('../data/heat_data.json').then(data => {
		let options = {
			title: 'quantile scale',
			dataset: data
		}

		// events
		d3.select("#scale").on('change', function(e){
			e.preventDefault();
			options.title = this.value + ' scale'
			options.scale = this.value
			if(this.value === 'threshold'){
				options.thresholds = [45200, 135600]
			}
			d3_heatmap(options)
		})
		d3.select("#color").on('change', function(e){
			e.preventDefault();
			switch(this.value){
				case 'default':
					options.colors = ['white','pink','red']
					break;
				case 'orange':
					options.colors = d3.schemeOranges[3]
					break;
				case 'purple':
					options.colors = d3.schemePurples[3]
					break;
				case 'blue':
					options.colors = d3.schemeBlues[3]
					break;
				case 'green':
					options.colors = d3.schemeGreens[3]
					break;
			}
			d3_heatmap(options)
		})

		d3_heatmap(options)
	})
}catch(e){
  console.log(e);
}