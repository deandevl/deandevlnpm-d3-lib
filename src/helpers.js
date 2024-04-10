
/**
 * Sets the width and height for use with an svg element.
 * Also defines its margins of top, bottom, left, right.
 * 
 * @param {number} [width = 900] The svg width.
 * @param {number} [height = 700] The svg height.
 * @param {number} [top = 50] The svg top margin.
 * @param {number} [bottom = 50] The svg bottom margin.
 * @param {number} [left = 60] The svg left margin.
 * @param {number} [right = 30] The svg right margin.
 */
const Dimensions = function( 
  width,
  height,
  top,
  bottom,
  left,
  right
){
  
  if(typeof width !== 'undefined'){
    this.width = width;
  }else {
    this.width = 900;
  }
  if(typeof height !== 'undefined'){
    this.height = height;
  }else {
    this.height = 700;
  }
  if(typeof top !== 'undefined'){
    this.top = top;
  }else {
    this.top = 50;
  }
  if(typeof bottom !== 'undefined'){
    this.bottom = bottom;
  }else {
    this.bottom = 50;
  }
  if(typeof left !== 'undefined'){
    this.left = left;
  }else{
    this.left = 60;
  }
  if(typeof right !== 'undefined'){
    this.right = right;
  }else {
    this.right = 30;
  }
}

export{Dimensions};