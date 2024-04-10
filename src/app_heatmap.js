import { select } from 'd3-selection';
import { scaleLinear, scaleQuantize, scaleQuantile, scaleThreshold } from 'd3-scale';
import { max as d3_max, min as d3_min, extent as d3_extent} from 'd3-array';
import { map as _map, sortBy as _sortBy } from 'lodash';
import { Dimensions } from './helpers';

/**
 * Creates a svg heatmap chart based on d3 that can easily be made interactive.
 * 
 * @author Rick Dean
 * @description Charts a heatmap with a choice of scalings for 'linear', 'quantize', 'quantile', 'threshold'.
 *   Each of the functions can be chained to set up and draw the chart.
 * @example See 'demo_heatmap' folder for an example.
 * @returns {object} The publicly available functions in constructing the chart.
 */
const app_heatmap = function(){
  let svg = undefined;
  let data = undefined; // a simple array of numbers or array of objects 
  let chart_g = undefined;
  let dimen = new Dimensions();
  let chart_width = 0;
  let chart_height = 0;
  let title = undefined;
  let variable = undefined; // required if 'data' is an array of objects
  let scale = undefined; // ['linear', 'quantize', 'quantile', 'threshold']
  let thresholds = undefined; // required array of numbers if 'scale' = 'threshold'
  let colors = ['white','pink','red'];

  // public functions
  /**
   * Creates the svg with its default dimensions and assigns 'data' argument
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {number[] | object} new_data A numeric array or object with an element containing a one dimensional array of numbers.
   * @returns {object} 'app_heatmap' public function references.
   */
  function init(new_host, new_data){
    data = new_data;
    // create svg
    svg = select(`#${new_host}`)
    .datum(data)
    .append('svg')

    set_dimes(dimen);
    return this;
  }
  /** 
   * Defines the dimensions for the svg
   * 
   * @param {Dimensions} new_dimen A numeric object defining an svg's 
   *   width, height, top, bottom, left, right.
   * @returns {object} 'app_heatmap' public function references.
  */
  function set_dimes(new_dimen){
    dimen = new_dimen;
    svg
    .attr('width', dimen.width)
    .attr('height', dimen.height);

    chart_width = dimen.width - dimen.left - dimen.right;
    chart_height = dimen.height - dimen.top - dimen.bottom;
    return this;
  }
  /**
   * Defines the chart's main title.
   * 
   * @param {string} new_title 
   * @returns {object} 'app_heatmap' public function references.
   */
  function set_title(new_title){
    title = new_title;
    return this;
  }
  /**
   * If 'data' is an object, then set element name with an array of numerics.
   * 
   * @param {string} new_variable 
   * @returns {object} 'app_heatmap' public function references.
   */
  function set_variable(new_variable){
    variable = new_variable;
    return this;
  }
  /**
   * Sets the heatmap scale to one of four possible values: 
   *  'linear', 'quantize', 'quantile', 'threshold'.
   * 
   * @param {string} new_scale 
   * @returns {object} 'app_heatmap' public function references.
   */
  function set_scale(new_scale){
    scale = new_scale;
    return this;
  }
  /**
   * Sets the numeric boundaries if 'set_scale()' is 'threshold'.
   * 
   * @param {number[]} new_thresholds 
   * @returns {object} 'app_heatmap' public function references.
   */
  function set_thresholds(new_thresholds){
    thresholds = new_thresholds;
    return this;
  }
  /**
   * Sets the colors across the heatmap's domain of numeric values. 
   * The default is ['white','pink','red'].
   * 
   * @param {string[]} new_colors 
   * @returns {object} 'app_heatmap' public function references.
   */
  function set_colors(new_colors){
    colors = new_colors;
    return this;
  }
  /**
   * Draws the svg d3 based heatmap chart based on 'data' set by the 'init()' function..
   * 
   * @throws {Error} If 'data','variable' or 'scale' are undefined. 
   *   Also if 'scale' is 'threshold', when 'thresholds' is undefined.
   * @returns {object} 'app_heatmap' public function references.
   */
  function draw_heatmap(){
    // do we have data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified as a simple array of numbers or array of objects");
    }
    // do we have a variable
    if(!Array.isArray(data) && typeof variable === 'undefined'){
      throw new Error("The 'variable' argument must be specified for an array of objects");
    }
    // check scale value
    const scales = ['linear', 'quantize', 'quantile', 'threshold']
    if(!scales.includes(scale)){
      throw new Error(`Scale argument must one of the following: ${scales}`)
    }
    // check thresholds present
    if(scale === 'threshold' && typeof thresholds === 'undefined'){
      throw new Error("The threshold scale requires a defined 'thresholds' array argument")
    }

    // assuming repeated calls to 'draw_heatmap()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();
    chart_g = svg
    .append('g')
    .attr('id', 'chart_g')
    .attr(
      'transform',
      `translate(${dimen.left}, ${dimen.top})`)

    // set the data vector and sort it
    let data_v;
    if(Array.isArray(data)){
      data_v = data;
    }else{
      data_v = data[variable]
    }
    //data_v.sort((a,b) => a - b)
    const data_sorted_v = _sortBy(data_v);
    const data_objs_ar = _map(data_sorted_v, (d,i) => {
      return {
        idx: i + 1,
        value: d
      }
    });
    const valAccesor = d => d.value;

    // define the heat scale
    let heat_scale;
    if(scale === 'linear'){ // continuous to continuous
      heat_scale = scaleLinear()
      .domain(d3_extent(data_objs_ar, valAccesor)) // min/max
      .range(colors) 
    }else if(scale === 'quantize'){ // continuous to discrete
      heat_scale = scaleQuantize()
      .domain(d3_extent(data_objs_ar, valAccesor)) // min/max
      .range(colors)
    }else if(scale === 'quantile'){ // continuous to discrete
      heat_scale = scaleQuantile()
      .domain(data_v) // all the data
      .range(colors) 
    }else if(scale === 'threshold'){
      heat_scale = scaleThreshold()
      .domain(thresholds) // custom boundaries
      .range(colors)
    }

    let y_loc = 10;
    // create tooltip
    const tooltip_g = chart_g.append('g')
    .style('font-weight','bold')
    .style('font-size', '13px')
    .style('font-family', 'Verdana')
    .attr('x', 20)
    .attr('y', y_loc)

    // title?
    if(typeof title !== 'undefined'){
      y_loc = y_loc + 30;
      chart_g
      .append('text')
      .style('font-family', 'Verdana')
      .style('font-size', 20)
      .style('font-weight', 'bold')
      .attr('y', y_loc)
      .attr('fill', 'black')
      .text(title)
    }

    // draw rectangles
    const box = 30
    chart_g
    .append('g')
    .attr('transform', 'translate(2,30)')
    .attr('stroke', 'black')
    .selectAll('rect')
    .data(data_objs_ar)
    .join('rect')
    .attr('width', box - 3)
    .attr('height', box - 3)
    .attr('x', (d,i) => box * (i % 20)) // 0, 30, 60...
    .attr('y', (d,i) => box * ((i / 20) | 0) + y_loc)
    .attr('fill', (d) => heat_scale(valAccesor(d)))
    .on('mouseenter', function(ev, datum){
      tooltip_g.append('text')
      .attr('dx', '0.5em')
      .attr('dy', '0em')
      .style('fill', 'red')
      .text(`Index: ${datum['idx']}`)
      tooltip_g.append('text')
      .attr('dx', '0.5em')
      .attr('dy', '1em')
      .style('fill', 'red')
      .text(`Value: ${datum['value']}`)
    })
    .on('mouseleave',function(ev){
      tooltip_g.selectAll('text').remove()
    })
    return this;
  }
  return {
    init: init,
    set_dimes: set_dimes,
    set_title: set_title,
    set_variable: set_variable,
    set_scale: set_scale,
    set_thresholds: set_thresholds,
    set_colors: set_colors,
    draw_heatmap: draw_heatmap
  }
}

export {app_heatmap};