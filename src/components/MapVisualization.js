import * as d3 from "d3";
import { getOverallVotesShift, getGdpRate, getGdpValue } from "../tools/data-manager";
import ArrowVisualization from "./ArrowVisualization";
import { UsMapGeoJson } from "./UsMapGeoJson";



// import * as $ from 'jquery';

export default class MapVisualzation {
  constructor(datasets) {
    this.datasets = datasets;

    // Data Option
    this.symbolDataName = "";
    this.regionalDataName = "";
    this.yearRange = [];
    this.selectedStates = [];

    // SVG Components
    this.map_width = 900;
    this.map_height = 600;
    this.mapVis = d3
      .select("#map-visualization")
      .append("svg")
      .attr("width", this.map_width)
      .attr("height", this.map_height);

    const projection = d3
      .geoAlbersUsa()
      .translate([this.map_width / 2, this.map_height / 2]) // translate to center of screen
      .scale([1000]); // scale things down so see entire US

    this.pathGenerator = d3.geoPath().projection(projection);

    // US States Data
    this.USStatesData = {};
    this.USStatesData.statesName = Array.from(
      UsMapGeoJson.features,
      (d) => d.properties.name
    );
    this.USStatesData.coordinates = UsMapGeoJson.features;
    this.USStatesData.centroids = {};
    this.USStatesData.coordinates.forEach((d) => {
      this.USStatesData.centroids[d.properties.name] = {
        x: this.pathGenerator.centroid(d)[0],
        y: this.pathGenerator.centroid(d)[1],
      };
    });

    this._initMap();

    // Arrow
    this.arrowVis = new ArrowVisualization();
    this.arrowVis.svg = this.mapVis;
    this.arrowVis.init_arrowVis();
  }

  _initMap() {
    const self = this;
    let current_obj = null;             
                    
    this.mapVis
      // add path
      .selectAll("path")
      .data(this.USStatesData.coordinates)
      .enter()
      .append("path")
      .attr("d", this.pathGenerator)
      .attr("id", function (d) {
        return d.properties.name;
      })
      .attr("class", "state")
      .attr("fill", "#F0F0F0")
      // .attr("fill-opacity", 0.7)
      .attr("data-selected", "false")

      // Hover Effect
      .on("mouseover", function (event, d) {
        // highlight current state
        d3.select(this).attr('stroke-width', 2)
                      .attr('stroke', '#000')
                      .attr('stroke-opacity', 1);

        // d3.select(this).style("fill", "url(#circles-1)")

        // display tooltips
        d3.select("#tooltip").transition().duration(200).style("opacity", .9);

        // get data from dom
        const data = {};
        data[self.symbolDataName] = document.getElementById(this.id).getAttribute('data-' + self.symbolDataName);
        data[self.regionalDataName] = document.getElementById(this.id).getAttribute('data-' + self.regionalDataName);

        // render tooltips
        d3.select("#tooltip").html(self._createToolTipHtml(self._reformatStateName(this.id), data)) // this is current state dom
          .style("left", (d3.event.pageX ) + "px")
          .style("top", (d3.event.pageY) + "px"); 
      })
      .on("mouseout", function (event, d) {
        d3.select("#tooltip").transition().duration(200).style("opacity", 0);  

        d3.select(this).attr('stroke-opacity', 0);
      
      })
      .on("click", function() {
        if (d3.select(this).attr("data-selected") == "false") {

          //TODO:
          self.selectedStates.push(this.id);
          console.log(this.id)

        } else if (d3.select(this).attr("data-selected") == "true"){
          //TODO: 
          self.selectedStates = self.selectedStates.filter(ele => ele !== this.id);
        }

        //TODO: transfer selectedStates to AuxVis
      });

      // add text to each state
      // this.mapVis.selectAll("text")
      // .data(this.USStatesData.coordinates)
      // .enter()
      // .append("svg:text")
      // .text((d)=>
      //         d.properties.name_abbr
      // )
      // .attr("x", (d)=>
      //     this.USStatesData.centroids[d.properties.name]["x"]
      // )
      // .attr("y", (d)=>
      //     this.USStatesData.centroids[d.properties.name]["y"]+10
      // )
      // .attr("text-anchor","middle")
      // .attr('font-size','8pt')

  }

   _createToolTipHtml(state, data) {	/* function to create html content string in tooltip div. */
    let html = "<h4>"+state+"</h4><table>";
    Object.keys(data).forEach(key=> {
      html += "<tr><td>" + key + ":</td><td>"+data[key]+"</td></tr>"
    })
		return html;
  }

  _reformatStateName(state) {
    // make the first word uppercase
    let state_name = "";
    state.split("-").forEach(str=>{
      state_name += str.charAt(0).toUpperCase() + str.slice(1) + " "
    })
    return state_name
  }
  
  mapVisRender(symbolDataName, regionalDataName, yearRange, selectedStates) {
    // update data on demand
    if (
      regionalDataName !== this.regionalDataName ||
      yearRange !== this.yearRange
    ) {
      // console.log("-- map randers gdp rate --")
      let regionalData = {}, regionalDataYears = [];
      switch (regionalDataName) {
        case "gdp-growth-rate":
          [regionalData, regionalDataYears] = getGdpRate(
            this.datasets["gdp_data"],
            yearRange
          );
          
          break;
        case "gdp-value":
          [regionalData, regionalDataYears] = getGdpValue(
            this.datasets["gdp_data"],
            yearRange
          );
          break;
        default:
          break;
      }
      this._mapVisRegionRender(regionalData, regionalDataName);
    }

    if (
      symbolDataName !== this.symbolDataName ||
      yearRange !== this.yearRange
    ) {
      // console.log("-- map randers election arrows --")
      switch (symbolDataName) {
        case "shift-of-vote":
          this._mapVisSymbolRender(this.datasets["election_data"], yearRange, symbolDataName);
          break;

        default:
          break;
      }
    }

    this.regionalDataName = regionalDataName;
    this.symbolDataName = symbolDataName;
    this.yearRange = yearRange;
  }

  _mapVisRegionRender(data, regionalDataName) {

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(data)))
      .range(["#F0F0F0", "green"]);

    // TODO: Maybe try render from iterating elements
    // console.log('keys', Object.keys(data));
    Object.keys(data).forEach(state => {
      let t = d3.transition(d3.easePolyInOut).duration(500)
      // console.log('colorScale(data[state])', colorScale(data[state]));
      d3.select(`#${state}`)
        .transition(t)
        .attr('fill', colorScale(data[state]))
        .attr('data-'+ regionalDataName, data[state]);
    })
  }

  _mapVisSymbolRender(data, yearRange, symbolDataName) {
    this._removeElementsByClass("arrow"); // remove current arrows
    // draw symbol data vis
    let [states_overall_shift, states_all_years] = getOverallVotesShift(data, yearRange);
    for (let state in states_overall_shift) {
      this.arrowVis.create_arrow(
                                  states_overall_shift[state]["direction"]
                                  , this.USStatesData.centroids[state]["x"]
                                  , this.USStatesData.centroids[state]["y"]
                                  , 10*states_overall_shift[state]["shift"]
      );
      
      document.getElementById(state).setAttribute('data-'+ symbolDataName, [states_overall_shift[state]["direction"], states_overall_shift[state]["shift"]]);

    }
  }

  _removeElementsByClass(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
  }
  // TODO: Legend (arrows, color scale)
  // TODO: button, select top 10, 
}
