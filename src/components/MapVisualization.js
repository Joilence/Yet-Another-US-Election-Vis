import * as d3 from "d3";
import { getOverallVotesShift, getGdpRate } from "../tools/data-manager";
import ArrowVisualization from "./ArrowVisualization";
import { UsMapGeoJson } from "./UsMapGeoJson";

// import * as $ from 'jquery';

export default class MapVisualzation {
  constructor(datasets) {
    this.arrowVis = new ArrowVisualization();
    this.datasets = datasets;
    this.usaMap = {};
    this.dataset = [];
    this.USStateNames = ["alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut"
                      , "delaware", "district-of-columbia", "florida", "georgia", "idaho", "illinois", "indiana"
                      , "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan"
                      , "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new-hampshire"
                      , "new-jersey", "new-mexico", "new-york", "north-carolina", "north-dakota", "ohio", "oklahoma"
                      , "oregon", "pennsylvania", "rhode-island", "south-carolina", "south-dakota", "tennessee"
                      , "texas", "utah", "vermont", "virginia", "washington", "west-virginia", "wisconsin", "wyoming", "hawaii"]; //puerto-rico

    this.USStatesCoordinate = UsMapGeoJson.features;
    this.USStatesCoordinate_Dict = {}; // {"name":[coordinates]}

    this.USStatesCoordinate.forEach((row) => {
      this.USStatesCoordinate_Dict[row.properties.name] = row.geometry.coordinates
    });

    this.symbolDataName = "";
    this.regionalDataName = "";
    this.yearRange = [];
    this.selectedStates = [];

    this.colorRange = ["white", "green"];
    
    this.map_width = 900;
    this.map_height = 600;
    this.mapVis = d3.select("#map-visualization")
                    .append("svg")
                    .attr("width", this.map_width)
                    .attr("height", this.map_height);
    this.arrowVis.svg = this.mapVis
  }


  mapVisRender(symbolDataName, regionalDataName, yearRange, selectedStates) {
    // update data on demand
    console.log(symbolDataName, yearRange)
    if (regionalDataName !== this.regionalDataName || yearRange !== this.yearRange) {
      // console.log("-- map randers gdp rate --")
      switch (regionalDataName) {
        case "gdp-growth-rate":
          let [regionalData, regionalDataYears] = getGdpRate(this.datasets["gdp_data"], yearRange);
          this._mapVisRegionRender(regionalData);
          break;
        case "gdp-value":
          break;
        default:
          break;
      }
    }
 
    if (symbolDataName !== this.symbolDataName || yearRange !== this.yearRange) {
      // console.log("-- map randers election arrows --")
      switch (symbolDataName) {
        case "shift-of-votes":
          this._mapVisSymbolRender(this.datasets["election_data"], yearRange)
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
    const projection = d3
      .geoAlbersUsa()
      .translate([this.map_width / 2, this.map_height / 2]) // translate to center of screen
      .scale([1000]); // scale things down so see entire US

    const path = d3.geoPath().projection(projection);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(data)))
      .range(this.colorRange);

    this.usaMap = this.mapVis
      .selectAll("path")
      // TODO: figure out why use US States data here for path
      .data(this.USStatesCoordinate)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (d) {
        let name = d.properties.name;
        return name;
      })
      .attr("class", "state")
      .attr("fill", function (d) {
        let value = data[d.properties.name];
        return colorScale(value);
      });
  }

  _mapVisSymbolRender(data, yearRange) {
    this.arrowVis.init_arrowVis();
    // draw symbol data vis
    let [states_overall_shift, states_all_years] = getOverallVotesShift(data, yearRange);
    // // console.log("data for symbol render: ", states_overall_shift);

    for (let state in states_overall_shift) {
      // console.log(state, states_overall_shift[state]["direction"], states_overall_shift[state]["shift"], this.USStatesCoordinate_Dict[state])
      // TODO:
      this.arrowVis.create_arrow(states_overall_shift[state]["direction"], 300, 400, 20*states_overall_shift[state]["shift"]);
    }
  }

}
