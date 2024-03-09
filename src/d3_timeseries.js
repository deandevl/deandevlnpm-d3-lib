/**
 * Created by Rick Dean on 2024-02-14.
 */
'use strict';

import * as d3 from "d3";
import { checkbox_form } from "./modules/checkbox_form";
import { track_variable } from "./modules/tracking"

function d3_timeseries(options){
	const tim = {
		chart_id: 'chart', 
    width: 1000,
    height: 600,
    margin_left: 50,
    margin_right: 80,
    margin_bottom: 50,
    dataset: null,
		variable_x: null,
		variables_y: null,
    variables_y_labels: null,
		time_format: '%Y-%m-%d',
		line_width: 2,
		y_colors: d3.schemePaired,
    title: null,
		x_title: null,
    y_title: null,
    checkbox_title: null,
		x_min_max: null,
		x_ticks: null,
		x_ticks_format: '%Y-%b',
		y_min_max: null,
		y_ticks_n: 10,
		y_ticks: null,
		y_ticks_format: (d) => d,
		y_track: null
	}

	// if options supplied then apply
	if(Object.keys(options).length > 0){
		Object.keys(options).map(function(key){
			if(!(options[key] === null) && !(typeof(tim[key]) === "undefined")){
				tim[key] = options[key]
			}
		})
	}

	// do we have selected x and y variables?
	if(tim.variable_x === null & tim.variables_y === null){
		throw new Error("The 'variable_time_x' and 'variables_y' arguments must be specified");
	}
	// do we have a dataset
	if(tim.dataset === null){
		throw new Error("The 'dataset' argument must be specified");
	}

  // check y titles
  if(tim.variables_y_labels === null){
    tim.variables_y_labels = tim.variables_y
  }

	// dimensions
  const dimensions = {
    width: tim.width,
    height: tim.height,
    margin: {
      top: 50,
      bottom: tim.margin_bottom,
      left: tim.margin_left,
      right: tim.margin_right
    }
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const parent_el = d3.select('#' + tim.chart_id)
  const interact_div = parent_el.append('div')
  .style('display', 'flex')
  .style('flex-direction', 'row')

  // selection of variables
  const checkbox_div = interact_div.append('div')
  .attr('id', 'checkbox_div')

  let checkbox_title = tim.checkbox_title
  if(checkbox_title === null){
    checkbox_title = 'Choose your variables'
  }
  checkbox_form(checkbox_div, tim.variables_y, checkbox_title)
  checkbox_div.select('#submit_button').on('click', (e) => {
    e.preventDefault()
    const checked_y = new Array()
    d3.selectAll('.vars_check')
    .nodes()
    .filter((d) => {
      if(d.checked) {
        checked_y.push(d.value)
      }
    })
    if(checked_y.length > 0) {
	    const parseDate = d3.utcParse(tim.time_format); 

      const dataReady = checked_y.map(function(checked_y_name){
        const color_idx = tim.variables_y.indexOf(checked_y_name)
        return {
          group: checked_y_name,
          stroke: tim.y_colors[color_idx],
          values: tim.dataset.map(function(d){
            return {
              x_value: parseDate(d[tim.variable_x]),
              y_value: d[checked_y_name],
              group: checked_y_name
            }
          })
        }
      })
      update_svg(tim, dimensions, dataReady)
    }else {
      d3.select('#chart_g').selectAll("*").remove()
      d3.select('#legend_g').remove()
    }
  })

  // if variable tracking, create a message div element
  if(tim.y_track !== null){
    interact_div.append('div')
    .attr('id', 'track_div')
  }
}

const update_svg = function(tim, dimensions, data){
	const parent_el = d3.select('#' + tim.chart_id)
  let svg_el = d3.select(`#${tim.chart_id} svg`)
  // draw svg
	if(svg_el.empty()){
		svg_el = parent_el
		.append('svg')
		.attr('width', dimensions.width)
		.attr('height', dimensions.height)
	}else {
		svg_el.selectAll("*").remove()
	}

	// create legend
  const x_loc = dimensions.margin.left + dimensions.ctrWidth
  const y_loc = dimensions.margin.top + dimensions.ctrHeight/2
  
  const checked_y = data.map(el => {
    return el.group
  })

  const legendGroup = svg_el.append('g')
  .attr('id', 'legend_g')
  .attr('font-family', 'Verdana')
  .attr('font-size', 10)
  .selectAll('g')
  .data(checked_y.slice().reverse())
  .join('g')
  .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

  legendGroup.append('rect')
  .attr('x', x_loc)
  .attr('width', 19)
  .attr('height', 19)
  .attr('fill', (d) => {
    const idx = tim.variables_y.indexOf(d)
    return tim.y_colors[idx]
  })

  legendGroup.append('text')
  .attr('x', x_loc + 24)
  .attr('y', 9.5)
  .attr('dy', '0.32em')
  .text((d) => {
    const idx = tim.variables_y.indexOf(d)
    return tim.variables_y_labels[idx]
  })
	
  // are we doing a main title
  if(tim.title !== null){
    svg_el.append('text')
    .attr('x', dimensions.ctrWidth/3)
    .attr('y', 25)
    .style('font-weight', 'bold')
    .style('font-size', '20px')
    .style('font-family', 'Verdana')
    .text(tim.title)
  }

	const chart_g = svg_el.append('g')
  .attr(
  	'transform',
    `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
	)
	.attr('id', 'chart_g')

	const dateFormat = d3.utcFormat(tim.time_format);
	const parseDate = d3.utcParse(tim.time_format); 

	// X scaling
	const x_min_ar = new Array()
  const x_max_ar = new Array()
  data.forEach(function(group,i){
    const min_max = d3.extent(data[i]['values'], d => d.x_value)
    x_min_ar.push(min_max[0])
    x_max_ar.push(min_max[1])
  })
  let x_min_max = [d3.min(x_min_ar), d3.max(x_max_ar)]
	if(tim.x_ticks !== null){
		x_min_max = [d3.min(tim.x_ticks), d3.max(tim.x_ticks)]
	}else if(tim.x_min_max !== null){
		x_min_max = tim.x_min_max
		data.values = d3.filter(data, (d) => d >= x_min_max[0] & xAccessor(d) <= x_min_max[1])
	}
	const xScale = d3.scaleUtc() 
	.domain(x_min_max)
	.rangeRound([0, dimensions.ctrWidth])
	.clamp(true)

	// X axis
	const xAxis = d3.axisBottom(xScale)
	.tickValues(tim.x_ticks)
	.tickFormat(d3.utcFormat(tim.x_ticks_format))

	const xAxisGroup = chart_g.append('g')
	.style('font-size','12px')
	.style('font-weight','bold')
	.style('transform', `translateY(${dimensions.ctrHeight}px)`)
  .call(xAxis)
	// add x axis title
	if(tim.x_title !== null){
		xAxisGroup.append('text')
		.attr('x', dimensions.ctrWidth / 2)
		.attr('y', dimensions.margin.bottom - 10)
		.style('fill', 'black')
		.text(tim.x_title)
	}

	// define the y axis scaling and axis
	// Y scaling
	let y_min_max;
	if(tim.y_min_max !== null){
		y_min_max = tim.y_min_max
	}else if(tim.y_ticks !== null){
		tim.y_ticks_n = null
		y_min_max = [d3.min(tim.y_ticks), d3.max(tim.y_ticks)]
	}else {
    const y_min_ar = new Array()
    const y_max_ar = new Array()
    data.forEach(function(group,i){
      const min_max = d3.extent(data[i]['values'], d => d.y_value)
      y_min_ar.push(min_max[0])
      y_max_ar.push(min_max[1])
    })
    y_min_max = [d3.min(y_min_ar), d3.max(y_max_ar)]
  }
	const yScale = d3.scaleLinear()
	.domain(y_min_max)
	.rangeRound([dimensions.ctrHeight, 0])	
	.nice()	
	.clamp(true)
	// Y axis
	const yAxis = d3.axisLeft(yScale)
	.ticks(tim.y_ticks_n)
	.tickFormat(tim.y_ticks_format)
	.tickValues(tim.y_ticks)
	const yAxisGroup = chart_g.append('g')
	.style('font-size','12px')
	.style('font-weight','bold')
	.call(yAxis)	
	// add y axis title
	if(tim.y_title !== null){
		yAxisGroup.append('text')
		.attr('x', -(dimensions.ctrHeight / 2)) // note the sign
		.attr('y', -dimensions.margin.left + 10)
		.style('transform', 'rotate(270deg)')
		.style('text-anchor', 'middle')
		.style('font-size', '14px')
		.style('fill', 'black')
		.text(tim.y_title)
	}

  // support variable tracking
	if(tim.y_track !== null){
    const xAccessor = (d) => d.x_value
		const yAccessor = (d) => d.y_value
    let track_data = data.filter((d) => d.group === tim.y_track)
    if(track_data.length === 0){
      track_data = data.filter((d) => d.group === checked_y[0])
    }
    const track_values = track_data[0]['values']
		track_variable(
      track_values,
      d3.select('#track_div'),
      chart_g,
      dimensions.ctrWidth,
      dimensions.ctrHeight,
      xScale,
      yScale,
      xAccessor,
      yAccessor,
      dateFormat
    )
	}

  // draw lines
  const exitTransition = d3.transition().duration(1500)
  const updateTransition = exitTransition.transition().duration(1500)

  const line_gen = d3.line()
  .x((d) => {
    return xScale(d.x_value)
  })
  .y((d) => {
    return yScale(d.y_value)
  })

  chart_g.append('g')
  .selectAll('g')
  .data(data)
  .join('g')
  .attr('id', d => d.group)
  .style('stroke', d => d.stroke)
  .append('path')
  .datum((d) => d.values)
  .attr('d', line_gen)
  .style('fill', 'none')
  .style('stroke-width', tim.line_width)
}

export{d3_timeseries}