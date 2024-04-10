import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { transition } from 'd3-transition';
import { max as d3_max, min as d3_min, bin as d3_bin, ticks as d3_ticks} from 'd3-array';
import { Dimensions } from './helpers';

/**
 * Creates a svg histogram chart based on d3 that can easily be made interactive.
 * 
 * @author Rick Dean
 * @description Creates a histogram from either a numeric array or an object with
 *   a numeric array element.  Options are provided for specifing the bins.
 *   Each of the functions can be chained to set up and draw the chart.
 *   All of the functions return an object with references to all publicly available setup/draw functions.
 * @example See 'demo_histogram' folder for an example.
 * @returns {object} The publicly available functions in constructing the chart.
 */
const app_histo = function(){
  let svg = undefined;
  let data = undefined;
  let chart_g = undefined;
  let dimen = new Dimensions();
  let bar_fill = 'blue';
  let chart_width = 0;
  let chart_height = 0;
  let title = undefined, x_title = undefined, y_title = undefined;
  let label_bars = false;
  let variable = undefined;
  let n_bins = undefined; // integer
  let bins = undefined; // []
  let bins_nice = undefined; // [start, stop, count]

  // public functions
  /**
   * Creates the svg with its default dimensions and assigns 'data' argument
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {object | object[]} new_data An object or array of objects with numeric data. 
   * @returns {object} 'app_histo' public function references.
   */
  function init(new_host, new_data){
    data = new_data;
    // create svg
    svg = select(`#${new_host}`)
    .datum(data)
    .append('svg');

    set_dimes(dimen);
    return this;
  };
  /** 
   * Defines the dimensions for the svg
   * 
   * @param {Dimensions} new_dimen A numeric object defining an svg's 
   *   width, height, top, bottom, left, right.
   * @returns {object} 'app_histo' public function references.
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
   * @returns {object} 'app_histo' public function references.
  */
  function set_titles(new_title, new_x_title, new_y_title){
    title = new_title;
    x_title = new_x_title;
    y_title = new_y_title;
    return this;
  };
  /**
   * Defines the fill color of the bars. Default is 'blue'.
   * 
   * @param {string} new_bar_fill 
   * @returns {object} 'app_histo' public function references.
   */
  function set_bar_fill(new_bar_fill){
    bar_fill = new_bar_fill;
    return this;
  };
  /**
   * If 'true' will label the bars with their values.
   * 
   * @param {boolean} new_label_bars 
   * @returns {object} 'app_histo' public function references.
   */
  function set_label_bars(new_label_bars){
    label_bars = new_label_bars;
    return this;
  };
  /**
   * If 'data' is an object, then this names the element with the numeric array.
   * 
   * @param {string} new_variable 
   * @returns {object} 'app_histo' public function references.
   */
  function set_variable(new_variable){
    variable = new_variable;
    return this;
  };
  /**
   * Sets the approximate number of bins to chart.  d3 attempts to 
   *   realize 'nice' bin boundaries, so the number of bins will not
   *   always agree with the input.
   * 
   * @param {number} new_n_bins 
   * @returns {object} 'app_histo' public function references.
   */
  function set_n_bins(new_n_bins){
    bins = undefined;
    bins_nice = undefined;
    n_bins = new_n_bins;
    return this;
  };
  /**
   * Sets the actual bin boundaries with a numeric array.
   * 
   * @param {number[]} new_bins 
   * @returns {object} 'app_histo' public function references.
   */
  function set_bins(new_bins){
    bins_nice = undefined;
    n_bins = undefined;
    bins = new_bins;
    return this;
  };
  /**
   * A 3-element numeric array of [start,stop,count] to produce 'nice' bin boundaries.
   * 
   * @param {number[]} new_bins_nice 
   * @returns {object} 'app_histo' public function references.
   */
  function set_bins_nice(new_bins_nice){
    bins = undefined;
    n_bins = undefined;
    bins_nice = new_bins_nice;
    return this;
  };
  /**
   * Draws a d3 svg histogram based on 'data' set by the 'init()' function.
   * 
   * @throws {Error} If 'data' is not specified or if 'data' is an object and 'variable'
   *   is not specified.  Also one of 'n_bins', 'bins', or 'bins_nice' must be specified.
   * @returns {object} 'app_histo' public function references.
   */
  function draw_histo(){
    // do we have selected variable?
    if(typeof variable === 'undefined'){
      throw new Error("The 'variable' argument must be specified");
    };
    // do we have data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified");
    };
    // do we have bin intervals
    if(typeof n_bins === 'undefined' && typeof bins === 'undefined' && typeof bins_nice === 'undefined'){
      throw new Error("Please specify bin intervals (i.e. n_bins, bins, or bins_nice).")
    };

    // assuming repeated calls to 'draw_histo()', 
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
      svg
      .append('text')
      .attr('x', chart_width/3)
      .attr('y', 25)
      .style('font-weight', 'bold')
      .style('font-size', '20px')
      .style('font-family', 'Verdana')
      .text(title)
    };

    // sort out the bins
    // we can handle either a simple numeric array or object with 
    //  an element containing a numeric array.
    let data_v;
    const xAccessor = (d) => d;
    if(Array.isArray(data)){
      data_v = data;
    }else {
      data_v = data[variable];
    }
    
    let bin_min_max;
    let bin_d3;
    let data_binned;
    if(typeof bins !== 'undefined'){
      // check if 'bins' is an array
      if(!Array.isArray(bins)){
        throw new Error("The argument 'bins' must be an array of bin locations.");
      }
      bin_min_max = [d3_min(bins), d3_max(bins)];
      bin_d3 = d3_bin()
      .domain(bin_min_max)
      .value(xAccessor)
      .thresholds(bins);

      data_binned = bin_d3(data_v);
      data_binned = data_binned.slice(0, data_binned.length - 1);
    }else if(typeof bins_nice !== 'undefined'){
      // check if 'bins_nice' is a 3 element array [start, stop, count]
      if(!Array.isArray(bins_nice) || bins_nice.length !== 3){
        throw new Error("The 'bins_nice' array is not in the form [start, stop, count]");
      }
      bins = d3_ticks(bins_nice[0], bins_nice[1], bins_nice[2]);
      bin_min_max = [d3_min(bins), d3_max(bins)];
      bin_d3 = d3_bin()
      .domain(bin_min_max)
      .value(xAccessor)
      .thresholds(bins);
      data_binned = bin_d3(data);
      data_binned = data_binned.slice(0, data_binned.length - 1);
    }else if(typeof n_bins !== 'undefined'){
      bin_d3 = d3_bin()
      .value(xAccessor)
      .thresholds(n_bins);
      data_binned = bin_d3(data);
      const bin_min = data_binned[0].x0;
		  const bin_max = data_binned[data_binned.length-1].x1;
		  bin_min_max = [bin_min, bin_max];
    }

    // define scaling
    // x scale
    const xScale = scaleLinear()
    .domain(bin_min_max)
    .range([0, chart_width]);

    // y scale 
    const yAccessor = d => d.length;
    // find the longest length
    const yScale = scaleLinear()
    .domain([0, d3_max(data_binned, yAccessor)]) // gets the max length among inner arrays of data_binned
    .range([chart_height, 0]) // want to reverse the values because svg starts at upper left corner
    .nice(); // this will round the domain values

    // draw bars
    const exitTransition = transition().duration(1500);
    const updateTransition = exitTransition.transition().duration(1500);
    const padding = 1;

    chart_g.selectAll('rect')
    .data(data_binned)
    .join(
      (enter) => enter
      .append('rect')
      .attr('x', d => xScale(d.x0))
      .attr('y', d => yScale(yAccessor(d)))
      .attr('width', d => d3_max([0, xScale(d.x1) - xScale(d.x0) - padding]))
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
    .attr('width', d => d3_max([0, xScale(d.x1) - xScale(d.x0) - padding])) // convert lower/upper bin values to chart values
    .attr('height', d => chart_height - yScale(yAccessor(d))) // convert/scale lengths to chart value
    .attr('x', d => xScale(d.x0)) // location is bin's lower humidity value
    .attr('y', d => yScale(yAccessor(d))) // inner array lengths converted to chart values
    .attr('fill', bar_fill);

    //label bars
    if(typeof label_bars !== 'undefined'){
      chart_g.append('g') // add a group to ctr group
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .selectAll('text') // set up empty 'text' elements
      .data(data_binned)
      .join(
        (enter) => enter
        .append('text')
        .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr('y', chart_height)
        .text(yAccessor),
        (update) => update,
        (exit) => exit
        .transition(exitTransition)
        .attr('y', chart_height)
        .remove()
      ) // join the text elements with arrays in data which has 8 inner arrays
      .transition(updateTransition)
      .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2) // locate the x coordinate for text
      .attr('y', d => yScale(yAccessor(d)) - 10) // locate y coordinate
      .text(yAccessor) // returns the length of each of the inner arrays
    };
    // draw axis'
    // draw x axis
    const xAxis = axisBottom(xScale);
    const xAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .style('transform', `translateY(${chart_height}px)`); // move it to the bottom of svg
    xAxisGroup.call(xAxis); // draw the axis
    
    // draw y axis
    const yAxis = axisLeft(yScale);
    const yAxisGroup = chart_g
    .append('g')
    .style('font-size','12px')
    .style('font-weight','bold')
    .call(yAxis);

    // draw x title
    if(typeof x_title !== 'undefined'){
      xAxisGroup
      .append('text')
      .attr('x', chart_width / 2)
      .attr('y', dimen.bottom - 10)
      .attr('fill', 'black')
      .text(x_title);
    };

    // draw y title
    if(typeof y_title !== 'undefined'){
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

    return this;
  }
  return {
    init: init,
    set_dimes: set_dimes,
    set_titles: set_titles,
    set_bar_fill: set_bar_fill,
    set_label_bars: set_label_bars,
    set_variable: set_variable,
    set_n_bins: set_n_bins,
    set_bins: set_bins,
    set_bins_nice: set_bins_nice,
    draw_histo: draw_histo
  };
}

export {app_histo};