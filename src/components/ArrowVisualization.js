import * as d3 from 'd3';

export default class ArrowVisualization {
    constructor() {
        this.svg = {};
        this.defs = {};
        this.arrow_color = { "republican": "red", "democratic": "blue" };
    }

    init_svg() {

        // this.svg = d3.select("#main-container")
        //         .append("svg").attr("width", window.innerWidth)
        //         .attr("height", window.innerHeight);
        // this.defs = this.svg.append("defs");
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

    init_arrowVis(svg, x1, y1, x2, y2) {
        this.svg = svg;
        
        this.init_svg();
        this.init_marker("republican");
        this.init_marker("democratic");
        // this.create_arrow("republican", 50 + 800 / 2, 50 + 500 / 2, 800 / 2, 500 / 2);
        // this.create_arrow("democratic", 800/2, 50 + 500/2, 50 + 800/2, 500/2);
    }

    create_arrow(party_name, x1, y1, x2, y2) {
       
        this.svg.append('line')
        .attr("marker-end", "url(#" + party_name + ")")
        .attr("x1",x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)
        .attr("stroke", this.arrow_color[party_name])
        .attr("stroke-width", 4)
    }
}

// init_arrowVis()
// create_arrow("republican", 50 + 800/2, 50 + 500/2, 800/2, 500/2);
// create_arrow("democratic", 800/2, 50 + 500/2, 50 + 800/2, 500/2);
