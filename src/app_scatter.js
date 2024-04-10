
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { transition } from 'd3-transition';
import { max as d3_max, min as d3_min, extent as d3_extent} from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import { forEach as _forEach, map as _map } from 'lodash';
import { Dimensions } from './helpers';

/**
 * Creates a svg scatter chart based on d3 that can easily be made interactive.
 * 
 * @author Rick Dean
 * @description Charts multiple x-axis variables for one y-axis variable.
 *   Each of the functions can be chained to set up and draw the chart.
 *   All of the functions return an object with references to all publicly available setup/draw functions.
 * @example See 'demo_scatter' folder for an example.
 * @returns {object} The publicly available functions in constructing the chart.
 */
const app_scatter = function(){
  let svg = undefined;
  let data = undefined;
  let chart_g = undefined;
  let dimen = new Dimensions();
  let chart_width = 0;
  let chart_height = 0;
  let title = undefined, x_title = undefined, y_title = undefined;
  let variables_x = undefined;
  let variable_y = undefined;
  let point_stroke = 'gray'
  let point_radius = 4;
  let x_colors = schemePaired;
  let x_ticks_n = undefined;
  let x_ticks = undefined;
  let x_min_max = undefined;
  let x_ticks_format = (d,i) => d;
  let y_min_max = undefined;
  let y_ticks_n = undefined;
  let y_ticks = undefined;
  let y_ticks_format = (d,i) => d;

  // public functions
  /**
   * Creates the svg with its default dimensions and assigns 'data' argument
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {object | object[]} new_data An object or array of objects with numeric data. 
   * @returns {object} 'app_scatter' public function references.
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
   * @returns {object} 'app_scatter' public function references.
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
   * @returns {object} 'app_scatter' public function references.
  */
  function set_titles(new_title, new_x_title, new_y_title){
    title = new_title;
    x_title = new_x_title;
    y_title = new_y_title;
    return this;
  };
  /**
   * The variable names from 'data' to plot along the x-axis.
   * 
   * @param {string[]} new_variables_x 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_variables_x(new_variables_x){
    variables_x = new_variables_x;
    return this;
  };
  /**
   * The variable name from 'data' to plot along the y-axis.
   * 
   * @param {string} new_variable_y 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_variable_y(new_variable_y){
    variable_y = new_variable_y;
    return this;
  };
  /**
   * The stroke color for the points. Default is gray.
   * 
   * @param {string} new_point_stroke 
   * @returns {object} 'app_scatter' public function references. 
   */
  function set_point_stroke(new_point_stroke){
    point_stroke = new_point_stroke;
    return this;
  };
  /**
   * The radius of the points. Default is 4.
   * 
   * @param {number} new_point_radius 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_point_radius(new_point_radius){
    point_radius = new_point_radius;
    return this;
  };
  /**
   * The colors for each of the x-axis defined variables.
   * The default is schemePaired from d3-scale-chromatic.
   * 
   * @param {string[]} new_x_colors 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_x_colors(new_x_colors){
    x_colors = new_x_colors;
    return this;
  };
  /**
   * The number of ticks along the x axis.
   * 
   * @param {number} new_x_ticks_n 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_x_ticks_n(new_x_ticks_n){
    x_ticks_n = new_x_ticks_n;
    return this;
  };
  /**
   * Defines the ticks along the x-axis.
   * 
   * @param {number[]} new_x_ticks 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_x_ticks(new_x_ticks){
    x_ticks = new_x_ticks;
    return this;
  };
  /**
   * A two element number array defining the min/max along the x-axis.
   * 
   * @param {number[]} new_x_min_max 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_x_min_max(new_x_min_max){
    x_min_max = new_x_min_max;
    return this;
  };
  /**
   * Defines a function that is called for each x-axis
   *   tic in defining the tic's label. The default is
   *   (d,i) => {d}
   * 
   * @param {(d,i) => {d}} new_x_ticks_format 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_x_ticks_format(new_x_ticks_format){
    x_ticks_format = new_x_ticks_format;
    return this;
  };
  /**
   * A two element number array defining the min/max along the y-axis.
   * 
   * @param {number[]} new_y_min_max 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_y_min_max(new_y_min_max){
    y_min_max = new_y_min_max;
    return this;
  }
  /**
   * The number of ticks along the y axis.
   * 
   * @param {number} new_y_ticks_n 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_y_ticks_n(new_y_ticks_n){
    y_ticks_n = new_y_ticks_n;
    return this;
  };
  /**
   * Defines the ticks along the y-axis.
   * 
   * @param {number[]} new_y_ticks 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_y_ticks(new_y_ticks){
    y_ticks = new_y_ticks;
    return this;
  };
  /**
   * Defines a function that is called for each y-axis
   *   tic in defining the tic's label. The default is
   *   (d,i) => {d}
   * 
   * @param {(d,i) => {d}} new_y_ticks_format 
   * @returns {object} 'app_scatter' public function references.
   */
  function set_y_ticks_format(new_y_ticks_format){
    y_ticks_format = new_y_ticks_format;
    return this;
  }; 
  /**
   * Draws a d3 svg scatter chart based on 'data' set by the 'init()' function.
   * 
   * @throws {Error} If either the required 'data', 'variables_x', or 'variable_y' 
   *   have not been defined.
   * @returns {object} 'app_scatter' public function references.
   */
  function draw_scatter(){
    // do we have data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified");
    };
    // do we have x and y variables?
    if(typeof variables_x === 'undefined' || typeof variable_y === 'undefined'){
      throw new Error("The 'variables_x' and 'variable_y' arguments must be specified.");
    };

    // assuming repeated calls to 'draw_scatter()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();
    chart_g = svg
    .append('g')
    .attr('id', 'chart_g')
    .attr(
      'transform',
      `translate(${dimen.left}, ${dimen.top})`
    );

    // from the data, create an array of objects based on 'variables_x' array
    const data_obj_ar = _map(variables_x, (x_name,i) => {
      return {
        x_name: x_name,
        values: _map(data, (d) => {
          return {
            x_value: d[x_name],
            y_value: d[variable_y],
            fill: x_colors[i],
            x_name: x_name
          }
        })
      }
    });

    // draw main title
    if(typeof title !== 'undefined'){
      svg
      .append('text')
      .attr('x', chart_width/3)
      .attr('y', 25)
      .style('font-weight', 'bold')
      .style('font-size', '20px')
      .style('font-family', 'Verdana')
      .text(title)
    };

    // create tooltip
    const tooltip_g = chart_g
    .append('g')
    .style('font-weight','bold')
    .style('font-size', '13px')
    .style('font-family', 'Verdana');

    // define scaling
    // x scale
    // figure out x_min_max
    if(typeof x_ticks !== 'undefined'){
      x_ticks_n = undefined;
      x_min_max = [d3_min(x_ticks), d3_max(x_ticks)]
    }else if(typeof x_min_max === 'undefined'){
      const x_min_ar = [];
      const x_max_ar = [];
      _forEach(data_obj_ar, (x_name,i) => {
        const min_max = d3_extent(data_obj_ar[i]['values'], d => d.x_value)
        x_min_ar.push(min_max[0]);
        x_max_ar.push(min_max[1]);
      })
      x_min_max = [d3_min(x_min_ar), d3_max(x_max_ar)];
    };

    const xScale = scaleLinear()
    .domain(x_min_max)
    .rangeRound([0, chart_width])
    .clamp(true);

    // X axis
    const xAxis = axisBottom(xScale)
    .ticks(x_ticks_n)
    .tickFormat(x_ticks_format)
    .tickValues(x_ticks)
    const xAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .style('font-family', 'Verdana')
    .style('transform', `translateY(${chart_height}px)`)
    .call(xAxis);

    // add x axis title
    if(typeof x_title !== 'undefined'){
      xAxisGroup
      .append('text')
      .attr('x', chart_width / 2)
      .attr('y', dimen.bottom - 10)
      .style('fill', 'black')
      .text(x_title)
    };

    // define the y axis scaling and axis
    // Y scaling
    // figure out y_min_max
    if(typeof y_ticks !== 'undefined'){
      y_min_max = [d3_min(y_ticks), d3_max(y_ticks)]
    }else if(typeof y_min_max === 'undefined'){
      const y_min_ar = [];
      const y_max_ar = [];
      _forEach(data_obj_ar, (x_name,i) => {
        const min_max = d3_extent(data_obj_ar[i]['values'], d => d.y_value);
        y_min_ar.push(min_max[0]);
        y_max_ar.push(min_max[1]);
      });
      y_min_max = [d3_min(y_min_ar), d3_max(y_max_ar)];
    }

    const yScale = scaleLinear()
    .domain(y_min_max)
    .rangeRound([chart_height, 0])	
    .nice()	
    .clamp(true);

    // Y axis
    const yAxis = axisLeft(yScale)
    .ticks(y_ticks_n)
    .tickFormat(y_ticks_format)
    .tickValues(y_ticks)
    const yAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .style('font-family', 'Verdana')
    .call(yAxis);
    
    // add y axis title
	  if(typeof y_title !== 'undefined'){
      yAxisGroup
      .append('text')
      .attr('x', -(chart_height / 2)) // note the sign
      .attr('y', -dimen.left + 10)
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text(y_title)
    };

    // draw points 
    const exitTransition = transition().duration(1500);
    const updateTransition = exitTransition.transition().duration(1500);

    chart_g.append('g')
    .selectAll('g')
    .data(data_obj_ar)
    .join('g')
    .attr('id', d => d.x_name)
    .selectAll('circle')
    .data(function(d){return d.values})
    .join(
      (enter) => enter
      .append('circle')
      .attr('cx', d => xScale(d.x_value))
      .attr('cy', chart_height)
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
      .text(`${datum['x_name']}: ${datum['x_value']}`)
      tooltip_g.append('text')
      .attr('dx', '0.5em')
      .attr('dy', '1em')
      .style('fill', 'red')
      .text(`${variable_y}: ${datum['y_value']}`)
    })
    .on('mouseleave',function(ev){
      tooltip_g.selectAll('text').remove()
    })
    .transition(updateTransition)
    .attr('cx', d => xScale(d.x_value))
    .attr('cy', d => yScale(d.y_value))
    .attr('r', point_radius)
    .style('stroke', point_stroke)
    .style('fill', d => d.fill);

    // create legend
    const x_loc = dimen.left + chart_width;
    const y_loc = dimen.top + chart_height/2;

    const legendGroup = svg
    .append('g')
    .attr('id', 'legend_g')
    .attr('font-family', 'Verdana')
    .attr('font-size', 10)
    .selectAll('g')
    .data(variables_x.slice().reverse())
    .join('g')
    .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

    legendGroup
    .append('rect')
    .attr('x', x_loc)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', (d,i) => x_colors[i]);

    legendGroup
    .append('text')
    .attr('x', x_loc + 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d);

    return this;
  }
  return {
    init: init,
    set_dimes: set_dimes,
    set_titles: set_titles,
    set_variables_x: set_variables_x,
    set_variable_y: set_variable_y,
    set_point_stroke: set_point_stroke,
    set_point_radius: set_point_radius,
    set_x_colors: set_x_colors,
    set_x_ticks_n: set_x_ticks_n,
    set_x_ticks: set_x_ticks,
    set_x_min_max: set_x_min_max,
    set_x_ticks_format: set_x_ticks_format,
    set_y_min_max: set_y_min_max,
    set_y_ticks_n: set_y_ticks_n,
    set_y_ticks: set_y_ticks,
    set_y_ticks_format: set_y_ticks_format,
    draw_scatter: draw_scatter
  }
}

export {app_scatter};