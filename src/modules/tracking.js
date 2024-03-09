'use strict';

import * as d3 from "d3";

function track_variable(
  data,
  parent_message_el,
  parent_chart_el,
  chart_width,
  chart_height,
  xScale,
  yScale,
  xAccessor,
  yAccessor,
  xFormat) 
{
  // create a message tooltip 
  d3.select('#tooltip').remove()
  const tooltip = parent_message_el
  .append('div')
  .attr('id','tooltip')
  .style('font-family','Verdana')
  .style('font-weight', 'bold')
  d3.select('#tooltip')
  .append('div')
    .attr('class','y_value')
  d3.select('#tooltip')
  .append('div')
    .attr('class', 'x_value')

  // create circle tracker
  const tooltipDot = parent_chart_el
  .append('circle')
  .attr('r', 5)
  .attr('fill', '#fc8781')
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .style('opacity', 0)
  .style('pointer-events', 'none')

  // circle tracker positioning
  parent_chart_el.append('rect')
  .attr('width', chart_width)
  .attr('height', chart_height)
  .style('opacity', 0)
  .on('touchmouse mousemove', function(event){
    const mousePos = d3.pointer(event, this)
    const x_value = xScale.invert(mousePos[0])
    const bisector_d3 = d3.bisector(xAccessor).right
    const index = bisector_d3(data, x_value)
    const a_row = data[index-1]
    tooltipDot.style('opacity', 1)
      .attr('cx', xScale(xAccessor(a_row)))
      .attr('cy', yScale(yAccessor(a_row)))
      .raise()
    tooltip
      .style('display', 'block')
      .style('top', yScale(yAccessor(a_row)) - 20 + 'px')
      .style('left', xScale(xAccessor(a_row)) + 'px')
    tooltip.select('.y_value')
      .text(`${yAccessor(a_row)}`)
    tooltip.select('.x_value')
      .text(`${xFormat(xAccessor(a_row))}`)
  })
  .on('mouseleave', function(event){
    tooltipDot.style('opacity',0)
    tooltip.style('display', 'none')
  })
}

export {track_variable}
