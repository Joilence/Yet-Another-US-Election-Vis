import * as d3 from 'd3';
import { getRegionalDataName } from '../tools/data-manager';
export default class AuxiliaryVis {
    constructor() {
        this.dataset = [];
        this.time_range = [];
        this.dataset_elec = [];
        this.dataset_name = ['gdp-value', 'gdp-growth-rate'];
        this.data_option = 0;
    }
    render(axis_name, stateName) {
        // load data
        let data_points = [];
        let year = [];
        let data = [];
        let selectedState = this.dataset.filter(obj => {
            return obj.state === stateName
        });
        selectedState = selectedState[0]
        for (let va in selectedState) {
            if (parseInt(va) >= this.time_range[0] && parseInt(va) <= this.time_range[1]) {
                const value = selectedState[va].replace(/[\(\)']+/g, '')
                data_points.push(parseFloat(value.split(',')[this.data_option]));
                year.push(parseInt(va));
                data.push({ 'y': parseFloat(value.split(',')[this.data_option]), 'x': parseInt(va) })
            }
        }
        let selectedState_elec = this.dataset_elec.filter(obj => {
            return obj.state === stateName
        });

        let data_elec_dem = [];
        let data_points_elec_dem = [];
        let data_elec_rep = [];
        for (let va in selectedState_elec) {
            if (parseInt(selectedState_elec[va].year) >= this.time_range[0] && parseInt(selectedState_elec[va].year) <= this.time_range[1]) {
                let value = parseFloat(selectedState_elec[va].dem_percent)
                let value_rep = parseFloat(selectedState_elec[va].rep_percent)
                data_points_elec_dem.push(value);
                data_points_elec_dem.push(value_rep);
                data_elec_dem.push({ 'y': value, 'x': parseInt(selectedState_elec[va].year) })
                data_elec_rep.push({ 'y': value_rep, 'x': parseInt(selectedState_elec[va].year) })
            }
        }
        // console.log(data_elec_dem)
        // console.log(data_elec_rep)
        // console.log(data_points);
        // console.log(year);

        // Calculate overal shift and gdp
        const overall_gdp = Math.round(((data_points[data_points.length - 1] - data_points[0]) / data_points[0]) * 100) / 100
        const overall_shift = Math.round(((data_points_elec_dem[data_points_elec_dem.length - 2] - data_points_elec_dem[0]) / data_points_elec_dem[0]) * 100) / 100

        // define SVG for auxiliary part
        const margin = {
            top: 60, right: 60, bottom: 60, left: 60,
        };
        const width = 300 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        const svg = d3.select(".AuxiliaryGraph").append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                `translate(${margin.left},${margin.top})`);
        // X scale will use the index of our data
        const xScale = d3.scaleLinear()
            .domain(d3.extent(year))
            .range([0, width]);
        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            // .attr("transform", "translate("+margin.left+"," + height + ")")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)) // Create an axis component with d3.axisBottom
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");

        // 6. Y scale will use the randomly generate number 
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data_points)) // input 
            .range([height, 0]);

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
        const yScale_elec = d3.scaleLinear()
            .domain(d3.extent(data_points_elec_dem)) // input 
            .range([height, 0]);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate( " + width + ", 0 )")
            .call(d3.axisRight(yScale_elec)
            )

        // add title 
        svg.append("text")
            .attr("x", (width / 4))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(stateName + " state");

        // add overal gdp
        svg.append("text")
            .attr("x", (width * 0.7))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("font-weight", "bold")
            .text(() => {
                return overall_gdp
            })
            .style('fill', () => {
                if (overall_gdp > 0) {
                    return 'green';
                }
                else return 'red';
            });
        svg.append("text")
            .attr("x", (width * 0.7))
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text(() => {
                return 'Overall'
            });
        svg.append("text")
            .attr("x", (width * 0.7))
            .attr("y", 0 - (margin.top / 5))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text(() => {
                return axis_name
            });

        // add overal shift
        svg.append("text")
            .attr("x", (width))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("font-weight", "bold")
            .text(() => {
                return overall_shift
            })
            .style('fill', () => {
                if (overall_shift > 0) {
                    return 'green';
                }
                else return 'red';
            });
        svg.append("text")
            .attr("x", (width))
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text(() => {
                return 'Overall'
            });
        svg.append("text")
            .attr("x", (width))
            .attr("y", 0 - (margin.top / 5))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text(() => {
                return 'shift'
            });

        // add text label for the x axis
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + 50) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("year");

        // add text label for the y axis left
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .text(axis_name);

        // add text label for the y axis right
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + 30)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .text("vote-percentage");

        // d3's line generator for GPD data
        var line = d3.line()
            .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
            .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // Append the path for GDP data
        svg.append("path")
            .datum(data) // 10. Binds data to the line 
            .attr("class", "line") // Assign a class for styling 
            .attr("d", line) // 11. Calls the line generator 
            .attr("fill", "none")
            .style("stroke", "green")

        // 12. Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale(d.y) })
            .attr("r", 2)
            .style('fill', 'green');


        // line generator for election data
        var line_elec = d3.line()
            .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
            .y(function (d) { return yScale_elec(d.y); }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // Append the path for elec data democratic
        svg.append("path")
            .datum(data_elec_dem) // 10. Binds data to the line 
            .attr("class", "line2") // Assign a class for styling 
            .attr("d", line_elec) // 11. Calls the line generator 
            .attr("fill", "none")
            .style("stroke", "blue")

        // 12. Appends a circle for each datapoint 
        svg.selectAll(".dot2")
            .data(data_elec_dem)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot2") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale_elec(d.y) })
            .attr("r", 2)
            .style('fill', 'blue');

        // Append the path for elec data republicant
        svg.append("path")
            .datum(data_elec_rep) // 10. Binds data to the line 
            .attr("class", "line3") // Assign a class for styling 
            .attr("d", line_elec) // 11. Calls the line generator 
            .attr("fill", "none")
            .style("stroke", "red")

        // 12. Appends a circle for each datapoint 
        svg.selectAll(".dot3")
            .data(data_elec_rep)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot3") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale_elec(d.y) })
            .attr("r", 2)
            .style('fill', 'red');


    }
    render_legend(axis_name) {
        // define SVG for auxiliary part
        const margin = {
            top: 10, right: 10, bottom: 0, left: 10,
        };
        const width = 300 - margin.left - margin.right;
        const height = 60 - margin.top - margin.bottom;
        const svg = d3.select(".AuxiliaryGraphLegend").append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                `translate(${margin.left},${margin.top})`);
        // Add legend for the graph
        var legend_keys = [axis_name, "Democratic Pers", "Republicant Pers"]
        var legend_colors = ["green", "blue", "red"]

        var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
            .enter().append("g")
            .attr("class", "lineLegend")
            .attr("transform", function (d, i) {
                return "translate(" + 0 + "," + (i * 20) + ")";
            });

        lineLegend.append("text").text(function (d) { return d; })
            .style("font-size", "12px")
            .attr("transform", "translate(15,9)"); //align texts with boxes

        lineLegend.append("rect")
            .attr("fill", function (d, i) { return legend_colors[i] })
            .attr("width", 10).attr("height", 10);

    }
    // render auxiliary graphs
    render_auxiliary(data_option, time_range, selected_states) {
        d3.select(".AuxiliaryGraph").html('');
        d3.select(".AuxiliaryGraphLegend").html('');
        this.render_legend(data_option);
        this.time_range = time_range;
        this.data_option = this.dataset_name.indexOf(data_option);
        selected_states.forEach(element => {
            this.render(data_option, element);
        });
        // this.render(data_option, "new-york");
        // this.render(data_option, "ohio");
        // this.render(data_option, "texas");
    }
    // load datasets to the component
    load_dataset(dataset, dataset_elec) {
        if (dataset === undefined || dataset_elec === undefined) {
            console.log('dataset:', dataset);
            console.log('dataset_elect:', dataset_elec);
        }
        this.dataset = dataset;
        this.dataset_elec = dataset_elec;
    }

}
