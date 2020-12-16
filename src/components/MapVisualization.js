import * as d3 from 'd3';
import ArrowVisualization from './ArrowVisualization';
// import * as $ from 'jquery';

export default class MapVisualzation {
    constructor() {
        this.arrowVis = new ArrowVisualization();
        this.usaMap = {}
        this.dataset = []
    }
    convert_growthRate(stateName, first_year, second_year) {
        let data_points = [];
        let first_point = 0;
        let second_point = 0;

        let selectedState = this.dataset.filter(obj => {
            return obj.state === stateName
        });
        selectedState = selectedState[0]
        if (selectedState == undefined){
            console.log(stateName);
            return 0;
        }
        for (let va in selectedState) {
            if (parseInt(va) === first_year) {
                const value = selectedState[va].replace(/[\(\)']+/g, '')
                first_point = parseFloat(value.split(',')[0]);
            }
            else if (parseInt(va) === second_year) {
                const value = selectedState[va].replace(/[\(\)']+/g, '')
                second_point = parseFloat(value.split(',')[0]);
            }
        }
        
        return (second_point - first_point) / first_point
    }
    map_render(dataset) {
        this.dataset = dataset;
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
                let growth_arr = []
                uState.features.forEach(element => {
                    let name = element.properties.name.toLowerCase();
                    if (name.split(' ').length > 1) {
                        name = name.split(' ')
                        name = name.join('-')
                    }
                    growth_arr.push(this.convert_growthRate(name, 1998, 2018));

            });
        const colorScale = d3.scaleLinear()
            .domain(d3.extent(growth_arr))
            .range(['white', 'green']);
        
        this.usaMap = svg.selectAll('path')
            .data(uState.features)
            .enter()
            .append('path')
            .attr("d", path)
            .attr('id', function (d) { return d.properties.name })
            .attr("class", 'state')
            .attr("fill", function(d,i){
                return colorScale(growth_arr[i])
            });
        // console.log(d3.select('#ohio'))
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
