// import * as d3 from 'd3';

export default class ArrowVisualization {
    constructor() {
        this.svg = {};
        this.defs = {};
        this.arrow_color = { "rep": "red", "dem": "blue" };
        this.arrow_max_length = 50;
        this.time_range = [];
    }

    init_marker(party_name) {
        // this.svg = d3.select("#main-container")
        //     .append("svg").attr("width", window.innerWidth)
        //     .attr("height", window.innerHeight);
        this.defs = this.svg.append("defs").append("marker")
            .attr("id", party_name)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 3)
            .attr("orient", "auto")
            .style("fill", this.arrow_color[party_name])
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class", "arrowHead");
    }

    init_arrowVis() {
        this.init_marker("rep");
        this.init_marker("dem");
    }

    create_arrow(party_name, x, y, percentage) {
        /* (x,y) is the coordination of the state */
        let x2;
        if (party_name == "rep") {// right
            x2 = x + percentage * this.arrow_max_length;
        } else if (party_name == "dem") { //left
            x2 = x - percentage * this.arrow_max_length;
        }   
        
        this.svg.append('line')
                .attr("marker-end", "url(#" + party_name + ")")
                .attr("x1",x)
                .attr("x2", x2)
                .attr("y1", y)
                .attr("y2", y - percentage * this.arrow_max_length)
                .attr("stroke", this.arrow_color[party_name])
                .attr("stroke-width", 4)
                .attr("class", "arrow")
    }
}