import * as d3 from "d3";
import * as $ from "jquery";
import { getSymbolDataName, getRegionalDataName } from "../tools/data-manager";

export default class ControlPane {
  constructor(datasets) {
    this.datasets = datasets;
  }
  preprocessGDPGrowthRate(data) {
    // console.log('[Preprocess GDP Growth Rate]\n Raw Data: ',data);

    // get years
    const re = /\d/;
    const regex = new RegExp(re, "g");
    let years = data.columns.filter((c) => c.match(regex)).sort();
    // console.log(data.columns);
    // console.log(years);

    //TODO: dynamically choose first and last election year
    let firstElectionYear = "2000";
    let lastElectionYear = "2016";

    let dateParser = d3.timeParse("%Y");

    // get GDP value
    let yearlyGDPValue = [];
    let startIndex = years.indexOf(firstElectionYear) - 1;
    let endIndex = years.indexOf(lastElectionYear);
    for (let i = startIndex; i <= endIndex; ++i) {
      let year = years[i];
      let yearValue = d3.sum(data, (d) => {
        let gdp_value = d[year]
          .replace(/\(/, "")
          .replace(/\)/, "")
          .split(", ")
          .map((x) => +x)[0];
        // console.log(gdp_value);
        return gdp_value;
      });
      yearlyGDPValue.push({ year: dateParser(year), gdp_value: yearValue });
    }
    // console.log('yearly GDP Value: ', yearlyGDPValue);

    // get GDP growth rate
    let yearlyGDPGrowthRate = [];
    for (let i = 1; i < yearlyGDPValue.length; ++i) {
      yearlyGDPGrowthRate.push({
        year: yearlyGDPValue[i].year,
        regionalData:
          (yearlyGDPValue[i].gdp_value - yearlyGDPValue[i - 1].gdp_value) /
          yearlyGDPValue[i - 1].gdp_value,
      });
    }
    // console.log('yearly GDP Growth Rate: ', yearlyGDPGrowthRate);
    return yearlyGDPGrowthRate;
  }
  preprocessGDPValue(data) {
    // console.log('[Preprocess GDP Growth Rate]\n Raw Data: ',data);

    // get years
    const re = /\d/;
    const regex = new RegExp(re, "g");
    let years = data.columns.filter((c) => c.match(regex)).sort();
    // console.log(data.columns);
    // console.log(years);

    // TODO: dynamically choose first and last election year
    let firstElectionYear = "2000";
    let lastElectionYear = "2016";

    let dateParser = d3.timeParse("%Y");

    // TODO: integrate GDP Value function and GDP Growth Rate function; notice the first election year problem
    // get GDP value
    let yearlyGDPValue = [];
    let startIndex = years.indexOf(firstElectionYear);
    let endIndex = years.indexOf(lastElectionYear);
    for (let i = startIndex; i <= endIndex; ++i) {
      let year = years[i];
      let yearValue = d3.sum(data, (d) => {
        let gdp_value = d[year]
          .replace(/\(/, "")
          .replace(/\)/, "")
          .split(", ")
          .map((x) => +x)[0];
        // console.log(gdp_value);
        return gdp_value;
      });
      yearlyGDPValue.push({ year: dateParser(year), regionalData: yearValue });
    }
    // console.log('yearly GDP Value: ', yearlyGDPValue);
    return yearlyGDPValue;
  }
  yearSelectionRender() {
    /*
    Render the year selection bar as the symbol data / regional data changed.
    */

    // Load data
    let regionalDataName = getRegionalDataName();
    switch (regionalDataName) {
      case "gdp-growth-rate":
        // Example Data
        // let dateParser = d3.timeParse("%Y");
        // let data = [
        //   { year: dateParser(2000), regionalData: 12 },
        //   { year: dateParser(2004), regionalData: 15 },
        //   { year: dateParser(2008), regionalData: 25 },
        //   { year: dateParser(2012), regionalData: 11 },
        //   { year: dateParser(2016), regionalData: 5 },
        //   { year: dateParser(2020), regionalData: 8 },
        // ];
        d3.csv(`/datasets/gdp_data.csv`)
          .then((data) => this.preprocessGDPGrowthRate(data))
          .then((data) => this._yearSelectionVisRender(data));
        break;
      case "gdp-value":
        d3.csv(`/datasets/gdp_data.csv`)
          .then((data) => this.preprocessGDPValue(data))
          .then((data) => this._yearSelectionVisRender(data));
        break;
      default:
        break;
    }
  }
  _yearSelectionVisRender(data) {
    // console.log("vis data:", data);
    const interval = d3.timeYear.every(4);
    let dateParser = d3.timeParse("%Y");

    // init vis size and margin
    this.viewHeight = 150;
    this.viewWidth = 800;

    this.margins = {
      top: 20,
      right: 50,
      bottom: 20,
      left: 50,
    };

    let yearVis = d3
      .select("#year-selection")
      .attr("width", this.viewWidth)
      .attr("height", this.viewHeight)
      .attr("viewbox", [0, 0, this.viewWidth, this.viewHeight]);

    d3.selectAll("#year-selection > *").remove();

    // data axis scaler
    let xYearScaler = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.year))
      .range([this.margins.left, this.viewWidth - this.margins.right]);
    let yRegionalDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.regionalData))
      .range([this.viewHeight - this.margins.bottom, this.margins.top]);

    // add axes
    // TODO: reduce y axis ticks
    yearVis
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        `translate(0,${this.viewHeight - this.margins.bottom})`
      )
      .call(d3.axisBottom(xYearScaler));

    yearVis
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${this.margins.left}, 0)`)
      .call(d3.axisLeft(yRegionalDataScaler));

    // draw dot
    yearVis
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xYearScaler(d.year))
      .attr("cy", (d) => yRegionalDataScaler(d.regionalData))
      .attr("r", 5)
      .style("fill", "#69b3a2");

    // line generator
    const GDPGrowthLine = d3
      .line()
      .x((d) => xYearScaler(d.year))
      .y((d) => yRegionalDataScaler(d.regionalData));

    // draw line
    yearVis
      .append("path")
      .datum(data)
      .attr("class", "line line-gdp")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", GDPGrowthLine);

    // brush
    let brush = d3
      .brushX()
      .extent([
        [this.margins.left, this.margins.top],
        [
          this.viewWidth - this.margins.right,
          this.viewHeight - this.margins.bottom,
        ],
      ])
      .on("start brush", brushing) // snap with 4 year-period during brushing
      .on("end", brushed); // update vis after brushed

    // TODO: dynamically choose first two election periods as default extent
    let defaultExtent = [
      xYearScaler(dateParser(2000)),
      xYearScaler(dateParser(2008)),
    ];
    // console.log("default extent: ", defaultExtent);

    yearVis
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, defaultExtent); // set default year selection

    function brushing(event) {
      // console.log("d3.event.type", d3.event.type);
      // console.log("d3.event.sourceEvent.type", d3.event.sourceEvent.type);
      // console.log('d3.event.selection', d3.event.selection);

      // if during brush or bursh event not trigger by brush but brush.move, do not calculate
      if (d3.event.sourceEvent != null && d3.event.sourceEvent.type === "brush")
        return;

      const d0 = d3.event.selection.map(xYearScaler.invert);
      const d1 = d0.map(interval.round);

      // If empty when rounded, use floor instead.
      if (d1[0] >= d1[1]) {
        d1[0] = interval.floor(d0[0]);
        d1[1] = interval.offset(d1[0]);
      }

      // console.log("d3.select(this)", d3.select(this));
      // console.log('snap brush')
      d3.select(this).call(brush.move, d1.map(xYearScaler));
    }

    function brushed(event) {
      // console.log(d3.event.selection);
      const selection = d3.event.selection;
      const invert = xYearScaler.invert;
      const formatTime = d3.timeFormat("%Y");
      const [startYear, endYear] = selection.map(invert).map(formatTime);
      // console.log(startYear, endYear);
      yearVis.property("range", [startYear, endYear]);
      $("#year-selection").trigger("change");
      // console.log('html range', yearVis.property('range'))
    }
  }
}
