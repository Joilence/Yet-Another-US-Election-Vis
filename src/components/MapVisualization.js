import * as d3 from "d3";
import * as $ from "jquery";
import {
  getOverallVotesShift,
  getGdpRate,
  getGdpValue,
} from "../tools/data-manager";
import ArrowVisualization from "./ArrowVisualization";
import { UsMapGeoJson } from "./UsMapGeoJson";

export default class MapVisualzation {
  constructor(datasets) {
    this.datasets = datasets;

    // Data Option
    this.symbolDataName = "";
    this.regionalDataName = "";
    this.yearRange = [];
    this.selectedStates = ["alabama", "alaska", "new-york"];

    // SVG Components
    this.map_width = 900;
    this.map_height = 600;
    this.colorScale = undefined;
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

    this.mapVis.append("defs").attr("id", "patterns");

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
      .attr("stroke-width", 2)
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0)

      // Hover Effect
      .on("mouseover", function (event, d) {
        // highlight current state
        d3.select(this).attr("stroke-opacity", 1);

        // d3.select(this).style("fill", "url(#circles-1)")

        // display tooltips
        d3.select("#map-tooltip").transition().duration(200).style("opacity", 0.9);

        // get data from dom
        const data = {};
        let this_dom = document.getElementById(this.id);
        data[self.symbolDataName] = this_dom.getAttribute(
          "data-" + self.symbolDataName
        );

        let unit_name = "";
        if (self.regionalDataName=="gdp-growth-rate") {
          unit_name = " %";
        } else if (self.regionalDataName=="gdp-value") {
          unit_name = " billion USD";
        }

        data[self.regionalDataName] = parseFloat(this_dom.getAttribute(
          "data-" + self.regionalDataName
        )).toFixed(2) + unit_name;
        
        data["start-year"] = this_dom.getAttribute("data-start-year");
        data["end-year"] = this_dom.getAttribute("data-end-year");
        data["avg-total-vote-years"] = this_dom.getAttribute("data-avg-vote-amount");

        // render tooltips
        d3.select("#map-tooltip")
          .html(self._createToolTipHtml(self._reformatStateName(this.id), data)) // this is current state dom
          .style("left", d3.event.pageX + "px")
          .style("top", (d3.event.pageY-200) + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select("#map-tooltip").transition().duration(200).style("opacity", 0);

        d3.select(this).attr("stroke-opacity", 0);
      })
      .on("click", function () {
        // console.log('click on:', this.id);
        // console.log(this);
        if (d3.select(this).attr("data-selected") == "false") {
          self.selectState(this.id);
        } else if (d3.select(this).attr("data-selected") == "true") {
          self.deselectState(this.id);
        }
        // console.log(self.selectedStates)
        $("#map-visualization").prop("states", self.selectedStates);
        $("#map-visualization").trigger("change");
      });
  }

  selectState(stateName) {
    d3.select(`#${stateName}-pattern`).remove();
    const r = 4;
    // console.log(`Select ${stateName}`);
    this.mapVis
      .select("#patterns")
      .append("pattern")
      .attr("id", `${stateName}-pattern`)
      .attr("class", "state-pattern")
      .attr("x", r)
      .attr("y", r)
      .attr("width", r * 2)
      .attr("height", r * 2)
      .attr("patternUnits", "userSpaceOnUse")
      .append("circle")
      .attr("cx", r)
      .attr("cy", r)
      .attr("r", r)
      .style("stroke", "none")
      .style("fill", this.colorScale(self.regionalData[stateName]));

    this.mapVis
      .select(`#${stateName}`)
      .style("fill", `url(#${stateName}-pattern)`)
      .attr("data-selected", "true");

    if (!this.selectedStates.includes(stateName)) {
      this.selectedStates.push(stateName);
    }

    // $("#map-visualization").prop("states", this.selectedStates);
    // $("#map-visualization").trigger("change");
  }

  deselectState(stateName) {
    // console.log(`Deselect ${stateName}`);
    this.mapVis
      .select(`#${stateName}`)
      .style("fill", this.colorScale(self.regionalData[stateName]))
      .attr("data-selected", "false");
    this.mapVis.select(`#${stateName}-pattern`).remove();

    this.selectedStates = this.selectedStates.filter(
      (ele) => ele !== stateName
    );

    // $("#map-visualization").prop("states", this.selectedStates);
    // $("#map-visualization").trigger("change");
  }

  _deselectAllState() {
    $('.select-btn').attr("disabled", false);
    this.mapVis.selectAll('.state-pattern').remove();
    this.selectedStates.forEach(state=>{
      this.deselectState(state);
    })
    this.selectedStates = [];

    // this._mapVisRegionRender(self.regionalData, this.regionalDataName);
    $("#map-visualization").prop("states", this.selectedStates);
    $("#map-visualization").trigger("change");
  }

  _createToolTipHtml(state, data) {
    /* function to create html content string in tooltip div. */
    let html = "<h4>" + state + "</h4><table>";
    Object.keys(data).forEach((key) => {
      html += "<tr><td>" + key + ":</td><td>" + data[key] + "</td></tr>";
    });
    return html;
  }

  _reformatStateName(state) {
    // make the first word uppercase
    let state_name = "";
    state.split("-").forEach((str) => {
      state_name += str.charAt(0).toUpperCase() + str.slice(1) + " ";
    });
    return state_name;
  }

  mapVisRender(symbolDataName, regionalDataName, yearRange, selectedStates) {
    // update data on demand
    if (
      regionalDataName !== this.regionalDataName ||
      yearRange !== this.yearRange
    ) {
      // console.log("-- map randers gdp rate --")
      let regionalData = {},
        regionalDataYears = [],
        descending_order = [];
      switch (regionalDataName) {
        case "gdp-growth-rate":
          [regionalData, regionalDataYears, descending_order] = getGdpRate(
            this.datasets["gdp_data"],
            yearRange
          );

          break;
        case "gdp-value":
          [regionalData, regionalDataYears, descending_order] = getGdpValue(
            this.datasets["gdp_data"],
            yearRange
          );
          break;
        default:
          break;
      }
      self.regionalData = regionalData;
      self.regionalDataDesendOrder = descending_order;
      this._mapVisRegionRender(regionalData, regionalDataName);
    }

    if (
      symbolDataName !== this.symbolDataName ||
      yearRange !== this.yearRange
    ) {
      // console.log("-- map randers election arrows --")
      switch (symbolDataName) {
        case "shift-of-vote":
          this._mapVisSymbolRender(
            this.datasets["election_data"],
            yearRange,
            symbolDataName
          );
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
    this.colorScale = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(data)))
      .range(["#F0F0F0", "green"]);

    // TODO: Maybe try render from iterating elements
    // console.log('keys', Object.keys(data));
    Object.keys(data).forEach((state) => {
      let t = d3.transition(d3.easePolyInOut).duration(500);
      // console.log('colorScale(data[state])', colorScale(data[state]));
      d3.select(`#${state}`)
        .transition(t)
        .attr("fill", this.colorScale(data[state]))
        .attr("data-" + regionalDataName, data[state]);
    });

    if (this.selectedStates.length !== 0) {
      this.selectedStates.forEach((e) => {
        this.selectState(e);
      });
    }
    $("#map-visualization").prop("states", this.selectedStates);

    let unit_name = "";
    if (regionalDataName=="gdp-growth-rate") {
      unit_name = " %";
    } else if (regionalDataName=="gdp-value") {
      unit_name = " billion USD";
    }


    $("#legend-unit").html(unit_name);
    mapColorLegend(this.colorScale);

    // $("#map-visualization").trigger("change");
  }

  _mapVisSymbolRender(data, yearRange, symbolDataName) {
    this._removeElementsByClass("arrow"); // remove current arrows
    this.mapVis.selectAll("rect.state-election-result").remove();
    // draw symbol data vis
    let [states_overall_shift, states_all_years, dir_dem_states, dir_rep_states] = getOverallVotesShift(
      data,
      yearRange
    );

    self.symbalDataDirDem = dir_dem_states;
    self.symbalDataDirRep = dir_rep_states;

    const shiftsValue = Array.from(Object.values(states_overall_shift), (e) =>
      parseFloat(e["shift"])
    );
    // console.log("shiftValues:", shiftsValue);
    const arrowLengthScaler = d3
      .scaleLinear()
      .domain(d3.extent(shiftsValue))
      .range([5, 50]);

    for (let state in states_overall_shift) {
      this.arrowVis.create_arrow(
        states_overall_shift[state]["direction"],
        this.USStatesData.centroids[state]["x"],
        this.USStatesData.centroids[state]["y"],
        arrowLengthScaler(states_overall_shift[state]["shift"])
      );

      let this_dom = document.getElementById(state);

      this_dom.setAttribute("data-" + symbolDataName, [
        states_overall_shift[state]["direction"],
        states_overall_shift[state]["shift"],
      ])

      this_dom.setAttribute(
        "data-avg-vote-amount",
        states_overall_shift[state]["avg-vote-amount"]
      )

      this_dom.setAttribute(
        "data-start-year",
        "dem " + states_overall_shift[state]["dem-vote"][0] + ", rep " + states_overall_shift[state]["rep-vote"][0]
      )

      this_dom.setAttribute(
        "data-end-year",
        "dem " + states_overall_shift[state]["dem-vote"][1] + ", rep " + states_overall_shift[state]["rep-vote"][1]
      )

      const result = states_overall_shift[state]["elect-result-change"];
      const resultColor = { dem: "blue", rep: "red" };
      const sqWidth = 10;
      this.mapVis
        .append("rect")
        .attr("class", "state-election-result")
        .attr("x", this.USStatesData.centroids[state]["x"] - sqWidth / 2)
        .attr("y", this.USStatesData.centroids[state]["y"] + 3)
        .attr("width", sqWidth)
        .attr("height", sqWidth)
        .style("fill", resultColor[result.split("-")[0]]);
      this.mapVis
        .append("rect")
        .attr("class", "state-election-result")
        .attr("x", this.USStatesData.centroids[state]["x"] + sqWidth / 2)
        .attr("y", this.USStatesData.centroids[state]["y"] + 3)
        .attr("width", sqWidth)
        .attr("height", sqWidth)
        .style("fill", resultColor[result.split("-")[1]]);
    }

    // this.mapVis
    //   .selectAll('.state-election-result')
    //   .data(states_overall_shift)
    //   .enter()
    //   .append('rect')
    //   .attr('class', 'state-election-result')
    //   .attr('x', d => {
    //     console.log('draw rect');
    //     return this.USStatesData.centroids[d]["x"];
    //   })
    //   .attr('y', d => this.USStatesData.centroids[d]["x"])
    //   .attr('width', 10)
    //   .attr('height', 10)
    //   .style('fill', '#69b3a2');
  }

  _removeElementsByClass(className) {
    let elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  selectTopStatesInit() {
    // select top states based on regional data
    $('#top-regional').on('click', ()=> {
      this._deselectAllState();
      $('#top-regional').attr("disabled", true);
      this.selectedStates = self.regionalDataDesendOrder.slice(0,10);
      this.selectedStates.forEach(state=>{this.selectState(state)});
      $("#map-visualization").prop("states", this.selectedStates);
      $("#map-visualization").trigger("change");
    });

    $('#select-all-states').on('click', ()=> {
      this._deselectAllState();
      $('#select-all-states').attr("disabled", true);
      this.selectedStates = self.regionalDataDesendOrder;
      this.selectedStates.forEach(state=>{this.selectState(state)});
      $("#map-visualization").prop("states", this.selectedStates);
      $("#map-visualization").trigger("change");
    });

    // select top states based on rep shift rate
    $('#top-rep-shift').on('click', ()=> {
      this._deselectAllState();
      $('#top-rep-shift').attr("disabled", true);
      this.selectedStates = self.symbalDataDirRep
      this.selectedStates.forEach(state=>{this.selectState(state)});
      $("#map-visualization").prop("states", this.selectedStates);
      $("#map-visualization").trigger("change");
    });

    // select top states based on dem shift rate
    $('#top-dem-shift').on('click', ()=> {
      this._deselectAllState();
      $('#top-dem-shift').attr("disabled", true);
      this.selectedStates = self.symbalDataDirDem
      this.selectedStates.forEach(state=>{this.selectState(state)});
      $("#map-visualization").prop("states", this.selectedStates);
      $("#map-visualization").trigger("change");
    });

    // clear selected states
    $('#top-clear').on('click', ()=>{
      this._deselectAllState()
      $("#map-visualization").prop("states", this.selectedStates);
      $("#map-visualization").trigger("change");
    });
  }
}
