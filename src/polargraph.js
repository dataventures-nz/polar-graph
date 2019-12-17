
import moment from 'moment';
import _ from 'lodash';
import * as d3 from "d3";

export function makePolarGraph(target,data,newOptions){
console.log (data[0])

var options ={
  margin:20,
  plotRadius : 200,
  closed : false,
  axisTitles: new Array(4).fill(""),
  axisOffset: 0,
  showPoints:true,
  label:false,
  labelAccessor: d=>d.label
  }

  options.thetaMax = d3.extent(data,d=>d.theta)[1]
  options.rMax = d3.extent(data,d=>d.r)[1]

  var newOptions = newOptions || {}

  // _.assign(options,newOptions)
  var svg
  var svgSize

  function x(d) {return rScale(d.r)*Math.sin(thetaScale(d.theta))}
  function y(d) {return -1*rScale(d.r)*Math.cos(thetaScale(d.theta))}

  if (newOptions.chart){
    console.log(newOptions)
    svg = newOptions.chart.svg
    _.assign(options,newOptions.chart.options,newOptions)
    options.thetaMax = options.thetaMax || d3.extent(data,d=>d.theta)[1]
    options.rMax = options.rMax || d3.extent(data,d=>d.r)[1]
    svgSize = options.plotRadius+options.margin
    } else {
      console.log(newOptions)
      _.assign(options,newOptions)
      svgSize = options.plotRadius+options.margin
      svg = d3.select(target).append("svg")
      .attr("width",2*svgSize)
      .attr("height",2*svgSize)
    }


    if (options.closed){data.push(data[0])}
    var rotAngle = 360/options.axisTitles.length
    var thetaScale = d3.scaleLinear().domain([0,options.thetaMax]).range([0,2*Math.PI])
    var rScale = d3.scaleLinear().domain([0,options.rMax]).range([0,options.plotRadius])

  function drawAxes(axisTitles){

    svg.selectAll(".axis").data(axisTitles).enter().append("g").classed("axis",true)
    var axes = svg.selectAll(".axis")
    axes.append('line')
      .attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",options.plotRadius)

    axes.append("text").text(d=>d).attr("transform","translate(-12,"+(0.98*options.plotRadius)+") rotate(90)")
    axes.attr("transform",(d,i)=>"translate("+svgSize+","+svgSize+") rotate("+(180+(i-options.axisOffset)*rotAngle)+")")
  }

  function drawPath(data,svgSize,colour){
    var line = d3.lineRadial().angle(d=>thetaScale(d.theta)).radius(d=>rScale(d.r))
    var g = svg.append("g").attr("transform","translate("+svgSize+","+svgSize+")")
    g.append("circle").attr("r",0.8*svgSize)
    var path = g.append("path").datum(data)
    .attr("d",line)


    if (options.colour){
      path.style("stroke",options.colour).style("fill",options.colour)
    }
  }

  function drawPoints(data,labelAccessor){

    svg.selectAll("g.tooltip").data(data).enter()
    .append("g").classed("tooltip",true)
    .attr("transform",d=>"translate("+(x(d)+svgSize)+","+(y(d)+svgSize)+")")
    var points = svg.selectAll("g.tooltip")
    points.append("circle").on("mousedown",function(){
      d3.select(this.parentNode).classed("clicked",function(d){
        d.clicked = !d.clicked
        return d.clicked
      })
    })
    points.append("text").text(labelAccessor)
  }

  if (options.axisOnTop) {
    drawPath(data,svgSize,options.colour)
    drawAxes(options.axisTitles)
  }
  else {
    drawAxes(options.axisTitles);
    drawPath(data,svgSize,options.colour)

  }

if (options.label){drawPoints(data,options.labelAccessor)}

  return {svg,options}
}
