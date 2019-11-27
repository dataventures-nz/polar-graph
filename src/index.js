import "./styles.scss";
import 'regenerator-runtime/runtime'
import * as d3 from "d3";
import moment from 'moment';
import _ from 'lodash';



function polarToCartesian(r,theta){
  var x = r*Math.cos(theta)
  var y = r*Math.sin(theta)
  return {x:x,y:y}
}

function makePolarGraph(target,data,newOptions){
console.log (data)

var options ={
  margin:20,
  plotRadius : 200,
  closed : false,
  axisTitles: new Array(4).fill(""),
  axisOffset: 0,
  }

  options.thetaMax = d3.extent(data,d=>d.theta)[1]
  options.rMax = d3.extent(data,d=>d.r)[1]

  var newOptions = newOptions || {}

  // _.assign(options,newOptions)
  var svg
  var svgSize

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
    var path = svg.append("path").datum(data)
    .attr("d",line)
    .attr("transform","translate("+svgSize+","+svgSize+")")

    if (options.colour){
      console.log(path)
      path.style("stroke",options.colour).style("fill",options.colour)
    }
  }

  if (options.axisOnTop) {drawPath(data,svgSize,options.colour);drawAxes(options.axisTitles)}
  else {drawAxes(options.axisTitles);drawPath(data,svgSize,options.colour)}

  return {svg,options}

}

function reformatDataPoint(d){
  var date = moment(d.date, "YYYY-MM-DD")
  var hourOfWeek = date.day()+(+d.hour/24)
  return {theta:hourOfWeek,r:+d.normalised_count}
}

function reformatDataPoint2(d){
  var date = moment(d.Date)
  var hourOfWeek = date.day()+(date.hour()/24)
  return {theta:hourOfWeek,r:+d.normalised_count}
}


var weekdays =  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
var chart

async function paintme() {
  var async1 = d3.csv("250600_normalised.csv")
  var async2 = d3.csv("250700_normalised.csv")
  var async3 = d3.csv("321200_normalised.csv")
  var async4 = d3.csv("257900_normalised.csv")
  var async5 = d3.csv("168200_normalised.csv")
  var karori = await async1
  var train = await async2
  var uni = await async3
  var martinborough = await async4
  var pauanui = await async5
  karori = karori.map(reformatDataPoint)
  train = train.map(reformatDataPoint)
  uni = uni.map(reformatDataPoint)
  martinborough  = martinborough.map(reformatDataPoint)
  pauanui = pauanui.map(reformatDataPoint)
  makePolarGraph('#app',karori,{thetaMax:7,axisTitles:weekdays,plotRadius:200,margin:20,axisOffset:0.5,axisOnTop:true})
  makePolarGraph('#app',train,{thetaMax:7,axisTitles:weekdays,plotRadius:200,margin:20,axisOffset:0.5})
  makePolarGraph('#app',uni,{thetaMax:7,axisTitles:[],plotRadius:200,margin:20,axisOffset:0.5})
  chart = makePolarGraph('#app',pauanui,{thetaMax:7,axisTitles:[],plotRadius:200,margin:20, axisOffset:0.5,colour:"green"})
  makePolarGraph('#app',martinborough,{thetaMax:7,axisTitles:[],plotRadius:200,margin:20, axisOffset:0.5,colour:null,chart:chart})
  console.log(chart)
  }
// paintme()

async function overlayme() {
  var async4 = d3.csv("257900_normalised.csv")
  var async5 = d3.csv("168200_normalised.csv")

  var martinborough = await async4
  var pauanui = await async5

  martinborough  = martinborough.map(reformatDataPoint)
  pauanui = pauanui.map(reformatDataPoint)

  chart = makePolarGraph('#app',pauanui,{thetaMax:7,axisTitles:[],plotRadius:200,margin:20, axisOffset:0.75,colour:"green"})
  var chart2 = makePolarGraph('#app',martinborough,{colour:"red",chart:chart})

  console.log(chart, chart2)
  }
// overlayme()

// console.log(moment)
// d3.csv("250600v2_sw.csv")
//   .then(d=>d.slice(0,169))
//   .then(d=>{console.log(d);return d})
//   .then(x=>x.map(reformatDataPoint2))
//   .then(d=>{makePolarGraph('#app',d,{thetaMax:7,axisTitles:[],plotRadius:300,margin:40})})
//
// console.log(chart)

async function overlayme2() {
  var async4 = d3.csv("250600v2_sw.csv")
  var async5 = d3.csv("250700v2_sw.csv")

  var karori = await async4
  var pipitea = await async5

  karori  = karori.map(reformatDataPoint2).slice(0,169)
  pipitea = pipitea.map(reformatDataPoint2).slice(0,169)

  chart = makePolarGraph('#app',pipitea,{thetaMax:7,plotRadius:200,margin:20,colour:"green"})
  var chart2 = makePolarGraph('#app',karori,{colour:null,chart:chart,rMax:null,axisOnTop:true,axisTitles:weekdays,axisOffset:0.5})

  console.log(chart, chart2)
  }

  // overlayme2()

  function reformatDataPoint3(d){
    var date = moment(d.timestamp, "YYYY-MM-DD")
    return {segment:d.segment,theta:date.month(),r:+d.population}
  }





// d3.csv("prelimMonthlySegmentsForMbie20191029.csv")
//   .then(d=>_.filter(d, x=>x.rto=="Auckland"))
//   .then(d=>d.map(reformatDataPoint3))
//   .then(d=>{console.log(d);return d})
//   .then(d=>{
//     var m = _.max(d.map(x=>x.r))
//     console.log(m)
//     chart = makePolarGraph('#app',_.filter(d, x=>x.segment=="Local"),{thetaMax:12,plotRadius:300,margin:40,axisOnTop:true,axisTitles:["Jan","Apr","Jul","Sep"],rMax:m})
//     makePolarGraph('#app',_.filter(d, x=>x.segment=="Domestic"),{chart:chart,colour:"green"})
//     makePolarGraph('#app',_.filter(d, x=>x.segment=="International"),{chart:chart,colour:"yellow"})
//
//   })


  // .then(d=>_.filter(d, x=>x.segment=="Local"))

async function card(sa,name){

  var csv = d3.csv("data/"+sa+"v2_sw.csv")
  var data = await csv

  data = data.map(reformatDataPoint2)
  // chart = makePolarGraph('#app',data,{thetaMax:7,plotRadius:100,margin:10,axisTitles:weekdays,axisOnTop:true,axisOffset:-0.5})
  chart = makePolarGraph('#app',data,{thetaMax:7,plotRadius:150,margin:10,axisTitles:[]})
  chart.svg.append("text").text(name)
  .attr("text-anchor","middle")
  .attr("transform","translate(150,20)")

}


function christmasCards(list){
var sa
    for (sa in list) {
      console.log(list[sa])

      if(list[sa].SA2){card(list[sa].SA2,list[sa].Name)}
    }
}

d3.csv("XmasSaList.csv").then(christmasCards)
