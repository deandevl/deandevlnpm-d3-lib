import { select } from 'd3-selection';
import { map as _map, sum as _sum, forEach as _forEach, pick as _pick, clone as _clone } from 'lodash';
/**
 * Creates a svg table based on d3 that can easily be made interactive.
 * @author Rick Dean
 * @description 
 *   Each of the functions can be chained to set up and draw the table.
 *   All of the functions return an object with references to all publicly available setup/draw functions.
 * @example See 'demo_table' folder for an example.
 * @returns {object} The publicly available functions in constructing the table.
 */
const app_table = function(){
  let svg = undefined;
  let data = undefined;
  let data_filtered = undefined;
  let cell_widths = undefined;
  let cell_height = 40;
  let variables = undefined;
  let headings = undefined;
  let head_backgrd = 'white';
  let head_fill = 'black';
  let cell_backgrd = 'white';
  let cell_fill = 'black';
  let cell_stroke = 'black';
  let title = undefined;

  // public functions
  /**
   * Creates the svg with its default dimensions and assigns 'data' argument
   * 
   * @param {string} new_host The id of the html element hosting the chart.
   * @param {object | object[]} new_data An object or array of objects with numeric data. 
   * @returns {object} 'app_table' public function references.
   */
  function init(new_host, new_data){
    data = new_data;

    // create svg
    svg = select(`#${new_host}`)
    .datum(data)
    .append('svg')

    return this;
  };
  /**
   * A numeric array with the same length as 'variables' that
   *   sets the individual cell widths. 
   * The default is 120 pixels for each cell.
   * 
   * @param {number[]} new_cell_widths
   * @returns 
   */
  function set_cell_widths(new_cell_widths){
    cell_widths = new_cell_widths;
    return this;
  }
  /**
   * Set the height for all table cells. Default is 40 pixels.
   * 
   * @param {number} new_cell_height 
   * @returns 
   */
  function set_cell_height(new_cell_height){
    cell_height = new_cell_height;
    return this;
  }
  /** 
   * Defines the table's main title.
   * 
   * @param {string} new_title The table's main title.
   * @returns {object} 'app_table' public function references.
  */
  function set_title(new_title){
    title = new_title;
    return this;
  };
  /**
   * The variable names from 'data' to show in the table.
   * The 'data' array of objects will be filtered to include
   *   just 'variables'.
   * 
   * @param {string[]} new_variables 
   * @returns {object} 'app_table' public function references.
   */
  function set_variables(new_variables){
    variables = new_variables;
    // filter 'data' 
    data_filtered = _map(data, (o) => {
      return _pick(o, variables)
    })
    return this;
  };
  /**
   * The main headings cooresponding to the 'variables'. If 'undefined'
   *   then the stings of 'variables' will be used.
   * 
   * @param {string[]} new_headings 
   * @returns {object} 'app_table' public function references.
   */
  function set_headings(new_headings){
    headings = new_headings;
    return this;
  }
  /**
   * The background color to use for the headings.
   * 
   * @param {string} new_head_backgrd 
   * @returns 'app_table' public function references.
   */
  function set_head_backgrd(new_head_backgrd){
    head_backgrd = new_head_backgrd;
    return this;
  }
  /**
   * Sets the header text color.
   * 
   * @param {string} new_head_fill 
   * @returns 'app_table' public function references.
   */
  function set_head_fill(new_head_fill){
    head_fill = new_head_fill;
    return this;
  }
  /**
   * The color for the table's cell lines. The default is 'black'.
   * 
   * @param {string} new_cell_stroke 
   * @returns 'app_table' public function references.
   */
  function set_cell_stroke(new_cell_stroke){
    cell_stroke = new_cell_stroke;
    return this;
  }
  /**
   * The color for text in the table's cells.
   * 
   * @param {string} new_cell_fill 
   * @returns 'app_table' public function references. The default is 'black'.
   */
  function set_cell_fill(new_cell_fill){
    cell_fill = new_cell_fill;
    return this;
  }
  /**
   * Sets the cells background color.
   * 
   * @param {string} new_cell_backgrd 
   * @returns 'app_table' public function references. The default is 'black'.
   */
  function set_cell_backgrd(new_cell_backgrd){
    cell_backgrd = new_cell_backgrd;
    return this;
  }
  /**
   * Draws a d3 svg table based on 'data' set by the 'init()' function.
   * 
   * @throws {Error} If either 'data' or 'variables' arguments have not been set.
   * @returns 'app_table' public function references.
   */
  function draw_table(){
    // do we have a data
    if(typeof data === 'undefined'){
      throw new Error("The 'data' argument must be specified in the init() function.");
    }
    // do we have variables
    if(typeof variables === 'undefined'){
      throw new Error("The 'variables' argument must be specified in the set_variables() function");
    }

    if(typeof cell_widths === 'undefined'){
      cell_widths = _map(variables, (d) => {return 120;})
    }
    if(typeof headings === 'undefined'){
      headings = _clone(variables);
    }

    const offsets = [];
    let running_sum = 0;
    _forEach(cell_widths, (d) => {
      offsets.push(running_sum);
      running_sum = running_sum + d;
    })

    const title_y = 40;
    const left_margin = 10;
    const title_height = 20;
    const header_y = title_y + title_height;
    const header_height = 40;
    const table_y = header_y + header_height;
    const svg_width = _sum(cell_widths) + left_margin;
    const svg_height = table_y + cell_height * data.length;
    const keys = Object.keys(data[0]);

    svg
    .attr('width', svg_width)
    .attr('height', svg_height);

    // assuming repeated calls to 'draw_table()', 
    //   remove all svg elements  
    svg.selectAll("*").remove();

    // create main group
    const table_g = svg
    .append('g')
    .attr('id', 'table_g');

     // draw main title
     if(typeof title !== 'undefined'){
      table_g
      .append('text')
      .attr('x', 20)
      .attr('y', title_y)
      .style('text-anchor', 'start')
      .style('font-weight', 'bold')
      .style('font-size', '20px')
      .style('font-family', 'Verdana')
      .text(title)
    };

    // fill header
    const headerGroup = table_g
    .append('g')
    .attr('id', 'header_g')
    .style('font-family', 'Verdana')
    .style('font-size', 20)
    .style('font-weight', 'bold')
    .style('text-anchor', 'middle')
  
    const headerCellGroups = headerGroup
    .selectAll('g')
    .data(cell_widths)
    .join('g')

    headerCellGroups
    .append('rect')
    .attr('x', (d,i) => offsets[i])
    .attr('y', header_y)
    .attr('width', (d) => d)
    .attr('height', cell_height)
    .style('fill', head_backgrd)
    .style('stroke', cell_stroke)

    headerCellGroups
    .append('text')
    .attr('x', (d,i) => offsets[i])
    .attr('y', header_y)
    .attr('dx', (d,i) => cell_widths[i]/2)
    .attr('dy', cell_height/2 + 4)
    .style('fill', head_fill)
    .style('text-anchor','middle')
    .text((d,i) => headings[i])

    // add retangles
    const rectGroup = table_g
    .append('g')
    .attr('id', 'rect_g')
    .attr('transform', `translate(0, ${table_y})`)

    const rectCells = rectGroup
    .selectAll('g')
    .data(data_filtered)
    .join('g')
    .attr('transform', (d,i) => `translate(0, ${i * cell_height})`)

    rectCells
    .selectAll('rect')
    .data((d,i) => {
      return Object.entries(d);
    })
    .join('rect')
    .attr('x', (d,i) => {
      return offsets[i];
    })
    .attr('width', (d,i) => cell_widths[i])
    .attr('height', cell_height)
    .style('fill', cell_backgrd)
    .style('stroke', cell_stroke)
    
    // add text
    const textGroup = table_g
    .append('g')
    .attr('id', 'text_g')
    .attr('transform', `translate(0, ${table_y})`)
    
    const textCells = textGroup
    .selectAll('g')
    .data(data_filtered)
    .join('g')
    .attr('transform', (d,i) => `translate(0, ${i * cell_height + cell_height})`)

    textCells
    .selectAll('text')
    .data((d,i) => {
      return Object.entries(d);
    })
    .join('text')
    .attr('x', (d,i) => {
      return offsets[i] + 5;
    })
  //  .attr('dx', (d,i) => cell_widths[i])
    .attr('dy', -cell_height/2 + 4)
    .style('fill', cell_fill)
    .style('font-family', 'Verdana')
    .text(d => d[1])

    return this;
  }
  return {
    init: init,
    set_cell_widths: set_cell_widths,
    set_cell_height: set_cell_height,
    set_title: set_title,
    set_variables: set_variables,
    set_headings: set_headings,
    set_head_backgrd: set_head_backgrd,
    set_head_fill: set_head_fill,
    set_cell_stroke: set_cell_stroke,
    set_cell_backgrd: set_cell_backgrd,
    set_cell_fill: set_cell_fill,
    draw_table: draw_table
  };
}

export {app_table};