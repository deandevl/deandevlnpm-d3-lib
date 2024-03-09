/**
 * Created by Rick Dean on 2024-01-28.
 */

'use strict';

import * as d3 from "d3";
import { select_form } from "./modules/select_form";

function d3_bar(options){
	const bar = {
		chart_id: 'chart', 
    width: 1000,
    height: 700,
    margin_left: 50,
    margin_right: 80,
    margin_bottom: 50,
    dataset: null,
    group_var: null,
		select_var: null,
    select_title: null,
		bar_fill: 'blue',
		group_colors: d3.schemePaired,
    title: null,
		x_title: null,
    y_title: null,
    label_bars: false,
    axis_flip: false,
    rotate_x_tic: false
	}

	// if options supplied then apply
	if(Object.keys(options).length > 0){
		Object.keys(options).map(function(key){
			if(!(options[key] === null) && !(typeof(bar[key]) === "undefined")){
				bar[key] = options[key]
			}
		})
	}
	
	// do we have a dataset
	if(bar.dataset === null){
		throw new Error("The 'dataset' argument must be specified");
	}

  // dimensions
  const dimensions = {
    width: bar.width,
    height: bar.height,
    margin: {
      top: 50,
      bottom: bar.margin_bottom,
      left: bar.margin_left,
      right: bar.margin_right
    }
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  if(Object.prototype.toString.call(bar.dataset) === '[object Object]'){
    const keys = Object.keys(bar.dataset);
    const data_ar = keys.map(key => {
      return {key: key, value: bar.dataset[key]}
    })
    update_svg(bar, dimensions, data_ar, keys)
  }else if(Array.isArray(bar.dataset) & bar.select_var !== null){
    const select_vals = bar.dataset.map(d => d[bar.select_var]);
    const parent_el = d3.select('#' + bar.chart_id)
    const select_div = parent_el.append('div')
    let select_title = bar.select_title
    if(select_title === null){
      select_title = 'Choose a value'
    }
    const select_obj = select_form(select_div,select_vals, select_title)
    select_div.select('#' + select_obj.select_id).on('change', (e) => {
      e.preventDefault()
      d3.selectAll('.' + select_obj.option_class)
      .nodes()
      .filter((d,i) => {
        if(d.selected){
          const row = select_vals.indexOf(d.value)
          const keys = bar.dataset.columns.filter((col) => col !== bar.select_var)
          const data_ar = keys.map(key => {
            return {key: key, value: bar.dataset[row][key]}
          })
          update_svg(bar, dimensions, data_ar, keys)
        }
      })
    })
    const keys = Object.keys(bar.dataset[0]).filter((col) => col !== bar.select_var)
    const data_ar = keys.map(key => {
      return {key: key, value: bar.dataset[0][key]}
    })
    update_svg(bar, dimensions, data_ar, keys)
  }else if(bar.group_var !== null){
    // check group_var 
		if(!Object.keys(bar.dataset[0]).includes(bar.group_var)){
			throw new Error(`Group variable ${bar.group_var} is not in the data.`)
		}
		const keys = Object.keys(bar.dataset[0]).filter((key) => {
			return key !== bar.group_var;
		});
    update_svg(bar, dimensions, bar.dataset, keys) 
	}else {
    throw new Error("Either the 'select_var' or 'group_var' must be specified")
  }
}

const update_svg = function(bar, dimensions, dataset, keys){
  const parent_el = d3.select('#' + bar.chart_id)
  let svg_el = d3.select(`#${bar.chart_id} svg`)
  // draw svg
	if(svg_el.empty()){
    svg_el = parent_el
		.append('svg')
		.attr('width', dimensions.width)
		.attr('height', dimensions.height)
	}else {
		svg_el.selectAll("*").remove()
	}
	
  const chart_g = svg_el.append('g')
  .attr(
    'transform',
    `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
	.attr('id', 'chart_g')

  // are we doing a main title
  if(bar.title !== null){
    svg_el.append('text')
    .attr('x', dimensions.ctrWidth/3)
    .attr('y', 25)
    .style('font-weight', 'bold')
    .style('font-size', '20px')
    .style('font-family', 'Verdana')
    .text(bar.title)
  }

  // define scaling 
  let x_scale = null;
  let y_scale;
  let outer_scale;
  let inner_scale;
  let fill_scale;

  if(bar.group_var !== null){
    outer_scale = d3.scaleBand()
    .domain(dataset.map(d => d[bar.group_var]))
    .rangeRound([0, dimensions.ctrWidth])
    .paddingInner(0.1);

    inner_scale = d3.scaleBand()
    .domain(keys)
    .rangeRound([0,outer_scale.bandwidth()])
    .padding(0.05)

    fill_scale = d3.scaleOrdinal()
    .range(bar.group_colors);

    y_scale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d3.max(keys, key => d[key]))])
    .rangeRound([dimensions.ctrHeight, 0])
    .nice()
    .clamp(true)
  }else{
    if(!bar.axis_flip){
      x_scale = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, dimensions.ctrWidth])
      .padding(0.05)
      
      y_scale = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.value)])
      .rangeRound([dimensions.ctrHeight, 0])
      .nice()
      .clamp(true)
    }else {
      x_scale = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.value)])
      .rangeRound([0,dimensions.ctrWidth])
      .nice()
      .clamp(true)

      y_scale = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, dimensions.ctrHeight])
      .padding(0.05)
    }
  }

  // draw bars
  const exitTransition = d3.transition().duration(1500)
  const updateTransition = exitTransition.transition().duration(1500)
  if(bar.group_var !== null){
    chart_g.append('g')
    .selectAll('g')
    .data(dataset)
    .join('g') 
    .attr('transform', d => `translate(${outer_scale(d[bar.group_var])},0)`)
    .selectAll('rect')
    .data((d) => {
      return keys.map(key => {
        return {key: key, value: d[key]};
      })
    })  
    .join(
      (enter) => enter
      .append('rect')
      .attr('x', d => inner_scale(d.key))
      .attr('y', dimensions.ctrHeight)
      .attr('width', inner_scale.bandwidth())
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
    .attr('x', d => inner_scale(d.key))
    .attr('y', d => y_scale(d.value))
    .attr('width', inner_scale.bandwidth())
    .attr('height', d => dimensions.ctrHeight - y_scale(d.value))
    .attr('fill', d => fill_scale(d.key));
  }else {
    if(!bar.axis_flip) {
      chart_g.append('g')
      .selectAll('rect')	
      .data(dataset)
      .join(
        (enter) => enter
        .append('rect')
        .attr('x', d => x_scale(d.key))
        .attr('y', dimensions.ctrHeight)
        .attr('width', x_scale.bandwidth())
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
      .attr('x', d => x_scale(d.key))
      .attr('y', d => y_scale(d.value))
      .attr('width', x_scale.bandwidth())
      .attr('height', d => dimensions.ctrHeight - y_scale(d.value))
      .attr('fill', bar.bar_fill)
      
      if(bar.label_bars){
        chart_g.append('g')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .selectAll('text')
        .data(dataset)
        .join(
          (enter) => enter
          .append('text')
          .attr('x', d => x_scale(d.key))
          .attr('y', dimensions.ctrHeight)
          .text(d => d.value),
          (update) => update,
          (exit) => exit
          .transition(exitTransition)
          .attr('y', dimensions.ctrHeight)
          .remove()
        )
        .transition(updateTransition)
        .attr('x', d => x_scale(d.key))
        .attr('y', d => y_scale(d.value)-5)
        .text(d => d.value)
      }
    }else {
      chart_g.append('g')
      .selectAll('rect')	
      .data(dataset)
      .join(
        (enter) => enter
        .append('rect')
        .attr('x', 0)
        .attr('y', d => y_scale(d.key))
        .attr('height', y_scale.bandwidth())
        .attr('width', 0)
        .attr('fill', '#b8de6f'),
        (update) => update,
        (exit) => exit
        .attr('fill', '#f39233')
        .transition(exitTransition)
        .attr('x', 0)
        .attr('height', 0)
        .remove()
      )
      .transition(updateTransition)
      .attr('x', d => x_scale(0))
      .attr('y', d => y_scale(d.key))
      .attr('height', y_scale.bandwidth())
      .attr('width', d => x_scale(d.value))
      .attr('fill', bar.bar_fill)

      if(bar.label_bars){
        chart_g.append('g')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .selectAll('text')
        .data(dataset)
        .join(
          (enter) => enter
          .append('text')
          .attr('x', d => x_scale(0))
          .attr('y', d => y_scale(d.key))
          .text(d => d.value),
          (update) => update,
          (exit) => exit
          .transition(exitTransition)
          .attr('x', 0)
          .remove()
        )
        .transition(updateTransition)
        .attr('x', d => x_scale(d.value) + 10) 
        .attr('y', d => y_scale(d.key) + y_scale.bandwidth()/2 )
        .text(d => d.value)
      }
    }
     
  }
  
  //draw x axis
  let xAxis;
  if(bar.group_var !== null){
    xAxis = d3.axisBottom(outer_scale);
  }else {
    if(!bar.axis_flip){
      xAxis = d3.axisBottom(x_scale);
    }else {
      xAxis = d3.axisBottom(x_scale).ticks(null, 's');
    }
  }
  
  const xAxisGroup = chart_g.append('g')
  .style('font-size','12px')
  .style('font-weight','bold')
  .style('transform', `translateY(${dimensions.ctrHeight}px)`)
  .call(xAxis)

  if(bar.rotate_x_tic){
    xAxisGroup
    .selectAll('text')
    .attr('transform', 'translate(-10.0,0)rotate(-45)')
    .style('text-anchor', 'end')
  }
  
  //draw y axis
  let yAxis;
  if(!bar.axis_flip){
    yAxis = d3.axisLeft(y_scale).ticks(null, 's')
  }else {
    yAxis = d3.axisLeft(y_scale)
  }
  
  const yAxisGroup = chart_g.append('g')
  .style('font-size','12px')
  .style('font-weight','bold')
  .call(yAxis)
  
  // draw x title
  if(bar.x_title !== null){
    xAxisGroup.append('text')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .attr('fill', 'black')
    .text(bar.x_title)
  }

  // draw y title
  if(bar.y_title !== null){
    yAxisGroup.append('text')
    .attr('x', -(dimensions.ctrHeight / 2)) // note the sign
    .attr('y', -dimensions.margin.left + 10)
    .attr('fill', 'black')
    .style('transform', 'rotate(270deg)')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text(bar.y_title)
  }

  // draw legend
  if(bar.group_var !== null){
    const x_loc = dimensions.margin.left + dimensions.ctrWidth
    const y_loc = dimensions.margin.top + dimensions.ctrHeight/3

    const legendGroup = svg_el.append('g')
    .attr('font-family', 'Verdana')
    .attr('font-size', 10)
    .selectAll('g')
    .data(keys.slice().reverse())
    .join('g')
    .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

    legendGroup.append('rect')
    .attr('x', x_loc)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', fill_scale);

    legendGroup.append('text')
    .attr('x', x_loc + 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d);
  }
}

export {d3_bar}