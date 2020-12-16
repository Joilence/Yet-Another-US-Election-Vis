import * as d3 from "d3";

export default class ControlPane {
  constructor() {}
  controlPaneInit() {
    var dateParser = d3.timeParse("%Y");
    var data = [
      { year: dateParser(2000), regionalData: 12 },
      { year: dateParser(2004), regionalData: 15 },
      { year: dateParser(2008), regionalData: 25 },
      { year: dateParser(2012), regionalData: 11 },
      { year: dateParser(2016), regionalData: 5 },
      { year: dateParser(2020), regionalData: 8 },
    ];
    this.yearSelectionRender(data);
  }
  yearSelectionRender(data) {
    /*
    Render the year selection bar as the symbol data / regional data changed.
    */

    console.log("raw data:", data);

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
      .on("brush", brushed);

    yearVis.append("g").attr("class", "brush").call(brush);

    function brushed(event) {
      // if not selected, set default selection
      // let extent = d3.event.selection;
      // if (extent === null)
      //   extent = [this.margins.left, this.viewWidth - this.margins.right];

      // console.log("d3.event.type", d3.event.type);
      // console.log("d3.event.sourceEvent.type", d3.event.sourceEvent.type);
      // console.log('d3.event.selection', d3.event.selection);

      // if during brush or bursh event not trigger by brush but brush.move, do not calculate
      if (d3.event.sourceEvent.type === "brush") return;
      if (d3.event.selection === null) return;
      const d0 = d3.event.selection.map(xYearScaler.invert);
      const interval = d3.timeYear.every(4);
      const d1 = d0.map(interval.round);

      // If empty when rounded, use floor instead.
      if (d1[0] >= d1[1]) {
        d1[0] = interval.floor(d0[0]);
        d1[1] = interval.offset(d1[0]);
      }

      // console.log("d3.select(this)", d3.select(this));
      d3.select(this).call(brush.move, d1.map(xYearScaler));

      if (d3.event.type === "end") {
        const startYear = 0;
        const endYear = 0;
        //TODO: invoke visualization refresh
      }
    }

    yearVis.append("g").attr("class", "brush").call(brush);
  }
}
