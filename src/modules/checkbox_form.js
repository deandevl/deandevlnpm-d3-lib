'use strict';

import * as d3 from "d3";

function checkbox_form(
  parent_el, 
  vars, title, 
  a_color = 'blue', 
  a_background = 'cyan'
  ){
  const form_el = parent_el.append('form')
  .attr('id', 'vars_form')
  .style('width', '300px')
  .style('margin','0,auto')

  const fieldset_el = form_el.append('fieldset')
  .style('background', a_background)
  .style('border', `solid ${a_color}`)

  fieldset_el
  .append('legend')
  .style('padding','5px')
  .style('background', a_background)
  .style('color', a_color)
  .style('border', `solid ${a_color}`)
  .style('font-family', 'Verdana')
  .text(title)

  const vars_div = fieldset_el.append('div')
  .style('height', '100px')

  if(vars.length > 5){
    vars_div
    .style('overflow-y', 'scroll')
    .style('scrollbar-width', 'thin')
    .style('scrollbar-color', `${a_background} ${a_color}`)
  }
  
  const input_div_el = vars_div
  .append('div')
  .style('display', 'flex')
  .style('flex-direction', 'column')
  
  const checks = input_div_el.selectAll('label')
  .data(vars)
  .join('label')
  .text(d => d)
  
  checks.append('input')
  .attr('type', 'checkbox')
  .attr('class', 'vars_check')
  .attr('value', d => d)

  const button_div = fieldset_el.append('div')
  button_div.append('input')
  .attr('id', 'submit_button')
  .attr('type', 'submit')
  .style('background', a_background)
  .style('color', a_color)
  .text('Submit variables')
}

export {checkbox_form}