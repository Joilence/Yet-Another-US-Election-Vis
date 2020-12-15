import * as d3 from 'd3';


export default class ArrowVisualization {
    init_svg() {
        const arrow_color = {"republican":"red", "democratic": "blue"};
        svg = d3.select("#main-container")
                .append("svg").attr("width", window.innerWidth)
                .attr("height", window.innerHeight);
        defs = svg.append("defs");
    }

    init_marker(party_name) {
        defs.append("marker")
            .attr({
                "id": party_name,
                "viewBox": "0 -5 10 10",
                "refX": 5,
                "refY": 0,
                "markerWidth": 3,
                "markerHeight": 3,
                "orient": "auto",
            })
            .style("fill", arrow_color[party_name])
            .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class","arrowHead")
    }

    init_arrowVis() {
        init_svg();
        init_marker("republican");
        init_marker("democratic");
    }

    create_arrow(party_name, x1, y1, x2, y2) {
        svg.append('line').attr({
            "marker-end": "url(#" + party_name + ")",
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "stroke": arrow_color[party_name],
            "stroke-width": 4
        });	
    }
}

// init_arrowVis()
// create_arrow("republican", 50 + 800/2, 50 + 500/2, 800/2, 500/2);
// create_arrow("democratic", 800/2, 50 + 500/2, 50 + 800/2, 500/2);
