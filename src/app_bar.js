

import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { max as d3_max } from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import { includes as _includes, filter as _filter, map as _map } from 'lodash';
import { transition } from 'd3-transition';
import { Dimensions } from './helpers';

/** 
 * Creates a svg bar chart based on d3 that can easily be made interactive.
 * @author Rick Dean
 * @description Includes a number of options including axis flipping,
 *   x axis tic label slanting, bar labels, and variable grouping.
 *   Each of the functions can be chained to set up and draw the chart.
 *   All of the functions return an object with references to all publicly available setup/draw functions.
 * @example See 'demo_bar' folder for examples.
 * @returns {object} The publicly available functions in constructing the chart.
*/
const app_bar = function(){
  let svg = undefined;
  let data = undefined;
  let data_ar = undefined;
  let chart_g = undefined;
  let dimen = new Dimensions();
  let bar_fill = 'blue';
  let chart_width = 0;
  let chart_height = 0; 
  let title = undefined, x_title = undefined, y_title = undefined;
  let axis_flip = false;
  let rotate_x_tic = false;
  let label_bars = false;
  let group_var = undefined;
  let group_fills =  schemePaired;

  // public functions
  /**
   * Creates the svg with its dimensions and assigns 'data' argument
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {object | object[]} new_data An object or array of objects with numeric data. 
   * @returns {object} 'app_bar' public function references.
   */
  function init(new_host, new_data){
    data = new_data;
    // create svg
    svg = select(`#${new_host}`)
    .datum(data)
    .append('svg')
    set_dimes(dimen);
    return this;
  };
  /** 
   * Defines the dimensions for the svg
   * 
   * @param {Dimensions} new_dimen A numeric object defining an svg's 
   *   width, height, top, bottom, left, right.
   * @returns {object} 'app_bar' public function references.
  */
  function set_dimes(new_dimen){
    dimen = new_dimen;
    svg
    .attr('width', dimen.width)
    .attr('height', dimen.height);

    chart_width = dimen.width - dimen.left - dimen.right;
    chart_height = dimen.height - dimen.top - dimen.bottom;
    return this;
  };
  /** 
   * Defines the chart's main title, x-axis title, y-axis title.
   * 
   * @param {string} new_title The chart's main title.
   * @param {string} new_x_title The chart's x-axis title.
   * @param {string} new_y_title The chart's y-axis title.
   * @returns {object} 'app_bar' public function references.
  */
  function set_titles(new_title, new_x_title, new_y_title){
    title = new_title;
    x_title = new_x_title;
    y_title = new_y_title;
    return this;
  };
  /** 
   * Defines the bar's fill color for non-grouped data.
   * 
   * @param {string} new_bar_fill The color in hex or name for the bar fill.
   * @returns {object} 'app_bar' public function references.
  */
  function set_bar_fill(new_bar_fill){
    bar_fill = new_bar_fill;
    return this;
  };
  /** 
   * Flips the x and y axis'
   * 
   * @param {boolean} new_flip If 'true' flips the x and y axis'.
   * @returns {object} 'app_bar' public function references.
  */
  function set_axis_flip(new_flip){
    axis_flip = new_flip;
    return this;
  };
  /** 
   * Slants long x-axis tic labels
   * 
   * @param {boolean} new_rotate If 'true' slants x-axis tic labels. 
   * @returns {object} 'app_bar' public function references.
  */
  function set_rotate_x_tic(new_rotate){
    rotate_x_tic = new_rotate;
    return this;
  };
  /** 
   * Labels the bars with their values.
   * 
   * @param {boolean} new_label_bars If 'true' labels the bars with their
   *   numeric values.
   * @returns {object} 'app_bar' public function references.
  */
  function set_label_bars(new_label_bars){
    label_bars = new_label_bars;
    return this;
  };
  /** 
   * In an array of objects, performs a grouping of values based on
   *   this variable.
   * 
   * @param {string} new_group_var The name of the variable from 'data' to group from. 
   * @returns {object} 'app_bar' public function references.
  */
  function set_group_var(new_group_var){
    group_var = new_group_var;
    return this; 
  };
  /** 
   * Sets different colors for each variable in a grouping.
   * 
   * @param {string[]} new_group_fills An array of color for each of the
   *   group variables.
   * @returns {object} 'app_bar' public function references.
  */
  function set_group_fills(new_group_fills){
    group_fills = new_group_fills;
    return this;
  };
  /** 
   * Draws a d3 svg bar chart based on 'data' set by the 'init()' function being an object.
   * 
   * @throws {Error} if 'data' is undefined or is not an object.
   * @returns {object} 'app_bar' public function references.
  */
  function draw_object(){
    // do we have data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified");
    };
    // check type for 'data' -- it must be 'object'
    if(Object.prototype.toString.call(data) !== '[object Object]'){
      throw new Error("The data must be of type 'object.")
    };

    // assuming repeated calls to 'draw_object()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();
    chart_g = svg
    .append('g')
    .attr('id', 'chart_g')
    .attr(
      'transform',
      `translate(${dimen.left}, ${dimen.top})`
    );

    // draw main title
    if(typeof title !== 'undefined'){
      draw_main_title();
    };

    const keys = Object.keys(data);
    data_ar = _map(keys, (key) => {
      return {key: key, value: data[key]}
    });

    // define scaling
    let x_scale;
    let y_scale;
    const exitTransition = transition().duration(1500);
    const updateTransition = exitTransition.transition().duration(1500);
    if(!axis_flip){
      x_scale = scaleBand()
      .domain(keys)
      .rangeRound([0, chart_width])
      .padding(0.05);

      y_scale = scaleLinear()
      .domain([0, d3_max(data_ar, d => d.value)])
      .rangeRound([chart_height, 0])
      .nice()
      .clamp(true);

      // draw bars
      chart_g
      .append('g')
      .selectAll('rect')	
      .data(data_ar)
      .join(
        (enter) => enter
        .append('rect')
        .attr('x', d => x_scale(d.key))
        .attr('y', chart_height)
        .attr('width', x_scale.bandwidth())
        .attr('height', 0)
        .attr('fill', '#b8de6f'),
        (update) => update,
        (exit) => exit
        .attr('fill', '#f39233')
        .transition(exitTransition)
        .attr('y', chart_height)
        .attr('height', 0)
        .remove()
      )
      .transition(updateTransition)
      .attr('x', d => x_scale(d.key))
      .attr('y', d => y_scale(d.value))
      .attr('width', x_scale.bandwidth())
      .attr('height', d => chart_height - y_scale(d.value))
      .attr('fill', bar_fill);

      // label bars
      if(label_bars){
        chart_g
        .append('g')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .selectAll('text')
        .data(data_ar)
        .join(
          (enter) => enter
          .append('text')
          .attr('x', d => x_scale(d.key))
          .attr('y', chart_height)
          .text(d => d.value),
          (update) => update,
          (exit) => exit
          .transition(exitTransition)
          .attr('y', chart_height)
          .remove()
        )
        .transition(updateTransition)
        .attr('x', d => x_scale(d.key))
        .attr('y', d => y_scale(d.value)-5)
        .text(d => d.value)
      };

      // draw x axis
      const xAxis = axisBottom(x_scale);
      draw_x_axis(xAxis);

      // draw y axis
      const yAxis = axisLeft(y_scale)
      .ticks(null, 's');
      draw_y_axis(yAxis);
    }else{
      // define scaling
      x_scale = scaleLinear()
      .domain([0, d3_max(data_ar, d => d.value)])
      .rangeRound([0,chart_width])
      .nice()
      .clamp(true);

      y_scale = scaleBand()
      .domain(keys)
      .rangeRound([0, chart_height])
      .padding(0.05);
    
      // draw bars
      chart_g
      .append('g')
      .selectAll('rect')	
      .data(data_ar)
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
      .attr('fill', bar_fill);

      // label bars
      if(label_bars){
        chart_g
        .append('g')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .selectAll('text')
        .data(data_ar)
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
      };

      //draw x axis
      const xAxis = axisBottom(x_scale)
      .ticks(null, 's');
      draw_x_axis(xAxis);

      //draw y axis
      const yAxis = axisLeft(y_scale)
      draw_y_axis(yAxis);
    }

    return this;
  }
  /** 
   * Draws a d3 svg bar chart based on 'data' set by the 'init()' function being an array of objects.
   * 
   * @throws {Error} If 'data' or 'group_var' have not been defined.
   * @returns {object} 'app_bar' public function references.
  */
  function draw_array_of_objects(){
    // check if array submitted
    if(!Array.isArray(data)){
      throw new Error("The data must be an array of objects.");
    };
    // check if 'group_var' submitted
    if(typeof group_var === 'undefined'){
      throw new Error("The 'group_var' must be set for an array of objects.")
    };
    // check group_var 
    if(!_includes(Object.keys(data[0]), group_var)) {
      throw new Error(`Group variable ${group_var} is not in the data.`)
    };
    
    const other_keys = _filter(Object.keys(data[0]), (key) => {
      return key !== group_var;
    });

    // assuming repeated calls to 'draw_array_of_objects()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();
    chart_g = svg
    .append('g')
    .attr('id', 'chart_g')
    .attr(
      'transform',
      `translate(${dimen.left}, ${dimen.top})`
    );

    // draw main title
    if(typeof title === 'string'){
      draw_main_title();
    };

    // define scaling 
    const outer_scale = scaleBand()
    .domain(_map(data, (d) => d[group_var]))
    .rangeRound([0, chart_width])
    .paddingInner(0.1);

    const inner_scale = scaleBand()
    .domain(other_keys)
    .rangeRound([0,outer_scale.bandwidth()])
    .padding(0.05);

    const fill_scale = scaleOrdinal()
    .range(group_fills);

    const y_scale = scaleLinear()
    .domain([0, d3_max(data, d => d3_max(other_keys, key => d[key]))])
    .rangeRound([chart_height, 0])
    .nice()
    .clamp(true);

    // draw bars
    const exitTransition = transition().duration(1500);
    const updateTransition = exitTransition.transition().duration(1500);
    chart_g
    .append('g')
    .selectAll('g')
    .data(data)
    .join('g') 
    .attr('transform', d => `translate(${outer_scale(d[group_var])},0)`)
    .selectAll('rect')
    .data((d) => {
      return _map(other_keys, key => {
        return {key: key, value: d[key]};
      })
    })  
    .join(
      (enter) => enter
      .append('rect')
      .attr('x', d => inner_scale(d.key))
      .attr('y', chart_height)
      .attr('width', inner_scale.bandwidth())
      .attr('height', 0)
      .attr('fill', '#b8de6f'),
      (update) => update,
      (exit) => exit
      .attr('fill', '#f39233')
      .transition(exitTransition)
      .attr('y', chart_height)
      .attr('height', 0)
      .remove()
    )
    .transition(updateTransition)
    .attr('x', d => inner_scale(d.key))
    .attr('y', d => y_scale(d.value))
    .attr('width', inner_scale.bandwidth())
    .attr('height', d => chart_height - y_scale(d.value))
    .attr('fill', d => fill_scale(d.key));

    //draw x axis
    const xAxis = axisBottom(outer_scale);  
    draw_x_axis(xAxis);

    //draw y axis
    const yAxis = axisLeft(y_scale).ticks(null, 's')
    draw_y_axis(yAxis);

    // draw legend
    const x_loc = dimen.left + chart_width + 5;
    const y_loc = dimen.top + chart_height/3;

    const legendGroup = svg
    .append('g')
    .attr('font-family', 'Verdana')
    .attr('font-size', 10)
    .selectAll('g')
    .data(other_keys.slice().reverse())
    .join('g')
    .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

    legendGroup
    .append('rect')
    .attr('x', x_loc)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => fill_scale(d));

    legendGroup
    .append('text')
    .attr('x', x_loc + 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d);

    return this;
  }
  // non-public functions
  function draw_main_title(){
    svg
    .append('text')
    .attr('x', chart_width/3)
    .attr('y', 25)
    .style('font-weight', 'bold')
    .style('font-size', '20px')
    .style('font-family', 'Verdana')
    .text(title)
  };
  function draw_x_axis(xaxis){
    const xAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .style('transform', `translateY(${chart_height}px)`)
    .call(xaxis);

    if(rotate_x_tic){
      xAxisGroup
      .selectAll('text')
      .attr('transform', 'translate(-10.0,0)rotate(-45)')
      .style('text-anchor', 'end')
    };

    // draw x title
    if(typeof x_title === 'string'){
      xAxisGroup
      .append('text')
      .attr('x', chart_width / 2)
      .attr('y', dimen.bottom - 10)
      .attr('fill', 'black')
      .text(x_title)
    };
  };
  function draw_y_axis(yaxis){
    const yAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .call(yaxis);

    // draw y title
    if(typeof y_title === 'string'){
      yAxisGroup
      .append('text')
      .attr('x', -(chart_height / 2)) // note the sign
      .attr('y', -dimen.left + 10)
      .attr('fill', 'black')
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(y_title)
    };
  }
  return {
    init: init,
    set_dimes: set_dimes,
    set_titles: set_titles,
    set_bar_fill: set_bar_fill,
    set_axis_flip: set_axis_flip,
    set_rotate_x_tic: set_rotate_x_tic,
    set_label_bars: set_label_bars,
    draw_object: draw_object,
    draw_array_of_objects: draw_array_of_objects,
    set_group_var: set_group_var,
    set_group_fills: set_group_fills
  };
}

export{app_bar};