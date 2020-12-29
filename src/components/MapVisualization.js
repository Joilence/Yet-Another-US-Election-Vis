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
    let coordinates = this.USStatesData.coordinates;
    this.mapVis
      .selectAll("path")
      .data(coordinates)
      .enter()
      .append("path")
      .attr("d", this.pathGenerator)
      .attr("id", function (d) {
        let name = d.properties.name;
        return name;
      })
      .attr("class", "state")
      .attr("fill", "#F0F0F0")
      // TODO: [not important] why stroke line not constant
      // .attr('stroke-width', 1)
      // .attr('stroke', '#000')
      .attr("fill-opacity", 0.7)
      // Hover Effect
      .on("mouseover", function (d, i) {
        // console.log('mouserover');
        // var currentState = this;
        d3.select(this).attr("fill-opacity", 1);
      })
      .on("mouseout", function (d, i) {
        // console.log('out');
        d3.selectAll(".state").attr("fill-opacity", 0.7);
      });
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
      this._mapVisRegionRender(regionalData);
    }

    if (
      symbolDataName !== this.symbolDataName ||
      yearRange !== this.yearRange
    ) {
      // console.log("-- map randers election arrows --")
      switch (symbolDataName) {
        case "shift-of-vote":
          this._mapVisSymbolRender(this.datasets["election_data"], yearRange);
          break;

        default:
          break;
      }
    }

    this.regionalDataName = regionalDataName;
    this.symbolDataName = symbolDataName;
    this.yearRange = yearRange;
  }

  _mapVisRegionRender(data) {

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
        .attr('fill', colorScale(data[state]));
    })
  }

  _mapVisSymbolRender(data, yearRange) {
    let centroids = this.USStatesData.centroids;

    // // draw symbol data vis
    let [states_overall_shift, states_all_years] = getOverallVotesShift(data, yearRange);
    for (let state in states_overall_shift) {
      this.arrowVis.create_arrow(states_overall_shift[state]["direction"], centroids[state]["x"], centroids[state]["y"], 10*states_overall_shift[state]["shift"]);
    }

  }

  // TODO: update arrow
  // TODO: Legend (arrows, color scale)
  // TODO: tooltips (state name, overallShift, Overall(GDP rate/value))
  // TODO: select states (bold, boundary)
  // TODO: button, select top 10, 
}
