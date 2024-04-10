import { select, pointer as d3_pointer } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { transition } from 'd3-transition';
import { max as d3_max, min as d3_min, extent as d3_extent, bisector as d3_bisector} from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import { utcParse, utcFormat } from 'd3-time-format';
import { line as d3_line} from 'd3-shape';
import { filter as _filter, indexOf as _indexOf, forEach as _forEach, map as _map } from 'lodash';
import { Dimensions } from './helpers';

/**
 * Creates a svg timeseries chart based on d3 that can easily be made interactive.
 * @description Charts multiple timeseries that includes a tracking ball for displaying
 *   time/data value on mouse movement.  Options are provided for customizing x/y axis'.
 *   Each of the functions can be chained to set up and draw the chart.
 *   All of the functions return an object with references to all publicly available setup/draw functions.
 * @example See 'demo_timeseries' folder for examples.
 * @returns {object} The publicly available functions in constructing the chart.
 */

const app_timeseries = function(){
  let host = undefined;
  let svg = undefined;
  let data = undefined;
  let chart_g = undefined;
  let dimen = new Dimensions();
  let chart_width = 0;
  let chart_height = 0;
  let title = undefined, x_title = undefined, y_title = undefined;
  let variable_x = undefined;
  let variables_y = undefined;  // []
  let variables_y_labels = undefined;
  let time_format = '%Y-%m-%d';
  let line_width = 2;
  let y_colors = schemePaired;
  let x_ticks = undefined;
  let x_ticks_format = '%Y-%b';
  let y_min_max = undefined;
  let y_ticks_n = undefined;
  let y_ticks = undefined;
  let y_ticks_format = (d,i) => d;
  let y_track = undefined;

  // public functions
  /**
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {object | object[]} new_data An array of objects with both date or time and cooresponding numeric values. 
   * @returns {object} 'app_timeseries' public function references.
   */
  function init(new_host, new_data){
    host = new_host
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
   * @returns {object} 'app_timeseries' public function references.
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
   * @returns {object} 'app_timeseries' public function references.
  */
  function set_titles(new_title, new_x_title, new_y_title){
    title = new_title;
    x_title = new_x_title;
    y_title = new_y_title;
    return this;
  };
  /**
   * The element variable name from an array of objects 'data' that provides the date/time(x).
   * 
   * @param {string[]} new_variable_x 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_variable_x(new_variable_x){
    variable_x = new_variable_x;
    return this;
  };
  /**
   * The element variable names from an array of objects 'data' that provides the date/times cooresponding values(y).
   * 
   * @param {string[]} new_variables_y 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_variables_y(new_variables_y){
    variables_y = new_variables_y;
    return this;
  };
  /**
   * An array of display names for the cooresponding values.  The default
   *   are the names from 'variables_y'.
   * 
   * @param {string[]} new_variables_y_labels 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_variables_y_labels(new_variables_y_labels){
    variables_y_labels = new_variables_y_labels;
    return this;
  };
  /**
   * Sets the time format along the x axis. The default is '%Y-%m-%d'.
   * 
   * @param {string} new_time_format 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_time_format(new_time_format){
    time_format = new_time_format;
    return this;
  };
  /**
   * Sets the width of the timeseries line(s). The default is 2.
   * 
   * @param {number} new_line_width 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_line_width(new_line_width){
    line_width = new_line_width;
    return this;
  };
  /**
   * Sets the colors for the line(s). The default is schemePaired from 
   *   d3-scale-chromatic.
   * 
   * @param {string[]} new_y_colors 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_y_colors(new_y_colors){
    y_colors = new_y_colors;
    return this;
  };
  /**
   * Sets the actual tics along the x axis.  See d3's d3-time for 
   *   convenience functions such as 'utcMonths', 'utcYears'.
   * 
   * @param {Date[]} new_x_ticks 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_x_ticks(new_x_ticks){
    x_ticks = new_x_ticks;
    return this;
  };
  /**
   * A string that sets the x-axis data format. Default is '%Y-%b'.
   * 
   * @param {string} new_x_ticks_format 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_x_ticks_format(new_x_ticks_format){
    x_ticks_format = new_x_ticks_format;
    return this;
  };
  /**
   * A two element number array defining the min/max along the y-axis.
   * 
   * @param {*} new_y_min_max 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_y_min_max(new_y_min_max){
    y_min_max = new_y_min_max;
    return this;
  };
  /**
   * The number of ticks along the y axis.
   * 
   * @param {number} new_y_ticks_n 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_y_ticks_n(new_y_ticks_n){
    y_ticks_n = new_y_ticks_n;
    return this;
  };
  /**
   *  Defines the ticks along the y-axis.
   * 
   * @param {number[]} new_y_ticks 
   * @returns {object} 'app_timeseries' public function references.
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
   * @param {*} new_y_ticks_format 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_y_ticks_format(new_y_ticks_format){
    y_ticks_format = new_y_ticks_format;
    return this;
  };
  /**
   * The name of the variable from 'data' to associate a tracking ball
   *   giving the date/value at its location on the timeseries line.
   * 
   * @param {string} new_y_track 
   * @returns {object} 'app_timeseries' public function references.
   */
  function set_y_track(new_y_track){
    y_track = new_y_track;
    return this;
  };
  /**
   * Draws a d3 svg line timeseries based on 'data' set by the 'init()' function.
   * 
   * @throws {Error} If the required 'data' of 'init()' has not been supplied.  
   *   Also, 'variable_x' the date variable  and 'variables_y' the cooresponding value(s) must be set.
   * @returns {object} 'app_timeseries' public function references.
   */
  function draw_timeseries(){
    // do we have data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified");
    };
    // do we have x and y variables?
    if(typeof variable_x === 'undefined' || typeof variables_y === 'undefined'){
      throw new Error("The 'variable_x' and 'variables_y' arguments must be specified.");
    };

    // assuming repeated update calls to 'draw_timeseries()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();
    chart_g = svg
    .append('g')
    .attr('id', 'chart_g')
    .attr(
      'transform',
      `translate(${dimen.left}, ${dimen.top})`
    );

    // from the data, create an array of objects based on 'variables_y' array
    const dateFormat = utcFormat(time_format);
    const parseDate = utcParse(time_format); 

    let data_obj_ar = _map(variables_y, (y_name,i) => {
      return {
        y_name: y_name,
        stroke: y_colors[i],
        values: _map(data, (d) => {
          return {
            x_value: parseDate(d[variable_x]),
            y_value: d[y_name],
            y_name: y_name
          }
        })
      }
    });

    // draw main title?
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

    // y tracking?
    let tooltip_div;
    select('#tooltip_div').remove();
    if(typeof y_track !== 'undefined' && _indexOf(variables_y, y_track) !== -1){
      const track_data = _filter(data_obj_ar, (d) => {return d.y_name === y_track});
      const track_values = track_data[0]['values'];
      const xAccessor = (d) => d.x_value;
		  const yAccessor = (d) => d.y_value;
      // create parent div on 'host'
      const host_el = select(`#${host}`);
      tooltip_div = host_el
      .append('div')
      .attr('id', 'tooltip_div')
      .style('font-weight','bold')
      .style('font-size', '13px')
      .style('font-family', 'Verdana')
      .style('border', '1px solid #ccc')
      .style('position', 'absolute')
      .style('display', 'none')
      .style('padding', '5px');

      select('#tooltip_div')
      .append('div')
      .attr('class','y_value');

      select('#tooltip_div')
      .append('div')
      .attr('class', 'x_value');

      // create circle tracker
      const tooltipDot = chart_g
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#fc8781')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .style('pointer-events', 'none')

      // create a transparent rectangle over graphing area  
      //  for circle tracker positioning
      chart_g
      .append('rect')
      .attr('width', chart_width)
      .attr('height', chart_height)
      .style('opacity', 0)
      .on('touchmouse mousemove', function(event){
        const mousePos = d3_pointer(event, this)
        const x_value = xScale.invert(mousePos[0])
        const bisector_d3 = d3_bisector(xAccessor).right
        const index = bisector_d3(track_values, x_value)
        const a_row = track_values[index-1]
        tooltipDot
        .style('opacity', 1)
        .attr('cx', xScale(xAccessor(a_row)))
        .attr('cy', yScale(yAccessor(a_row)))
        .raise()

        tooltip_div
        .style('display', 'block')
        .style('top', yScale(yAccessor(a_row)) + 'px')
        .style('left', xScale(xAccessor(a_row)) + 'px')

        tooltip_div
        .select('.y_value')
        .text(`${yAccessor(a_row)}`)
        tooltip_div
        .select('.x_value')
        .text(`${dateFormat(xAccessor(a_row))}`)
      })
      .on('mouseleave', function(event){
        tooltipDot.style('opacity',0)
        tooltip_div.style('display', 'none')
      })
    };
    
    // define scaling
    // x scale
    let x_min_max;
    if(typeof x_ticks !== 'undefined'){
      x_min_max = [d3_min(x_ticks), d3_max(x_ticks)];
    }else {
      const x_min_ar = [];
      const x_max_ar = [];
      _forEach(data_obj_ar, (y_name,i) => {
        const min_max = d3_extent(data_obj_ar[i]['values'], d => d.x_value);
        x_min_ar.push(min_max[0]);
        x_max_ar.push(min_max[1]);
      });
      x_min_max = [d3_min(x_min_ar), d3_max(x_max_ar)];
    };

    _forEach(data_obj_ar, (d) => {
      const values = _filter(d.values, dd => {
        return dd.x_value >= x_min_max[0] && dd.x_value <= x_min_max[1];
      })
      d.values = values;
    });
      
    const xScale = scaleLinear()
    .domain(x_min_max)
    .rangeRound([0, chart_width])
    .clamp(true);

    // X axis
    const xAxis = axisBottom(xScale)
    .tickValues(x_ticks)
    .tickFormat(utcFormat(x_ticks_format));

    const xAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
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
      y_ticks_n = undefined;
      y_min_max = [d3_min(y_ticks), d3_max(y_ticks)]
    }else if(typeof y_min_max === 'undefined'){
      const y_min_ar = [];
      const y_max_ar = [];
      _forEach(data_obj_ar, (y_name,i) => {
        const min_max = d3_extent(data_obj_ar[i]['values'], d => d.y_value);
        y_min_ar.push(min_max[0]);
        y_max_ar.push(min_max[1]);
      })
      y_min_max = [d3_min(y_min_ar), d3_max(y_max_ar)];
    };

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

    // draw lines
    const exitTransition = transition().duration(1500);
    const updateTransition = exitTransition.transition().duration(1500);

    const line_gen = d3_line()
    .x((d) => {
      return xScale(d.x_value);
    })
    .y((d) => {
      return yScale(d.y_value);
    });

    chart_g
    .append('g')
    .selectAll('g')
    .data(data_obj_ar)
    .join('g')
    .attr('id', d => d.y_name)
    .style('stroke', d => d.stroke)
    .append('path')
    .datum((d) => d.values)
    .attr('d', line_gen)
    .style('fill', 'none')
    .style('stroke-width', line_width);

    // draw legend
    // check y titles
    let y_titles;
    if(typeof variables_y_labels === 'undefined'){
      y_titles = variables_y;
    }else {
      y_titles = variables_y_labels;
    };

    const x_loc = dimen.left + chart_width;
    const y_loc = dimen.top + chart_height/2;

    const legendGroup = svg
    .append('g')
    .attr('id', 'legend_g')
    .attr('font-family', 'Verdana')
    .attr('font-size', 10)
    .selectAll('g')
    .data(variables_y.slice().reverse())
    .join('g')
    .attr('transform', (d, i) => `translate(0,${y_loc + i * 20})`);

    legendGroup
    .append('rect')
    .attr('x', x_loc)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', (d,i) => {
      return y_colors[i]
    });

    legendGroup
    .append('text')
    .attr('x', x_loc + 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text((d,i) => {
      return y_titles[i]
    });

    return this;
  }
  return {
    init: init,
    set_dimes: set_dimes,
    set_titles: set_titles,
    set_variable_x: set_variable_x,
    set_variables_y: set_variables_y,
    set_variables_y_labels: set_variables_y_labels,
    set_time_format: set_time_format,
    set_line_width: set_line_width,
    set_y_colors: set_y_colors,
    set_x_ticks: set_x_ticks,
    set_x_ticks_format: set_x_ticks_format,
    set_y_min_max: set_y_min_max,
    set_y_ticks_n: set_y_ticks_n,
    set_y_ticks: set_y_ticks,
    set_y_ticks_format: set_y_ticks_format,
    set_y_track: set_y_track,
    draw_timeseries: draw_timeseries
  };
}

export {app_timeseries};
