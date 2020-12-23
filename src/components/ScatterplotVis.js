import * as d3 from "d3";
import * as $ from "jquery";
import {
  getSymbolDataName,
  getRegionalDataName,
  getYearRange,
} from "../tools/data-manager";

export default class ScatterplotVis {
  constructor(datasets) {
    this.datasets = datasets;
    // current data name
    this.symbolDataName = undefined;
    this.regionalDataName = undefined;
    this.yearRange = undefined;
    // processed data
    this.regionalData = {};
    this.symbolData = {};
  }
  scatterplotVisRender() {
    console.log('current: ', getRegionalDataName(), getSymbolDataName());
    // update data on demand
    if (getRegionalDataName() !== this.regionalDataName) {
      this.regionalDataName = getRegionalDataName();
      switch (this.regionalDataName) {
        case "gdp-growth-rate":
          this.regionalData = this.preprocessGDPGrowthRate(this.datasets.gdp_data);
          break;
        case "gdp-value":
          break;
        default:
          break;
      }
    }

    if (getSymbolDataName() !== this.symbolDataName) {
      this.symbolDataName = getSymbolDataName();
      console.log('this symbol data name', this.symbolDataName);
      switch (this.symbolDataName) {
        case "shift-of-votes":
          this.symbolData = this.preprocessShiftOfVotes(this.election_data);
          break;
        default:
          break;
      }
    }
    // TODO: fix symbol data problem
    this.symbolData = this.preprocessShiftOfVotes(this.election_data);

    this._scatterplotVisRender();
  }
  preprocessGDPGrowthRate(data) {
    return {
      alabama: 0.38,
      new_york: 0.1,
      washington_dc: 0.5,
    }
  }
  preprocessShiftOfVotes(data) {
    return {
      alabama: 0.23,
      new_york: 0.1,
      washington_dc: 0.44,
    }
  }
  _scatterplotVisRender() {
    // console.log("scatterplot vis data:", data);
    let dateParser = d3.timeParse("%Y");

    // init vis size and margin
    this.viewHeight = 800;
    this.viewWidth = 800;

    this.margins = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };

    d3.select("#scatter-plot").remove();

    let sctVis = d3
      .select("#scatterplot-container")
      .append("svg")
      .attr("id", "scatter-plot")
      .attr("width", this.viewWidth)
      .attr("height", this.viewHeight)
      .attr("viewbox", [0, 0, this.viewWidth, this.viewHeight]);

    // data axis scaler
    let xSymbolDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(this.symbolData)))
      .range([this.margins.left, this.viewWidth - this.margins.right]);
    let yRegionalDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(Object.values(this.regionalData)))
      .range([this.viewHeight - this.margins.bottom, this.margins.top]);

    // add axes
    // TODO: reduce axis ticks
    sctVis
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        `translate(0,${this.viewHeight - this.margins.bottom})`
      )
      .call(d3.axisBottom(xSymbolDataScaler));

    sctVis
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${this.margins.left}, 0)`)
      .call(d3.axisLeft(yRegionalDataScaler));

    // draw dot
    let data = []
    console.log("this.symbolData: ", this.symbolData);
    console.log("this.regionalData: ", this.regionalData);
    console.log(Object.keys(this.symbolData));
    Object.keys(this.symbolData).forEach(stateName => {
      data.push({
        stateName: stateName,
        regionalData: this.regionalData[stateName],
        symbolData: this.symbolData[stateName],
        period: "2004-2008",
      })
    })
    // let data = this.symbolData.map((item, i) => Object.assign({}, item, this.regionalData[i]));
    console.log(data);
    sctVis
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xSymbolDataScaler(d.symbolData))
      .attr("cy", (d) => yRegionalDataScaler(d.regionalData))
      .attr("r", 4)
      .style("fill", "#69b3a2")
      .on("mouseover", (d) => {
        console.log('mouse over');
        $('#scatterplot-tooltip').text(`StateName: ${d.stateName}, GDP Growth Rate: ${d.regionalData}, ShiftOfVotes: Towards Republicans by ${d.symbolData}`);
      })
      .on("mouseout", (d) => {
        console.log('mouse out');
        // $('#scatterplot-tooltip').text('');
      });
  }
}
