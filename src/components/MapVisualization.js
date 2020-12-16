import * as d3 from 'd3';
import ArrowVisualization from './ArrowVisualization';
// import * as $ from 'jquery';

export default class MapVisualzation {
    constructor() {
        this.arrowVis = new ArrowVisualization();
        this.usaMap = {}
    }
    map_render() {
        const width = 900;
        const height = 600;
        const svg = d3.select(".MapVisualization").append("svg")
            .attr("width", width)
            .attr("height", height);

        const projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2]) // translate to center of screen
            .scale([1000]); // scale things down so see entire US

        const path = d3.geoPath().projection(projection);
        d3.json("https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json")
            .then((uState) => {
                console.log(uState.features)
                this.usaMap = svg.selectAll('path')
                    .data(uState.features)
                    .enter()
                    .append('path')
                    .attr("d", path)
                    .attr('id', function (d){return d.properties.name})
                    .attr("class", 'state')
                    .attr("fill", "grey");
                console.log(this.usaMap)
                this.arrowVis.init_arrowVis(svg);
                this.arrowVis.create_arrow("republican", 50 + 400, 50 + 250, 400, 250);
                this.arrowVis.create_arrow("republican", 30 + 160, 50 + 250, 160, 250);
                this.arrowVis.create_arrow("democratic", 300, 50 + 250, 50 + 300, 250);
                this.arrowVis.create_arrow("democratic", 100, 30 + 250, 30 + 100, 250);
                return svg;
            })

    }

}
