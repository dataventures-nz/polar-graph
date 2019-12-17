import "./styles.scss";
import 'regenerator-runtime/runtime';
import moment from 'moment';
import _ from 'lodash';
import * as d3 from "d3";
import { makePolarGraph } from './polargraph0.js';

function polarToCartesian(r,theta){
  var x = r*Math.cos(theta)
  var y = r*Math.sin(theta)
  return {x:x,y:y}
}

function reformatDataPoint(d){
  var date = moment(d.date)
  var hourOfWeek = date.day()+(+d.hour/24)
  return {theta:hourOfWeek,r:+d.normalised_count}
}

function reformatDataPoint2(d){
    // console.log(d)
  var date = moment.parseZone(d.date)
  var hourOfWeek = date.day()+(date.hour()/24)
  return {theta:hourOfWeek,r:+d.normalised_count,label:date.format("YYYY-MM-DD h A")}
}


var weekdays =  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday, mid-day"]
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
  var chart2 = makePolarGraph('#app',karori,{colour:null,chart:chart,rMax:null,axisOnTop:true,axisTitles:weekdays})

  console.log(chart, chart2)
  }

  // overlayme2()

  function reformatDataPoint3(d){
    var date = moment(d.timestamp, "YYYY-MM-DD")
    return {segment:d.segment,theta:date.month(),r:+d.population}
  }




//
// d3.csv("prelimMonthlySegmentsForMbie20191029.csv")
//   .then(d=>_.filter(d, x=>x.rto=="Queenstown"))
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
console.log(data[0])
  data = data.map(reformatDataPoint2)
  // chart = makePolarGraph('#app',data,{thetaMax:7,plotRadius:100,margin:10,axisTitles:weekdays,axisOnTop:true,axisOffset:-0.5})
  chart = makePolarGraph('#app',data,{label:true,thetaMax:7,plotRadius:300,margin:10,axisTitles:new Array(7).fill(""),axisOnTop:true})
  chart.svg.append("text").text(name)
  .attr("text-anchor","start")
  .attr("transform","translate(20,20)")

}

// console.log(card)

function christmasCards(list){
var sa
    for (sa in list) {
      console.log(list[sa])

      if(list[sa].SA2){card(list[sa].SA2,list[sa].Name)}
    }
}

// d3.csv("XmasSaList.csv").then(christmasCards)

// card(243500,"Normandale 243500 (Holly's Place)")
// card(252600,"Roseneath (Sarah's Place)")
// card(253700,"Kilbirnie Central (Blair's Place)")
// card(253600,"Newtown South (Taylor's Place)")
// card(252900,"Newtown North (Taylor's Other Place)")
// card(243600,"Belmont (Drew's Place)")
// card(244700,"Petone")
// card(147400,"Sylvia Park")
card(136400,"Parnell West")
