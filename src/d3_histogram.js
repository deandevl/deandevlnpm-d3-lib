/**
 * Created by Rick Dean on 2024-02-13.
 */
'use strict';

import * as d3 from "d3";
import { start_stop_count_form } from "./modules/start_stop_count_form";

function d3_histogram(options){
	let histo = {
		chart_id: 'chart', 
    width: 900,
    height: 600,
    dataset: null,
		variable: null,
		n_bins: null, // integer
		bins: null, // []
		bins_nice: null, // [start, stop, count]
		bar_fill: 'blue',
    title: null,
		x_title: null,
    y_title: null,
    label_bars: false,
	}

	// if options supplied then apply
	if(Object.keys(options).length > 0){
		Object.keys(options).map(function(key){
			if(!(options[key] === null) && !(typeof(histo[key]) === "undefined")){
				histo[key] = options[key]
			}
		})
	}
	// do we have selected variable?
	if(histo.variable === null){
		throw new Error("The 'variable' argument must be specified");
	}
	// do we have a dataset
	if(histo.dataset === null){
		throw new Error("The 'dataset' argument must be specified");
	}
	// do we have bin intervals
	if(histo.n_bins === null & histo.bins === null & histo.bins_nice === null){
		throw new Error("Please specify bin intervals (i.e. n_bins, bins, or bins_nice).")
	}
	// dimensions
	let dimensions = {
		width: histo.width,
		height: histo.height,
		margin: {
			top: 50,
			bottom: 50,
			left: 50,
			right: 50
		}
	}

	dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
	dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
 
  // create a div element to possibly host form for input of min,max,step
  d3.select('#' + histo.chart_id)
  .append("div")
  .attr('id', 'start_stop_count_div')

	const xAccessor = d => d[histo.variable]

	// calculate bin_min_max
	// create new data set for bins
	let bins;
	let bin_min_max;
	let bin_d3;
	let data;
	if(histo.bins !== null){
		bins = histo.bins
		bin_min_max = [d3.min(bins), d3.max(bins)]
		bin_d3 = d3.bin()
			.domain(bin_min_max)
			.value(xAccessor)
			.thresholds(bins)
		data = bin_d3(histo.dataset)
		data = data.slice(0, data.length-1)
    update_svg(histo, dimensions, bin_min_max, data)
	}else if(histo.bins_nice !== null){
		if(Array.isArray(histo.bins_nice) & histo.bins_nice.length === 3){
      // create an input form for start, stop, count bin values
      const start_stop_count_div = d3.select('#start_stop_count_div')
      start_stop_count_form(
        start_stop_count_div,
        histo.bins_nice[0],
        histo.bins_nice[1],
        histo.bins_nice[2],
        'Bin intervals: start, stop, count'
      )
      d3.select('#start_stop_count_submit').on('click', (e) =>{
        e.preventDefault()
        const bin_inputs = d3.selectAll('.start_stop_count_input')
        .nodes()
        .map((d) => d.value)

        bins = d3.ticks(+bin_inputs[0],+bin_inputs[1],+bin_inputs[2])
        bin_min_max = [d3.min(bins), d3.max(bins)]
        bin_d3 = d3.bin()
          .domain(bin_min_max)
          .value(xAccessor)
          .thresholds(bins)
        data = bin_d3(histo.dataset)
        data = data.slice(0, data.length-1)
        update_svg(histo, dimensions, bin_min_max, data)
      }) 
		}else {
			throw new Error("The 'nice_bins' argument is defined as [start, stop, count]")
		}
	}else if(histo.n_bins !== null){
		bins = histo.n_bins
		bin_d3 = d3.bin()
			.value(xAccessor)
			.thresholds(bins)
		data = bin_d3(histo.dataset)
		const bin_min = data[0].x0
		const bin_max = data[data.length-1].x1
		bin_min_max = [bin_min, bin_max]
    update_svg(histo, dimensions, bin_min_max, data)
	}
}
const update_svg = function(histo, dimensions, bin_min_max, data){
  // draw svg
  let svg_el = d3.select(`#${histo.chart_id} svg`)
	if(svg_el.empty()){
    svg_el = d3.select('#' + histo.chart_id)
		.append('svg')
		.attr('width', dimensions.width)
		.attr('height', dimensions.height)
	}else {
		svg_el.selectAll("*").remove()
	}

  // are we doing a main title
  if(histo.title !== null){
    svg_el.append('text')
    .attr('x', dimensions.ctrWidth/3)
    .attr('y', 25)
    .style('font-weight', 'bold')
    .style('font-size', '20px')
    .style('font-family', 'Verdana')
    .text(histo.title)
  }

	const chart_g = svg_el.append('g')
	.attr(
		'transform',
		`translate(${dimensions.margin.left}, ${dimensions.margin.top})`
	)
	.attr('id', 'chart_g')

	const yAccessor = d => d.length
  // x scale
  const xScale = d3.scaleLinear()
    .domain(bin_min_max)
    .range([0, dimensions.ctrWidth])
  
  // y scale 
  // find the longest length
  const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, yAccessor)]) // gets the max length among inner arrays of newDataset
  .range([dimensions.ctrHeight, 0]) // want to reverse the values because svg starts at upper left corner
  .nice() // this will round the domain values

  // draw bars
  const exitTransition = d3.transition().duration(1500)
  const updateTransition = exitTransition.transition().duration(1500)
  const padding = 1
  chart_g.selectAll('rect')
  .data(data)
  .join(
    (enter) => enter
    .append('rect')
    .attr('x', d => xScale(d.x0))
    .attr('y', d => yScale(yAccessor(d)))
    .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding]))
    .attr('height', 0)
    .attr('fill', '#b8de6f'),
    (update) => update,
    (exit) => exit
    .attr('fill', '#f39233')
    .transition(exitTransition)
    .attr('y', dimensions.ctrHeight)
    .attr('height', 0)
    .remove()
  )
  .transition(updateTransition)
  .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding])) // convert lower/upper humidities to chart values
  .attr('height', d => dimensions.ctrHeight - yScale(yAccessor(d))) // convert/scale lengths to chart value
  .attr('x', d => xScale(d.x0)) // location is bin's lower humidity value
  .attr('y', d => yScale(yAccessor(d))) // inner array lengths converted to chart values
  .attr('fill', histo.bar_fill)

  //label bars
  if(histo.label_bars){
    chart_g.append('g') // add a group to ctr group
    .style('font-weight', 'bold')
    .style('font-size', '14px')
    .selectAll('text') // set up empty 'text' elements
    .data(data)
    .join(
      (enter) => enter
      .append('text')
      .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr('y', dimensions.ctrHeight)
      .text(yAccessor),
      (update) => update,
      (exit) => exit
      .transition(exitTransition)
      .attr('y', dimensions.ctrHeight)
      .remove()
    ) // join the text elements with arrays in data which has 8 inner arrays
    .transition(updateTransition)
    .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2) // locate the x coordinate for text
    .attr('y', d => yScale(yAccessor(d)) - 10) // locate y coordinate
    .text(yAccessor) // returns the length of each of the inner arrays
  }

  // draw axis'
  // draw x axis
  const xAxis = d3.axisBottom(xScale)
  const xAxisGroup = chart_g.append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`) // move it to the bottom of svg
  xAxisGroup.call(xAxis) // draw the axis
  
  // draw y axis
  const yAxis = d3.axisLeft(yScale)
  const yAxisGroup = chart_g.append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .call(yAxis)

  // draw x title
  if(histo.x_title !== null){
    xAxisGroup.append('text')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .attr('fill', 'black')
    .text(histo.x_title)
  }

  // draw y title
  if(histo.y_title !== null){
    yAxisGroup.append('text')
    .attr('x', -(dimensions.ctrHeight / 2)) // note the sign
    .attr('y', -dimensions.margin.left + 10)
    .attr('fill', 'black')
    .style('transform', 'rotate(270deg)')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text(histo.y_title)
  }
}

export{d3_histogram}