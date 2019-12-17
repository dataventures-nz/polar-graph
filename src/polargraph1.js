
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
  arcs:false,
  arcOptions:{},
  labelAccessor: d=>d.label,
  colourScale:d=>null
  }

  options.thetaMax = d3.extent(data,d=>d.theta)[1]
  options.rMax = d3.extent(data,d=>d.r)[1]

  var newOptions = newOptions || {}

  var svg
  var svgSize

  function x(d) {return rScale(d.r)*Math.sin(thetaScale(d.theta))}
  function y(d) {return -1*rScale(d.r)*Math.cos(thetaScale(d.theta))}

  if (newOptions.chart){
    svg = newOptions.chart.svg
    _.assign(options,newOptions.chart.options,newOptions)
    options.thetaMax = options.thetaMax || d3.extent(data,d=>d.theta)[1]
    options.rMax = options.rMax || d3.extent(data,d=>d.r)[1]
    svgSize = options.plotRadius+options.margin
    } else {
      _.assign(options,newOptions)
      svgSize = options.plotRadius+options.margin
      svg = d3.select(target).append("svg").classed("polargraph",true)
      .attr("width",2*svgSize)
      .attr("height",2*svgSize)
    }

  if (options.arcs) {
    var defaults={
        inner:0.95*options.plotRadius,
        outer:options.plotRadius,
        offset:0,
        labels:new Array(4).fill("")
      }
      options.arcOptions = _.assign(defaults,options.arcOptions)
    }

    options.pathId+=1

    if (options.closed){data.push(data[0])}
    var rotAngle = 360/options.axisTitles.length
    var thetaScale = d3.scaleLinear().domain([0,options.thetaMax]).range([0,2*Math.PI])
    var rScale = d3.scaleLinear().domain([0,options.rMax]).range([0,options.plotRadius])

  function drawAxes(axisTitles){
    if (!axisTitles.length) return

    svg.selectAll(".axis").data(axisTitles).enter().append("g").classed("axis",true)
    var axes = svg.selectAll(".axis")
    axes.append('line')
      .attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",options.plotRadius)

    axes.append("text").text(d=>d).attr("transform","translate(-12,"+(0.98*options.plotRadius)+") rotate(90)")
    axes.attr("transform",(d,i)=>"translate("+svgSize+","+svgSize+") rotate("+(180+(i-options.axisOffset)*rotAngle)+")")
  }

  function drawArcs(arcOptions){
    // var makeArc = d3.arc({innerRadius:arcOptions.inner,outerRadius:arcOptions.outer})
    var makeArc = d3.arc().innerRadius(arcOptions.inner).outerRadius(arcOptions.outer)
    var rotAngle = 2*Math.PI/arcOptions.labels.length
    var arcData = arcOptions.labels.map(function(d,i){
      return {
        startAngle:(i-arcOptions.offset)*rotAngle,
        endAngle:(i+1-arcOptions.offset)*rotAngle,
        label:d
      }
    })

    svg.selectAll(".arc").data(arcData).enter().append("g")
      .classed("arc",true)
      .classed("odd",(d,i) => i%2 != 0)
      .classed("even",(d,i) => i%2 == 0)
    var arcs = svg.selectAll(".arc")
      .attr("transform",(d,i)=>"translate("+svgSize+","+svgSize+")")
      .append("path")
      .attr("d",d=>makeArc(d))
  }

  function drawSegments(data){
    var n = data.length
    var d1 = _.clone(data)
    var d2 = _.clone(data)
    d1.pop()
    d2.shift()
    var segments = _.zip(d1,d2)
    console.log(segments)

    var s = svg.append("g").classed("segments",true)
      .attr("transform",(d,i)=>"translate("+svgSize+","+svgSize+")")
    s.selectAll("line").data(segments).enter()
      .append("line")
      .attr("x1",d=>x(d[0]))
      .attr("x2",d=>x(d[1]))
      .attr("y1",d=>y(d[0]))
      .attr("y2",d=>y(d[1]))
      .style("stroke",options.colourScale)
      // .style("stroke",'white')
      .style("stroke-width",1.5)
      .style("opacity",0)
      .transition()
        .duration(2000)
        .delay((d,i) => i)
        .style("opacity",1)
        .transition()
          .duration(500)
          .delay(100)
          .style("opacity",0.4)
          .style("stroke-width",1)

  }

  drawSegments(data)

  function drawPoints(data,labelAccessor){
    svg.selectAll("g.tooltip._"+options.pathId).data(data,d=>labelAccessor(d)+options.pathId).enter()
    .append("g").classed("tooltip",true).classed("_"+options.pathId,true)
    .attr("transform",d=>"translate("+(x(d)+svgSize)+","+(y(d)+svgSize)+")")
    var points = svg.selectAll("g.tooltip._"+options.pathId)
    points.append("circle").on("mousedown",function(){
      d3.select(this.parentNode).classed("clicked",function(d){
        d.clicked = !d.clicked
        return d.clicked
      })
    })
    points.append("text").text(labelAccessor)
  }

  function addGradient(){
    svg.append("radialGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("id", "gradient")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r",options.plotRadius)
    .selectAll("stop")
      .data(options.gradientStops)
    .join("stop")
      .attr("offset", d => d.stop)
      .attr("stop-color", d => d.color);
  }

  // if (options.gradient){addGradient()}
  //
  // if (options.arcs) {drawArcs(options.arcOptions)}
  //
  // if (options.axisOnTop) {
  // var line = drawPath(data,svgSize,options.colour)
  //   drawAxes(options.axisTitles)
  // }
  // else {
  //   drawAxes(options.axisTitles);
  // var line = drawPath(data,svgSize,options.colour)
  // }
  //
  // if (options.label){drawPoints(data,options.labelAccessor,options.pathId)}
  //
  return {svg,options}
}

export function updatePolarGraph(chart,data){
 console.log(chart,data)
 var options =chart.options
 var svgSize = options.plotRadius+options.margin
 var line = chart.line

 var path = chart.svg.select("path.polargraph").datum(data)
     .attr("d",line)


 function drawPoints(data,labelAccessor){
   var points = chart.svg.selectAll("g.tooltip._"+chart.options.pathId).data(data,d=>labelAccessor(d)+chart.options.pathId)
   points.exit().remove()
   var e = points.enter()
   .append("g").classed("tooltip",true).classed("_"+options.pathId,true)
   .attr("transform",d=>"translate("+(chart.x(d)+svgSize)+","+(chart.y(d)+svgSize)+")")

   e.append("circle").on("mousedown",function(){
     d3.select(this.parentNode).classed("clicked",function(d){
       d.clicked = !d.clicked
       return d.clicked
     })
   })
   e.append("text").text(labelAccessor)
   }

  if (chart.options.label){drawPoints(data,chart.options.labelAccessor)}


}
