/**
 * Created by Rick Dean on 2024-02-17.
 */
'use strict';

import * as d3 from "d3";

function d3_heatmap(options){
	let heat = {
		chart_id: 'chart', 
    width: 700,
    height: 400,
    dataset: null,
		variable: null,
		scale: 'quantile',
		thresholds: null,
		colors: ['white','pink','red'],
		title: null
	}

	// if options supplied then apply
	if(Object.keys(options).length > 0){
		Object.keys(options).map(function(key){
			if(!(options[key] === null) && !(typeof(heat[key]) === "undefined")){
				heat[key] = options[key]
			}
		})
	}

	// do we have a selected variable?
	if(!Array.isArray(heat.dataset) & heat.variable === null){
		throw new Error("The 'variable' argument must be specified")
	}

	// do we have a dataset
	if(heat.dataset === null){
		throw new Error("The 'dataset' argument must be specified");
	}

	// check scale value
	const scales = ['linear', 'quantize', 'quantile', 'threshold']
	if(!scales.includes(heat.scale)){
		throw new Error(`Scale argument must one of the following: ${scales}`)
	}

	// check thresholds present
	if(heat.scale === 'threshold' & heat.thresholds === null){
		throw new Error("The threshold scale requires a defined 'thresholds' array argument")
	}

	// dimensions
  let dimensions = {
    width: heat.width,
    height: heat.height,
    margin: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
 
	let parent_el = d3.select(`#${heat.chart_id} svg`)
  // draw svg
	if(parent_el.empty()){
		parent_el = d3.select('#' + heat.chart_id)
		.append('svg')
		.attr('width', dimensions.width)
		.attr('height', dimensions.height)
	}else {
		const svg = d3.select("svg")
		svg.selectAll("*").remove()
	}
	const svg = d3.select("svg")
	const chart_g = svg.append('g')
  .attr(
    'transform',
    `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
	.attr('id', 'main_g')
	
	// set the data
	let data;
	if(Array.isArray(heat.dataset)){
		data = heat.dataset;
	}else{
		data = heat.dataset[heat.variable]
	}
	data.sort((a,b) => a - b)

	let heatScale;
	if(heat.scale === 'linear'){ // continuous to continuous
		heatScale = d3.scaleLinear()
			.domain(d3.extent(data)) // min/max
			.range(heat.colors) 
	}else if(heat.scale === 'quantize'){ // continuous to discrete
		heatScale = d3.scaleQuantize()
			.domain(d3.extent(data)) // min/max
			.range(heat.colors)
	}else if(heat.scale === 'quantile'){ // continuous to discrete
		heatScale = d3.scaleQuantile()
			.domain(data) // all the data
			.range(heat.colors) 
	}else if(heat.scale === 'threshold'){
		heatScale = d3.scaleThreshold()
			.domain(heat.thresholds) // custom boundaries
			.range(heat.colors)
	}

	// title?
	if(heat.title !== null){
		chart_g.append('text')
    .style('font-family', 'Verdana')
    .style('font-size', 20)
    .style('font-weight', 'bold')
    .attr('x', (dimensions.ctrWidth / 3) - (heat.title.length / 2))
    .attr('y', 10)
    .attr('fill', 'black')
    .text(heat.title)
	}

	// draw rectangles
	const box = 30
	chart_g.append('g')
  .attr('transform', 'translate(2,30)')
  .attr('stroke', 'black')
  .selectAll('rect')
  .data(data)
  .join('rect')
  .attr('width', box - 3)
  .attr('height', box - 3)
  .attr('x', (d,i) => box * (i % 20)) // 0, 30, 60...
  .attr('y', (d,i) => box * ((i / 20) | 0))
  .attr('fill', (d) => heatScale(d))
}

export {d3_heatmap}