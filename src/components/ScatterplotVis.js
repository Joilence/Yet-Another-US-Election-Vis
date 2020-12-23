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
  }
  scatterplotVisRender() {
    // update data on demand

  }
  _scatterplotVisRender(data) {
    // console.log("scatterplot vis data:", data);
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
    
    d3.select("#scatter-plot").remove();

    let sctVis = d3
      .select("#scatterplot-container")
      .append('svg')
      .attr('id', 'scatter-plot')
      .attr("width", this.viewWidth)
      .attr("height", this.viewHeight)
      .attr("viewbox", [0, 0, this.viewWidth, this.viewHeight]);

    

    // data axis scaler
    let xSymbolDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.symbolData))
      .range([this.margins.left, this.viewWidth - this.margins.right]);
    let yRegionalDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.regionalData))
      .range([this.viewHeight - this.margins.bottom, this.margins.top]);

    // add axes
    // TODO: reduce y axis ticks
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
    sctVis
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xSymbolDataScaler(d.year))
      .attr("cy", (d) => yRegionalDataScaler(d.regionalData))
      .attr("r", 4)
      .style("fill", "#69b3a2");

    // brush
    // let brush = d3
    //   .brushX()
    //   .extent([
    //     [this.margins.left, this.margins.top],
    //     [
    //       this.viewWidth - this.margins.right,
    //       this.viewHeight - this.margins.bottom,
    //     ],
    //   ])
    //   .on("end", brushed); // update vis after brushed

    // let defaultExtent = [
    //   xSymbolDataScaler(dateParser(2000)),
    //   xSymbolDataScaler(dateParser(2008)),
    // ];
    // // console.log("default extent: ", defaultExtent);

    // sctVis
    //   .append("g")
    //   .attr("class", "brush")
    //   .call(brush)
    //   .call(brush.move, defaultExtent); // set default year selection

    // function brushed(event) {
    //   // console.log(d3.event.selection);
    //   const selection = d3.event.selection;
    //   const invert = xSymbolDataScaler.invert;
    //   const formatTime = d3.timeFormat("%Y");
    //   const [startYear, endYear] = selection.map(invert).map(formatTime);
    //   // console.log(startYear, endYear);
    //   sctVis.property("range", [startYear, endYear]);
    //   $("#year-selection").trigger("change");
    //   // console.log('html range', sctVis.property('range'))
    // }
  }
}
