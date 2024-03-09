'use strict';

import * as d3 from "d3";

function select_form(
  parent_el, 
  vals, 
  title,
  a_color = 'blue', 
  a_background = 'cyan')
{
  const form_el = parent_el.append('form')
  .attr('id', 'vars_form')
  .style('width', '300px')
  .style('margin','0,auto')
  .style('font-family', 'Verdana')

  const fieldset_el = form_el.append('fieldset')
  .style('background', a_background)
  .style('border', `solid ${a_color}`)

  fieldset_el
  .append('legend')
  .style('padding','5px')
  .style('background', a_background)
  .style('color', a_color)
  .style('border', `solid ${a_color}`)
  .text(title)

  const selects_div = fieldset_el
  .append('div') 

  const select_el = selects_div
  .append('select')
  .attr('id', 'select_var')
  .style('background', a_background)
  .style('color', a_color)
  .style('border', `solid ${a_color}`)
  
  const options = select_el.selectAll('option')
  .data(vals)
  .join('option')
  .attr('value', d => d)
  .attr('class', 'option_val')
  .style('background', a_background)
  .style('color', a_color)
  .text(d => d)

  return {
    select_id: 'select_var',
    option_class: 'option_val'
  }
}

export {select_form}