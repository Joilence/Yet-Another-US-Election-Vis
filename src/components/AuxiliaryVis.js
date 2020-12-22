import * as d3 from 'd3';
export default class AuxiliaryVis {
    constructor() {
        this.dataset = [];
        this.time_range = [];
        this.dataset_elec = [];
    }
    render_auxiliary(stateName) {
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
                data_points.push(parseFloat(value.split(',')[0]));
                year.push(parseInt(va));
                data.push({ 'y': parseFloat(value.split(',')[0]), 'x': parseInt(va) })
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
        console.log(data_elec_dem)
        console.log(data_elec_rep)
        // console.log(data_points);
        // console.log(year);
        const margin = {
            top: 80, right: 60, bottom: 60, left: 60,
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
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 8))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(stateName + " state");

        // add text label for the x axis
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Year");

        // add text label for the y axis left
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .text("GDP");

        // add text label for the y axis right
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + 30)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .text("Vote percentage");

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

        var legend_keys = ["GDP", "Democratic Pers", "Republicant Pers"]
        var legend_colors = ["green", "blue", "red"]

        var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
            .enter().append("g")
            .attr("class", "lineLegend")
            .attr("transform", function (d, i) {
                return "translate(" + width * 3/4 + "," + -((i+2) * 20) + ")";
            });

        lineLegend.append("text").text(function (d) { return d; })
            .style("font-size", "12px")
            .attr("transform", "translate(15,9)"); //align texts with boxes

        lineLegend.append("rect")
            .attr("fill", function (d, i) { return legend_colors[i] })
            .attr("width", 10).attr("height", 10);
    }
    load_dataset(dataset, dataset_elec, time_range) {
        this.dataset = dataset;
        this.dataset_elec = dataset_elec
        this.time_range = time_range;
        this.render_auxiliary("new-york");
        this.render_auxiliary("ohio");
        this.render_auxiliary("texas");


    }

}
