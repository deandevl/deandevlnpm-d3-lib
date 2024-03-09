'use strict';

import * as d3 from "d3";

function start_stop_count_form(
  parent_el,
  initial_start ,
  initial_stop,
  initial_count,
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
  .style('display', 'flex')
  .style('flex-direction', 'column')

  selects_div
  .append('label')
  .attr('for', 'start_input')
  .text('Select a start')
  .append('input')
  .attr('class', 'start_stop_count_input')
  .attr('name', 'start_input')
  .attr('type', 'number')
  .attr('value', initial_start)
  .style('background', a_background)
  .style('color', a_color)

  selects_div
  .append('label')
  .attr('for', 'stop_input')
  .text('Select a stop')
  .append('input')
  .attr('class', 'start_stop_count_input')
  .attr('type', 'number')
  .attr('value', initial_stop)
  .style('background', a_background)
  .style('color', a_color)

  selects_div
  .append('label')
  .attr('for', 'count_input')
  .text('Select a count')
  .append('input')
  .attr('class', 'start_stop_count_input')
  .attr('type', 'number')
  .attr('value', initial_count)
  .style('background', a_background)
  .style('color', a_color)

  fieldset_el.append('div')
  .append('input')
  .attr('id', 'start_stop_count_submit')
  .attr('type', 'submit')
  .style('background', a_background)
  .style('color', a_color)
  .text('Submit bin settings')
}

export{start_stop_count_form}