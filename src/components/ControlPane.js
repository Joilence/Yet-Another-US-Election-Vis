import * as d3 from "d3";
import * as $ from "jquery";
import { getSymbolDataName, getRegionalDataName } from "../tools/data-manager";

export default class ControlPane {
  constructor(datasets) {
    this.datasets = datasets;
    this.electionResult = [
      { year: 2000, party: "rep" },
      { year: 2004, party: "rep" },
      { year: 2008, party: "dem" },
      { year: 2012, party: "dem" },
      // { year: 2016, party: "rep" },
    ];
    // processed data
    this.yearlyGDPGrowthRate = undefined;
    this.yearlyGDPValue = undefined;
    // TODO: better structure for update vis
    this.rendered = false;
  }

  preprocessGDPGrowthRate(data) {
    if (this.yearlyGDPGrowthRate != undefined) return this.yearlyGDPGrowthRate;
    // console.log('[Preprocess GDP Growth Rate]\n Raw Data: ',data);

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
    this.yearlyGDPGrowthRate = yearlyGDPGrowthRate;
    return yearlyGDPGrowthRate;
  }

  preprocessGDPValue(data) {
    if (this.yearlyGDPValue !== undefined) return this.yearlyGDPValue;
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
    this.yearlyGDPValue = yearlyGDPValue;
    return yearlyGDPValue;
  }

  yearSelectionRender() {
    /*
    Render the year selection bar as the symbol data / regional data changed.
    */

    // Load data
    let regionalDataName = getRegionalDataName();

    // Preprocess data
    let processedData = [];
    switch (regionalDataName) {
      case "gdp-growth-rate":
        processedData = this.preprocessGDPGrowthRate(this.datasets.gdp_data);
        break;
      case "gdp-value":
        processedData = this.preprocessGDPValue(this.datasets.gdp_data);
        break;
      default:
        break;
    }
    this._yearSelectionVisRender(processedData);
  }

  _yearSelectionVisRender(data) {
    if (this.rendered === true) {
      this._yearSelectionVisUpdate(data);
      return;
    }
    this.rendered = true;

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

    // draw election result bar
    yearVis
      .append("g")
      .attr("id", "rect-container")
      .selectAll("rect.election-result-rect")
      .data(this.electionResult)
      .enter()
      .append("rect")
      .attr("class", "election-result-rect")
      .attr("x", (d) => {
        console.log("d in x:", d);
        console.log("rect year:", d.year);
        const dateParser = d3.timeParse("%Y");
        console.log("year x:", xYearScaler(dateParser(d.year)));
        return xYearScaler(dateParser(d.year));
      })
      .attr("y", (d) => {
        console.log(
          "y:",
          yRegionalDataScaler(d3.extent(data, (d) => d.regionalData)[1])
        );
        // return yRegionalDataScaler(yRegionalDataScaler.range[0]);
        return this.margins.top;
      })
      .attr("width", (d) => {
        const dateParser = d3.timeParse("%Y");
        const width =
          xYearScaler(dateParser(2004)) - xYearScaler(dateParser(2000));
        // console.log("bar width:", width);
        return width;
      })
      .attr("height", (d) => {
        const height = this.viewHeight - this.margins.top - this.margins.bottom;
        // console.log("bar height:", height);
        return height;
      })
      .style("fill", (d) => {
        return d.party === "rep" ? "red" : "blue";
      })
      .style("opacity", 0.3);

    // add axes
    yearVis
      .append("g")
      .attr("id", "year-selection-x-axis")
      .attr("class", "x axis")
      .attr(
        "transform",
        `translate(0,${this.viewHeight - this.margins.bottom})`
      )
      .call(
        d3
          .axisBottom(xYearScaler)
          .ticks(interval)
          .tickSize(-this.viewHeight + this.margins.top + this.margins.bottom)
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "#fff")
          .attr("stroke-opacity", (d) => {
            console.log("draw tickline:", d);
            return d <= d3.timeYear(d) ? 1 : 0.5;
          })
      );

    yearVis
      .append("g")
      .attr("id", "year-selection-y-axis")
      .attr("class", "y axis") // TODO: Necessity of class for axis?
      .attr("transform", `translate(${this.margins.left}, 0)`)
      .call(d3.axisLeft(yRegionalDataScaler).ticks(5));

    // draw dot
    yearVis
      .append("g")
      .selectAll(".year-selection-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "year-selection-circle")
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
      .attr("class", "line line-gdp") // TODO: Necessity of class for line?
      .attr("id", "year-selection-line")
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
      .attr("id", "year-selection-brush")
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

  _yearSelectionVisUpdate(data) {
    // console.log('update year selection vis.');
    // console.log('new dataset: ', data);
    let t = d3.transition().ease(d3.easePolyInOut).duration(400);
    let yearVis = d3.select("#year-selection");
    // update axes
    let xYearScaler = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.year))
      .range([this.margins.left, this.viewWidth - this.margins.right]);
    let yRegionalDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.regionalData))
      .range([this.viewHeight - this.margins.bottom, this.margins.top]);

    d3.select("#year-selection-x-axis")
      .transition(t)
      .call(d3.axisBottom(xYearScaler))
      .call(
        d3
          .axisBottom(xYearScaler)
          .ticks(d3.timeYear.every(4))
          .tickSize(-this.viewHeight + this.margins.top + this.margins.bottom)
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "#fff")
          .attr("stroke-opacity", (d) => {
            console.log("draw tickline:", d);
            return d <= d3.timeYear(d) ? 1 : 0.5;
          })
      );

    d3.select("#year-selection-y-axis")
      .transition(t)
      .call(d3.axisLeft(yRegionalDataScaler).ticks(5));

    // update dots
    // console.log('year-selection-circle:', d3.selectAll(".year-selection-circle"));
    d3.selectAll(".year-selection-circle")
      .data(data)
      // TODO: why not enter and append?
      // .enter()
      // .append("circle")
      .transition(t)
      .attr("class", "year-selection-circle")
      .attr("cx", (d) => {
        // console.log('updating dots: ', d);
        return xYearScaler(d.year);
      })
      .attr("cy", (d) => yRegionalDataScaler(d.regionalData))
      .attr("r", 5)
      .style("fill", "#69b3a2");

    // line generator
    const yearSelectionLine = d3
      .line()
      .x((d) => xYearScaler(d.year))
      .y((d) => yRegionalDataScaler(d.regionalData));

    // update line
    d3.select("#year-selection-line")
      .transition(t)
      .attr("d", yearSelectionLine(data));

    // TODO: right way to re-register brush
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
    let dateParser = d3.timeParse("%Y");
    let interval = d3.timeYear.every(4);
    let defaultExtent = [
      xYearScaler(dateParser(2000)),
      xYearScaler(dateParser(2008)),
    ];
    // console.log("default extent: ", defaultExtent);

    d3.select("#year-selection-brush").remove();

    yearVis
      .append("g")
      .attr("class", "brush")
      .attr("id", "year-selection-brush")
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
