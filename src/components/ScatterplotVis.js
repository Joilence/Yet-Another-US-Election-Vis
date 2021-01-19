import * as d3 from "d3";
import * as $ from "jquery";
import {
  getOverallVotesShift,
  getGdpRate,
  getGdpValue,
} from "../tools/data-manager";

export default class ScatterplotVis {
  constructor(datasets) {
    this.datasets = datasets;

    // Data Option
    this.symbolDataName = "";
    this.regionalDataName = "";
    this.yearRange = [];
    this.periods = [];
    this.selectedStates = [];

    // processed data
    this.regionalData = {};
    this.symbolData = {};
  }

  /**
   *  #######################################################################
   *  ######################### Data Processing #############################
   *  #######################################################################
   */

  getPeriods(yearRange) {
    // console.log('getPeriods:', yearRange);
    const startYear = parseInt(yearRange[0]);
    const endYear = parseInt(yearRange[1]);
    let periods = [];
    for (let i = startYear; i < endYear; i += 4) {
      // console.log('sp: year range:', i, i+4);
      periods.push([String(i), String(i + 4)]);
    }
    // console.log('sp: get periods:', periods);
    return periods;
  }

  preprocessGDPValue(data) {
    const regionalDataPerPeriods = {};
    this.periods.forEach((yearRange) => {
      // console.log(`sp: proc votes shift of ${yearRange}`, getGDPValue(data, yearRange)[0]);
      const regionalDataPeriod = getGdpValue(data, yearRange)[0];
      Object.keys(regionalDataPeriod).forEach((state) => {
        if (!this.selectedStates.includes(state)) return;
        // console.log(`${state} (${String(yearRange)}):`, regionalDataPeriod[state]);
        regionalDataPerPeriods[`${state} (${String(yearRange)})`] =
          regionalDataPeriod[state];
      });
    });

    // console.log('proc regionalDataPerPeriods:', regionalDataPerPeriods);

    return regionalDataPerPeriods;
  }

  preprocessGDPGrowthRate(data) {
    const regionalDataPerPeriods = {};
    this.periods.forEach((yearRange) => {
      // console.log(`sp: proc votes shift of ${yearRange}`, getGdpRate(data, yearRange)[0]);
      const regionalDataPeriod = getGdpRate(data, yearRange)[0];
      Object.keys(regionalDataPeriod).forEach((state) => {
        if (!this.selectedStates.includes(state)) return;
        // console.log(`${state} (${String(yearRange)}):`, regionalDataPeriod[state]);
        regionalDataPerPeriods[`${state} (${String(yearRange)})`] =
          regionalDataPeriod[state];
      });
    });

    // console.log('proc regionalDataPerPeriods:', regionalDataPerPeriods);

    return regionalDataPerPeriods;
  }

  preprocessShiftOfVotes(data) {
    const symbolDataPerPeriods = {};
    this.periods.forEach((yearRange) => {
      // console.log(`sp: proc votes shift of ${yearRange}`, getOverallVotesShift(data, yearRange)[0]);
      const symbolDataPeriod = getOverallVotesShift(data, yearRange)[0];
      Object.keys(symbolDataPeriod).forEach((state) => {
        // console.log('shift votes: this.selectedStates:', this.selectedStates);
        if (!this.selectedStates.includes(state)) return;
        // console.log(`${state} (${String(yearRange)}):`, symbolDataPeriod[state]);
        // symbolDataPerPeriods[`${state} (${String(yearRange)})`] = symbolDataPeriod[state];
        symbolDataPerPeriods[`${state} (${String(yearRange)})`] =
          symbolDataPeriod[state].direction === "rep"
            ? -parseFloat(symbolDataPeriod[state].shift)
            : parseFloat(symbolDataPeriod[state].shift);
      });
    });

    // console.log('proc symbolDataPerPeriods:', symbolDataPerPeriods);

    return symbolDataPerPeriods;
  }

  /**
   *  #######################################################################
   *  ########################### Vis Render ################################
   *  #######################################################################
   */

  scatterplotVisRender(dataOption) {
    console.log("before:", this.yearRange, this.selectedStates);
    console.log("current: ", dataOption.yearRange, dataOption.selectedStates);
    // update data on demand

    this.yearRange = dataOption.yearRange;
    this.periods = this.getPeriods(this.yearRange);
    this.selectedStates = dataOption.selectedStates;

    if (true || dataOption.regionalDataName !== this.regionalDataName) {
      console.log("re proc regional data");
      this.regionalDataName = dataOption.regionalDataName;
      switch (this.regionalDataName) {
        case "gdp-growth-rate":
          this.regionalData = this.preprocessGDPGrowthRate(
            this.datasets.gdp_data
          );
          break;
        case "gdp-value":
          this.regionalData = this.preprocessGDPValue(this.datasets.gdp_data);
        default:
          this.regionalData = {};
          break;
      }
    }

    if (true || dataOption.symbolDataName !== this.symbolDataName) {
      console.log("re proc symbol data");
      this.symbolDataName = dataOption.symbolDataName;
      console.log("this symbol data name", this.symbolDataName);
      switch (this.symbolDataName) {
        case "shift-of-vote":
          this.symbolData = this.preprocessShiftOfVotes(
            this.datasets.election_data
          );
          break;
        default:
          this.symbolData = {};
          break;
      }
    }

    this._scatterplotVisRender();
  }

  _scatterplotVisRender() {
    // console.log("scatterplot vis data:", data);
    let dateParser = d3.timeParse("%Y");

    // init vis size and margin
    this.viewHeight = 400;
    this.viewWidth = 400;

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

    // console.log('render: regional:', this.regionalData);
    // console.log('render: symbol:', this.symbolData);
    // console.log('render: this.selectedStates:', this.selectedStates);
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
    let data = [];
    // console.log("this.symbolData: ", this.symbolData);
    // console.log("this.regionalData: ", this.regionalData);
    // console.log(Object.keys(this.symbolData));
    Object.keys(this.symbolData).forEach((stateName) => {
      data.push({
        stateName: stateName,
        regionalData: this.regionalData[stateName],
        symbolData: this.symbolData[stateName],
      });
    });
    // let data = this.symbolData.map((item, i) => Object.assign({}, item, this.regionalData[i]));
    // console.log(data);
    sctVis
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xSymbolDataScaler(d.symbolData))
      .attr("cy", (d) => yRegionalDataScaler(d.regionalData))
      .attr("r", 4)
      .style("fill", "#69b3a2");
    // .on("mouseover", (d) => {
    //   console.log('mouse over');
    //   $('#scatterplot-tooltip').text(`StateName: ${d.stateName}, GDP Growth Rate: ${d.regionalData}, ShiftOfVotes: Towards Republicans by ${d.symbolData}`);
    // })
    // .on("mouseout", (d) => {
    //   console.log('mouse out');
    //   // $('#scatterplot-tooltip').text('');
    // });
  }
}
