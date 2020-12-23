import * as d3 from "d3";
import {
  getYearRange,
  getSymbolDataName,
  getRegionalDataName,
  getOverallShift, 
} from "../tools/data-manager";
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
                      , "texas", "utah", "vermont", "virginia", "washington", "west-virginia", "wisconsin", "wyoming"] // hawaii, puerto-rico

    this.USStatesCoordinate = UsMapGeoJson.features;
    this.USStatesCoordinate_Dict = {}; // {"name":[coordinates]}

    this.USStatesCoordinate.forEach((row) => {
      this.USStatesCoordinate_Dict[row.properties.name] = row.geometry.coordinates
    });

    // data option
    this.symbolDataName = "shift-of-votes";
    this.regionalDataName = "";
    this.yearRange = [2000, 2008];
    // datasets
    this.symbolData = [];
    this.regionalData = [];

    this.colorRange = ["white", "green"];
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
          this.regionalData = this.preprocessGDPGrowthRate(this.datasets["gdp_data"]);
          this._mapVisRegionRender(this.regionalData);
          break;
        case "gdp-value":
          break;
        default:
          break;
      }
    }

    if (getSymbolDataName() !== this.symbolDataName) {
      // this.symbolDataName = getSymbolDataName();
      switch (this.symbolDataName) {
        case "shift-of-votes":
          this._mapVisSymbolRender(this.datasets["election_data"])
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
    
    this.arrowVis.init_arrowVis(mapVis);

    const projection = d3
      .geoAlbersUsa()
      .translate([width / 2, height / 2]) // translate to center of screen
      .scale([1000]); // scale things down so see entire US

    const path = d3.geoPath().projection(projection);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(data)))
      .range(this.colorRange);

    this.usaMap = mapVis
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
        let name = d.properties.name;
        let value = data[name];
        // console.log(name, value, colorScale(value));
        return colorScale(value);
      });
  }

  _mapVisSymbolRender(data) {
    // draw symbol data vis
    let states_overall_shift = getOverallShift(data, this.yearRange);
    // console.log("data for symbol render: ", states_overall_shift);

    for (let state in states_overall_shift) {
      console.log(state, states_overall_shift[state]["direction"], states_overall_shift[state]["shift"], this.USStatesCoordinate_Dict[state])
      this.arrowVis.create_arrow(states_overall_shift[state]["direction"], 500, 600, states_overall_shift[state]["shift"]);
    }
  }

  preprocessGDPGrowthRate(data) {
    // console.log("Preprocess GDP Growth Rate\n Raw Data: ", data);
    let stateGDPGrowthRates = {};
    let [startYear, endYear] = this.yearRange;
    
    this.USStateNames.forEach((name) => {
      stateGDPGrowthRates[name] = calGrowthRate(name, startYear, endYear);
    });

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

    return stateGDPGrowthRates;
  }
}
