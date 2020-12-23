import * as d3 from "d3";
import {
  getYearRange,
  getSymbolDataName,
  getRegionalDataName,
} from "../tools/data-manager";
import ArrowVisualization from "./ArrowVisualization";
// import * as $ from 'jquery';

export default class MapVisualzation {
  constructor() {
    // this.arrowVis = new ArrowVisualization();
    this.usaMap = {};
    this.dataset = [];
    // TODO:store US State names offline
    this.USStates = [];
    d3.json(
      "https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json"
    ).then((data) => {
      this.USStates = data.features;
      // get us states names
      this.USStates.forEach((e) => {
        let name = e.properties.name.toLowerCase();
        if (name.split(" ").length > 1) name = name.split(" ").join("-");
        // console.log(name);
      });
    });
    // data option
    this.symbolDataName = "";
    this.regionalDataName = "";
    this.yearRange = [2000, 2008];
    // datasets
    this.symbolData = [];
    this.regionalData = [];
  }
  mapVisRender() {
    // update data on demand

    // TODO: solve async problem of year range
    // if (getYearRange() !== this.yearRange) {
    //   this.yearRange = getYearRange()
    //   console.log('mapVisRender: Year range', this.yearRange);
    // }

    if (getRegionalDataName() !== this.regionalDataName) {
      this.regionalDataName = getRegionalDataName();
      switch (this.regionalDataName) {
        case "gdp-growth-rate":
          d3.csv(`/datasets/gdp_data.csv`)
            .then((data) => this.preprocessGDPGrowthRate(data))
            .then((data) => {
              this.regionalData = data;
              this._mapVisRegionRender(data);
            });
          break;
        case "gdp-value":
          break;
        default:
          break;
      }
    }

    if (getSymbolDataName() !== this.symbolDataName) {
      this.symbolDataName = getSymbolDataName();
      switch (this.symbolDataName) {
        case "shift-of-votes":
          d3.csv("/datasets/election_data.csv")
            .then((data) => data)
            .then((data) => {
              this.symbolData = data;
              this._mapVisSymbolRender(data);
            });
          break;
        default:
          break;
      }
    }
  }
  _mapVisRegionRender(data) {
    // TODO: confirm overall correctness (hawaii?)
    // draw regional data vis
    // console.log("data for region render: ", data);
    const width = 900;
    const height = 600;
    const mapVis = d3
      .select("#map-visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3
      .geoAlbersUsa()
      .translate([width / 2, height / 2]) // translate to center of screen
      .scale([1000]); // scale things down so see entire US

    const path = d3.geoPath().projection(projection);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(data)))
      .range(["white", "green"]);

    this.usaMap = mapVis
      .selectAll("path")
      // TODO: figure out why use US States data here for path
      .data(this.USStates)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (d) {
        // TODO: name conversion
        let name = d.properties.name.toLowerCase();
        if (name.split(" ").length > 1) name = name.split(" ").join("-");
        // console.log('state: ', name);
        return name;
      })
      .attr("class", "state")
      .attr("fill", function (d) {
        let name = d.properties.name.toLowerCase();
        if (name.split(" ").length > 1) name = name.split(" ").join("-");
        let value = data[name];
        // console.log(name, value, colorScale(value));
        return colorScale(value);
      });
  }
  _mapVisSymbolRender(data) {
    // draw symbol data vis
    console.log("data for symbol render: ", data);
  }
  preprocessGDPGrowthRate(data) {
    function calGrowthRate(stateName, startYear, endYear) {
      let startGDP = 0;
      let endGDP = 0;

      let selectedState = data.filter((obj) => {
        return obj.state === stateName;
      });
      selectedState = selectedState[0];
      if (selectedState == undefined) {
        console.log("calculate growthRate: state not found: ", stateName);
        return 0;
      }

      for (let year in selectedState) {
        if (parseInt(year) === startYear) {
          const value = selectedState[year].replace(/[\(\)']+/g, "");
          startGDP = parseFloat(value.split(",")[0]);
        } else if (parseInt(year) === endYear) {
          const value = selectedState[year].replace(/[\(\)']+/g, "");
          endGDP = parseFloat(value.split(",")[0]);
        }
      }

      return (endGDP - startGDP) / startGDP;
    }

    // console.log("Preprocess GDP Growth Rate\n Raw Data: ", data);
    let stateGDPGrowthRates = {};
    let [startYear, endYear] = this.yearRange;
    this.USStates.forEach((e) => {
      let name = e.properties.name.toLowerCase();
      if (name.split(" ").length > 1) name = name.split(" ").join("-");
      // stateGDPGrowthRates.push({
      //   stateName: name,
      //   regionalData: calGrowthRate(name, startYear, endYear),
      // });
      stateGDPGrowthRates[name] = calGrowthRate(name, startYear, endYear);
    });
    return stateGDPGrowthRates;
  }
}
