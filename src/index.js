import "./styles.scss";
import 'regenerator-runtime/runtime';
import moment from 'moment';
import _ from 'lodash';
import * as d3 from "d3";
import { makePolarGraph } from './polargraph1.js';


function reformatDataPoint(d){
    // console.log(d)
  var date = moment.parseZone(d.date)
  var hourOfWeek = date.day()+(date.hour()/24)
  return {
    theta:hourOfWeek,
    r:+d.normalised_count,
    date:date.toDate(),
    label:date.format("YYYY-MM-DD h A"
  )}
}

var weekdays =  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday, mid-day"]
var chart


async function card(sa,name){

  var csv = d3.csv("data/"+sa+"v2_sw.csv")
  var data = await csv
  data = data.map(reformatDataPoint)

  console.log(d3.extent(data,d=>d.date))

var dom = [new Date(2018),new Date(2018,4),new Date(2018,7),new Date(2019), new Date(2019,4)]

  // var colourscale = d3.scaleTime().domain(dom).range(["#B2182B","#F7F7F7", "#2166AC"])
  var colourscale = d3.scaleTime().domain(dom).range(["yellow","orange","blue","green","yellow"])

var thing = data.map(d=>colourscale(d.date))
console.log(thing)

  chart = makePolarGraph('#app',data,{
    label:true,
    thetaMax:7,
    plotRadius:400,
    margin:50,
    axisTitles:new Array(7).fill(""),axisOnTop:true,
    colourScale:d=>colourscale(d[0].date)
  })
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
