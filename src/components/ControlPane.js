import * as d3 from "d3";
import * as $ from 'jquery';

export default class ControlPane {
  constructor() {}
  yearSelectionRender() {
    /*
    Render the year selection bar as the symbol data / regional data changed.
    */

   var dateParser = d3.timeParse("%Y");
   var data = [
     { year: dateParser(2000), regionalData: 12 },
     { year: dateParser(2004), regionalData: 15 },
     { year: dateParser(2008), regionalData: 25 },
     { year: dateParser(2012), regionalData: 11 },
     { year: dateParser(2016), regionalData: 5 },
     { year: dateParser(2020), regionalData: 8 },
   ];

    // console.log("raw data:", data);

    const interval = d3.timeYear.every(4);
    var dateParser = d3.timeParse("%Y");

    // init vis size and margin
    this.viewHeight = 150;
    this.viewWidth = 800;

    this.margins = {
      top: 20,
      right: 50,
      bottom: 20,
      left: 50,
    };

    var yearVis = d3
      .select("#year-selection")
      .attr("width", this.viewWidth)
      .attr("height", this.viewHeight)
      .attr("viewbox", [0, 0, this.viewWidth, this.viewHeight]);
    
    d3.selectAll('#year-selection > *').remove()

    // data axis scaler
    var xYearScaler = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.year))
      .range([this.margins.left, this.viewWidth - this.margins.right]);
    var yRegionalDataScaler = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.regionalData))
      .range([this.viewHeight - this.margins.bottom, this.margins.top]);

    // add axes
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
      .on('end', brushed); // update vis after brushed
    
    let defaultExtent = [xYearScaler(dateParser(2000)), xYearScaler(dateParser(2004))];
    yearVis.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, defaultExtent); // set default year selection

    function brushing(event) {
      // console.log("d3.event.type", d3.event.type);
      // console.log("d3.event.sourceEvent.type", d3.event.sourceEvent.type);
      // console.log('d3.event.selection', d3.event.selection);

      // if during brush or bursh event not trigger by brush but brush.move, do not calculate
      if (d3.event.sourceEvent != null && d3.event.sourceEvent.type === "brush") return;

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
      const formatTime = d3.timeFormat('%Y');
      const [startYear, endYear] = selection.map(invert).map(formatTime);
      // console.log(startYear, endYear);
      yearVis.property('range', [startYear, endYear]);
      $('#year-selection').trigger('change');
      // console.log('html range', yearVis.property('range'))
    }
  }
}
