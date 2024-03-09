/**
 * Created by Rick Dean on 2024-02-10.
 */
'use strict';

import * as d3 from "d3";
import { checkbox_form } from "./modules/checkbox_form";

function d3_scatter(options){
	const scat = {
		chart_id: 'chart', 
    dataset: null,
    width: 1000,
    height: 600,
    margin_left: 50,
    margin_right: 80,
    margin_bottom: 50,
		variables_x: null,
		variable_y: null,
		point_stroke: 'gray',
		x_colors: d3.schemePaired,
		point_radius: 4,
    title: null,
		x_title: null,
    y_title: null,
    checkbox_title: null,
		x_ticks_n: 10,
		x_ticks_values: null,
		x_min_max: null,
		x_ticks_format: (d) => d,
		y_ticks_n: 10,
		y_ticks_values: null,
		y_ticks_format: (d) => d
	}

	// if options supplied then apply
	if(Object.keys(options).length > 0){
		Object.keys(options).map(function(key){
			if(!(options[key] === null) && !(typeof(scat[key]) === "undefined")){
				scat[key] = options[key]
			}
		})
	}

  // do we have a dataset?
  if(scat.dataset === null){
    throw new Error("The dataset argument has not been set.");
  }
	// do we have x and y variables?
	if(scat.variables_x === null || scat.variable_y === null){
		throw new Error("The 'variables_x' and 'variable_y' arguments must be specified.");
	}

	// dimensions
  const dimensions = {
    width: scat.width,
    height: scat.height,
    margin: {
      top: 50,
      bottom: scat.margin_bottom,
      left: scat.margin_left,
      right: scat.margin_right
    }
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const parent_el = d3.select('#' + scat.chart_id)
  // create a checkbox of x variables
  const checkbox_div = parent_el.append("div")
  let checkbox_title = scat.checkbox_title
  if(checkbox_title === null){
    checkbox_title = 'Choose your variables'
  }
  checkbox_form(checkbox_div, scat.variables_x, checkbox_title)
  checkbox_div.select('#submit_button').on('click', (e) => {
    e.preventDefault()
    const checked_x = new Array()
    d3.selectAll('.vars_check')
    .nodes()
    .filter((d,i) => {
      if(d.checked) {
        checked_x.push(d.value)
      }
    })

    if(checked_x.length > 0) {
      const dataReady = checked_x.map(function(checked_x_name){
        return {
          group: checked_x_name,
          values: scat.dataset.map(function(d){
            const color_idx = scat.variables_x.indexOf(checked_x_name)
            return {
              x_value: d[checked_x_name],
              y_value: d[scat.variable_y],
              fill: scat.x_colors[color_idx],
              group: checked_x_name
            }
          })
        }
      })
      update_svg(scat, dimensions, dataReady)
    }else {
      d3.select('#chart_g').selectAll("*").remove()
      d3.select('#legend_g').remove()
    }
  })
}

const update_svg = function(scat, dimensions, data) {
  // draw svg
  let svg_el = d3.select(`#${scat.chart_id} svg`)
  if(svg_el.empty()){
    svg_el = d3.select('#' + scat.chart_id)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
  }else {
    svg_el.selectAll("*").remove()
  }

  // create legend
  const x_loc = dimensions.margin.left + dimensions.ctrWidth
  const y_loc = dimensions.margin.top + dimensions.ctrHeight/2
  
  const checked_x = data.map(el => {
    return el.group
  })

  const legendGroup = svg_el.append('g')
  .attr('id', 'legend_g')
  .attr('font-family', 'Verdana')
  .attr('font-size', 10)
  .selectAll('g')
  .data(checked_x.slice().reverse())
  .join('g')
  .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

  legendGroup.append('rect')
  .attr('x', x_loc)
  .attr('width', 19)
  .attr('height', 19)
  .attr('fill', (d) => {
    const idx = scat.variables_x.indexOf(d)
    return scat.x_colors[idx]
  });

  legendGroup.append('text')
  .attr('x', x_loc + 24)
  .attr('y', 9.5)
  .attr('dy', '0.32em')
  .text(d => d);

  // are we doing a main title
  if(scat.title !== null){
    svg_el.append('text')
    .attr('x', dimensions.ctrWidth/3)
    .attr('y', 25)
    .style('font-weight', 'bold')
    .style('font-size', '20px')
    .style('font-family', 'Verdana')
    .text(scat.title)
  }

  const chart_g = svg_el.append('g')
  .attr(
    'transform',
    `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
	.attr('id', 'chart_g')

	const tooltip_g = chart_g.append('g')
	.style('font-weight','bold')
	.style('font-size', '13px')
	.style('font-family', 'Verdana')

	// X scaling
	let x_min_max = null;
	if(scat.x_ticks_values !== null){
		scat.x_ticks_n = null
		x_min_max = [d3.min(scat.x_ticks_values), d3.max(scat.x_ticks_values)]
	}else if(scat.x_min_max !== null){
		x_min_max = scat.x_min_max
	}else {
    const x_min_ar = new Array()
    const x_max_ar = new Array()
    data.forEach(function(group,i){
      const min_max = d3.extent(data[i]['values'], d => d.x_value)
      x_min_ar.push(min_max[0])
      x_max_ar.push(min_max[1])
    })
    x_min_max = [d3.min(x_min_ar), d3.max(x_max_ar)]
  }
	const xScale = d3.scaleLinear()
	.domain(x_min_max)
	.rangeRound([0, dimensions.ctrWidth])
	.clamp(true)
	
	// X axis
	const xAxis = d3.axisBottom(xScale)
	.ticks(scat.x_ticks_n)
	.tickFormat(scat.x_ticks_format)
	.tickValues(scat.x_ticks_values)
	const xAxisGroup = chart_g.append('g')
	.style('font-size','12px')
	.style('font-weight','bold')
  .style('font-family', 'Verdana')
	.style('transform', `translateY(${dimensions.ctrHeight}px)`)
  .call(xAxis)
	// add x axis title
	if(scat.x_title !== null){
		xAxisGroup.append('text')
		.attr('x', dimensions.ctrWidth / 2)
		.attr('y', dimensions.margin.bottom - 10)
		.style('fill', 'black')
		.text(scat.x_title)
	}

	// define the y axis scaling and axis
	// Y scaling
	const y_min_ar = new Array()
  const y_max_ar = new Array()
  data.forEach(function(group,i){
    const min_max = d3.extent(data[i]['values'], d => d.y_value)
    y_min_ar.push(min_max[0])
    y_max_ar.push(min_max[1])
  })
  let y_min_max = [d3.min(y_min_ar), d3.max(y_max_ar)]
	if(scat.y_ticks_values !== null){
		scat.y_ticks_n = null
		y_min_max = [d3.min(scat.y_ticks_values), d3.max(scat.y_ticks_values)]
	}
	const yScale = d3.scaleLinear()
	.domain(y_min_max)
	.rangeRound([dimensions.ctrHeight, 0])	
	.nice()	
	.clamp(true)
	// Y axis
	const yAxis = d3.axisLeft(yScale)
	.ticks(scat.y_ticks_n)
	.tickFormat(scat.y_ticks_format)
	.tickValues(scat.y_ticks_values)
	const yAxisGroup = chart_g.append('g')
	.style('font-size','12px')
	.style('font-weight','bold')
  .style('font-family', 'Verdana')
	.call(yAxis)	
	// add y axis title
	if(scat.y_title !== null){
	yAxisGroup.append('text')
		.attr('x', -(dimensions.ctrHeight / 2)) // note the sign
		.attr('y', -dimensions.margin.left + 10)
		.style('transform', 'rotate(270deg)')
		.style('text-anchor', 'middle')
		.style('font-size', '14px')
		.style('fill', 'black')
		.text(scat.y_title)
	}

	// draw points 
  const exitTransition = d3.transition().duration(1500)
  const updateTransition = exitTransition.transition().duration(1500)

  chart_g.append('g')
  .selectAll('g')
  .data(data)
  .join('g')
  .attr('id', d => d.group)
  .selectAll('circle')
  .data(function(d){return d.values})
  .join(
    (enter) => enter
    .append('circle')
    .attr('cx', d => xScale(d.x_value))
    .attr('cy', dimensions.ctrHeight)
    .attr('r', 0)
    .attr('fill', '#b8de6f'),
    (update) => update,
    (exit) => exit
    .attr('fill', '#f39233')
    .transition(exitTransition)
    .attr('r', 0)
    .remove()
  )
  .on('mouseenter', function(ev, datum){
    tooltip_g.append('text')
    .attr('dx', '0.5em')
    .attr('dy', '0em')
    .style('fill', 'red')
    .text(`${datum['group']}: ${datum['x_value']}`)
    tooltip_g.append('text')
    .attr('dx', '0.5em')
    .attr('dy', '1em')
    .style('fill', 'red')
    .text(`${scat.variable_y}: ${datum['y_value']}`)
  })
  .on('mouseleave',function(ev){
    tooltip_g.selectAll('text').remove()
  })
  .transition(updateTransition)
  .attr('cx', d => xScale(d.x_value))
  .attr('cy', d => yScale(d.y_value))
  .attr('r', scat.point_radius)
  .style('fill', d => d.fill)
}

export {d3_scatter}
