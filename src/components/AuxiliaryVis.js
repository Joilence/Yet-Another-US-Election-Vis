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
        // console.log(this.dataset_elec)
        // console.log(data_points);
        // console.log(year);
        const margin = {
            top: 30, right: 30, bottom: 40, left: 60,
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

        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 8))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text(stateName + " state");
        // 7. d3's line generator
        var line = d3.line()
            .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
            .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line


        // // 9. Append the path, bind the data, and call the line generator 
        svg.append("path")
            .datum(data) // 10. Binds data to the line 
            .attr("class", "line") // Assign a class for styling 
            .attr("d", line) // 11. Calls the line generator 
            .attr("fill", "none")
            .style("stroke", "blue")

        // 12. Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale(d.y) })
            .attr("r", 2);

    }
    load_dataset(dataset, dataset_elec) {
        this.dataset = dataset;
        this.dataset_elec = dataset_elec
        this.time_range = [1998, 2018];
        this.render_auxiliary("new-york");
        this.render_auxiliary("ohio");
        this.render_auxiliary("texas");


    }

}
