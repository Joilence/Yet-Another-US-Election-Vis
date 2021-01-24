import * as d3 from 'd3';
import { getOverallVotesShift, getGdpRate } from '../tools/data-manager';
export default class AuxiliaryVis {
    constructor() {
        this.dataset = [];
        this.time_range = [];
        this.dataset_elec = [];
        this.dataset_name = ['gdp-value', 'gdp-growth-rate'];
        this.data_option = 0;
        this.state_selection = [];
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
        const overall_gdp = getGdpRate(this.dataset, this.time_range)[0][stateName]
        const overall_shift = getOverallVotesShift(this.dataset_elec, this.time_range)[0][stateName].shift
        const shift_direction = getOverallVotesShift(this.dataset_elec, this.time_range)[0][stateName].direction
        var element = d3.select('.AuxiliaryGraph').node();
        // console.log(element.getBoundingClientRect().width)
        // console.log(element.getBoundingClientRect().height)

        let originalWidth = 300;
        let scaleRatio = element.getBoundingClientRect().width / (originalWidth);
        if (originalWidth < element.getBoundingClientRect().width) {
            originalWidth = element.getBoundingClientRect().width;
            scaleRatio = 0.9
        }

        // define SVG for auxiliary part
        const margin = {
            top: 60, right: 60, bottom: 60, left: 60,
        };
        const width = element.getBoundingClientRect().width - margin.left - margin.right;
        const height = element.getBoundingClientRect().width * 0.55 - margin.top - margin.bottom;
        // calculate scale ratio
        let svg = {}
        let xScale = {}
        let yScale = {}
        let yScale_elec = {}
        if (d3.select('#auxiliarygraphsvg' + stateName).empty()) {
            svg = d3.select(".AuxiliaryGraph").append("svg")
                .attr('id', 'auxiliarygraphsvg' + stateName)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .on("mouseover", function (event, d) {
                    d3.select(`#${stateName}`).attr('stroke-opacity', 1);
                })
                .on("mouseout", function (event, d) {
                    d3.select(`#${stateName}`).attr('stroke-opacity', 0);
                })
                .append('g')
                .attr('transform',
                    `scale(${scaleRatio}) translate(${margin.left},${margin.top})`);
            // X scale will use the index of our data
            xScale = d3.scaleLinear()
                .domain(d3.extent(year))
                .range([0, width]);
            // 3. Call the x axis in a group tag
            svg.append("g")
                .attr("class", "yearAxis")
                // .attr("transform", "translate("+margin.left+"," + height + ")")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale)) // Create an axis component with d3.axisBottom
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-90)");

            // 6. Y scale will use the randomly generate number 
            yScale = d3.scaleLinear()
                .domain(d3.extent(data_points)) // input 
                .range([height, 0]);

            svg.append("g")
                .attr("class", "gdpAxis")
                .call(d3.axisLeft(yScale).ticks(5)
                )
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
            // 6. Y scale with election data
            yScale_elec = d3.scaleLinear()
                .domain(d3.extent(data_points_elec_dem)) // input 
                .range([height, 0]);

            svg.append("g")
                .attr("class", "elecAxis")
                .attr("transform", "translate( " + width + ", 0 )")
                .call(d3.axisRight(yScale_elec).ticks(5)
                )
            // add title 
            svg.append("text")
                .attr("x", 10)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(stateName);

            svg.append("text")
                .attr("x", (width * 0.7))
                .attr("y", 0 - (margin.top / 3))
                .attr("text-anchor", "middle")
                .style("font-size", "7px")
                .text(() => {
                    return 'Overall'
                });

            svg.append("text")
                .attr("x", (width))
                .attr("y", 0 - (margin.top / 3))
                .attr("text-anchor", "middle")
                .style("font-size", "7px")
                .text(() => {
                    return 'Overall'
                });

            // add text label for the x axis
            svg.append("text")
                .attr("transform",
                    "translate(" + (width / 2) + " ," +
                    (height + 50) + ")")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("year");

            // add text label for the y axis right
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", width + 30)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("font-size", "12px")
                .style("text-anchor", "middle")
                .text("vote-percentage");
        } else {
            svg = d3.select('#auxiliarygraphsvg' + stateName).select("g")
        }
        this.update_svg(svg,width, height, margin,overall_gdp,axis_name,overall_shift,shift_direction,
            year, data_points, data_points_elec_dem, data_elec_rep,
            data_elec_dem, xScale, yScale,yScale_elec,data);
    }
    update_svg(svg, width, height, margin,overall_gdp,axis_name,overall_shift,shift_direction,
        year, data_points, data_points_elec_dem, data_elec_rep, data_elec_dem,
        xScale, yScale,yScale_elec,data){
        // update overal gdp
        const gdpOverallUpdate = svg.selectAll(".overallGDP").data([overall_gdp])
        gdpOverallUpdate
            .enter()
            .append("text")
            .attr("class", "overallGDP")
            .merge(gdpOverallUpdate)
            .attr("x", (width * 0.7))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("font-weight", "bold")
            .text((d) => {
                return d;
            })
            .style('fill', (d) => {
                if (d > 0) {
                    return 'green';
                }
                else return 'red';
            });
        // update gdp title
        const gdpTitleUpdate = svg.selectAll(".gdpTitle").data([axis_name])
        gdpTitleUpdate
            .enter()
            .append("text")
            .attr("class", "gdpTitle")
            .merge(gdpTitleUpdate)
            .attr("x", (width * 0.7))
            .attr("y", 0 - (margin.top / 5))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text((d) => {
                return d
            });


        // update text label for the y axis left
        const gdpAxisTitleUpdate = svg.selectAll(".gdpAxisTitle").data([axis_name])
        gdpAxisTitleUpdate
            .enter()
            .append("text")
            .attr("class", "gdpAxisTitle")
            .merge(gdpAxisTitleUpdate)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .text(axis_name);

        // update overal shift
        const shiftOverallUpdate = svg.selectAll(".overallShift").data([overall_shift])
        shiftOverallUpdate
            .enter()
            .append("text")
            .attr("class", "overallShift")
            .merge(shiftOverallUpdate)
            .attr("x", (width))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("font-weight", "bold")
            .text((d) => {
                return d
            })
            .style('fill', () => {
                if (shift_direction == 'dem') {
                    return 'blue';
                }
                else return 'red';
            });

        // update shift direction
        const shiftDirectionUpdate = svg.selectAll(".shiftDirection").data([shift_direction])
        shiftDirectionUpdate
            .enter()
            .append("text")
            .attr("class", "shiftDirection")
            .merge(shiftDirectionUpdate)
            .attr("x", (width))
            .attr("y", 0 - (margin.top / 5))
            .attr("text-anchor", "middle")
            .style("font-size", "7px")
            .text((d) => {
                return 'shift ' + d
            });

        // X scale will use the index of our data
        xScale = d3.scaleLinear()
            .domain(d3.extent(year))
            .range([0, width]);

        // 6. Y scale with gdp data
        yScale = d3.scaleLinear()
            .domain(d3.extent(data_points)) // input 
            .range([height, 0]);

        // 6. Y scale with election data
        yScale_elec = d3.scaleLinear()
            .domain(d3.extent(data_points_elec_dem)) // input 
            .range([height, 0]);

        // // Update year axis
        svg.selectAll(".yearAxis").call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)")

        // // Update GDP Axis
        svg.selectAll(".gdpAxis").call(d3.axisLeft(yScale).ticks(5));

        // // Update Elec Axis
        svg.selectAll(".elecAxis").call(d3.axisRight(yScale_elec).ticks(5));

        // // Update GDP data line
        const lineGPDUpdate = svg.selectAll(".lineGDP")
            .data([data], function (d) { return d.x });
        lineGPDUpdate
            .enter()
            .append("path")
            .attr("class", "lineGDP")
            .merge(lineGPDUpdate)
            .attr("d", d3.line()
                .x(function (d) { return xScale(d.x); })
                .y(function (d) { return yScale(d.y); })
                .curve(d3.curveMonotoneX)
            )
            .attr("fill", "none")
            .style("stroke", "green")

        // // Update GDP data dot
        const dotGDPUpdate = svg.selectAll(".dotGDP")
            .data(data);
        dotGDPUpdate.exit().remove();
        dotGDPUpdate
            .enter().append("circle")
            .attr("class", "dotGDP")
            .merge(dotGDPUpdate)
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale(d.y) })
            .attr("r", 2)
            .style('fill', 'green');

        // // Update Elec data line - democratic
        const lineElecDEUpdate = svg.selectAll(".lineElecDE")
            .data([data_elec_dem], function (d) { return d.x });
        lineElecDEUpdate
            .enter()
            .append("path")
            .attr("class", "lineElecDE")
            .merge(lineElecDEUpdate)
            .attr("d", d3.line()
                .x(function (d) { return xScale(d.x); })
                .y(function (d) { return yScale_elec(d.y); })
                .curve(d3.curveMonotoneX)
            )
            .attr("fill", "none")
            .style("stroke", "blue");

        // // Update Elec data dot - democratic
        const dotElecDEUpdate = svg.selectAll(".dotElecDE")
            .data(data_elec_dem);
        dotElecDEUpdate.exit().remove();
        dotElecDEUpdate
            .enter().append("circle")
            .attr("class", "dotElecDE")
            .merge(dotElecDEUpdate)
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale_elec(d.y) })
            .attr("r", 2)
            .style('fill', 'blue');

        // // Update Elec data line - republicant
        const lineElecREUpdate = svg.selectAll(".lineElecRE")
            .data([data_elec_rep], function (d) { return d.x });
        lineElecREUpdate
            .enter()
            .append("path")
            .attr("class", "lineElecRE")
            .merge(lineElecREUpdate)
            .attr("d", d3.line()
                .x(function (d) { return xScale(d.x); })
                .y(function (d) { return yScale_elec(d.y); })
                .curve(d3.curveMonotoneX)
            )
            .attr("fill", "none")
            .style("stroke", "red");

        // // Update Elec data dot - democratic
        const dotElecREUpdate = svg.selectAll(".dotElecRE")
            .data(data_elec_rep);
        dotElecREUpdate.exit().remove();
        dotElecREUpdate
            .enter().append("circle")
            .attr("class", "dotElecRE")
            .merge(dotElecREUpdate)
            .attr("cx", function (d) { return xScale(d.x) })
            .attr("cy", function (d) { return yScale_elec(d.y) })
            .attr("r", 2)
            .style('fill', 'red');

    }

    render_legend(axis_name, svgName, legendName) {
        // define SVG for auxiliary part
        const margin = {
            top: 10, right: 10, bottom: 0, left: 10,
        };
        const width = 300 - margin.left - margin.right;
        const height = 100 - margin.top - margin.bottom;
        let svg = {}
        if (d3.select('#' + legendName).empty()) {
            svg = d3.select("." + svgName).append("svg")
                .attr("id", legendName)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform',
                    `translate(${margin.left},${margin.top})`);
        } else {
            svg = d3.select('#' + legendName).select("g");
        }

        // Add legend for the graph
        var legend_keys = [axis_name, "democratic-percentages", "republicant-percentages"]
        var legend_colors = ["green", "blue", "red"]

        const legendSummaryTextUpdate = svg.selectAll(".legendSummaryText").data(legend_keys)
        legendSummaryTextUpdate
            .enter()
            .append("text")
            .attr("class", "legendSummaryText")
            .merge(legendSummaryTextUpdate)
            .text(function (d) { return d; })
            .style("font-size", "12px")
            .attr("transform", function (d, i) {
                return "translate(" + 30 + "," + ((i + 1) * 20) + ")";
            });

        const legendSummaryRectUpdate = svg.selectAll(".legendSummaryRect").data(legend_keys)
        legendSummaryRectUpdate
            .enter()
            .append("rect")
            .attr("class", "legendSummaryRect")
            .merge(legendSummaryRectUpdate)
            .attr("fill", function (d, i) { return legend_colors[i] })
            .attr("width", 10).attr("height", 10)
            .attr("transform", function (d, i) {
                return "translate(" + 9 + "," + ((i + 0.6) * 20) + ")";
            });

    }
    // render auxiliary graphs
    render_auxiliary(data_option, time_range, selected_states) {
        this.render_legend(data_option, 'AuxiliaryGraph', 'legendauxiliarygraphsvg');
        this.time_range = time_range;
        this.data_option = this.dataset_name.indexOf(data_option);
        this.state_selection.forEach(ele => {
            if (selected_states.filter(ele1 => ele1 == ele).length < 1){
                d3.select('#auxiliarygraphsvg' + ele).remove();
            }
        })
        selected_states.forEach(element => {
            this.render(data_option, element);
        });
        this.state_selection = selected_states;
        console.log(this.state_selection)
        console.log(this.state_selection.length)
        if(this.state_selection.length < 1){
            d3.select('#summarygraphsvg').remove();
        }else {
            this.render_summary(data_option, selected_states);
        }
        
    }

    // load datasets to the component
    load_dataset(dataset, dataset_elec) {
        if (dataset === undefined || dataset_elec === undefined) {
            // console.log('dataset:', dataset);
            // console.log('dataset_elect:', dataset_elec);
        }
        this.dataset = dataset;
        this.dataset_elec = dataset_elec;
    }
    preprocess_data(stateName) {

        let data_points = [];
        let year = [];
        let selectedState = this.dataset.filter(obj => {
            return obj.state === stateName
        });
        selectedState = selectedState[0]
        for (let va in selectedState) {
            if (parseInt(va) >= this.time_range[0] && parseInt(va) <= this.time_range[1]) {
                const value = selectedState[va].replace(/[\(\)']+/g, '')
                data_points.push(parseFloat(value.split(',')[this.data_option]));
                year.push(parseInt(va));
            }
        }
        let selectedState_elec = this.dataset_elec.filter(obj => {
            return obj.state === stateName
        });
        let data_points_elec_dem = [];
        for (let va in selectedState_elec) {
            if (parseInt(selectedState_elec[va].year) >= this.time_range[0] && parseInt(selectedState_elec[va].year) <= this.time_range[1]) {
                let value = parseFloat(selectedState_elec[va].dem_percent)
                let value_rep = parseFloat(selectedState_elec[va].rep_percent)
                data_points_elec_dem.push(value);
                data_points_elec_dem.push(value_rep);
            }
        }
        return [data_points, year, data_points_elec_dem]

    }
    render_summary(axis_name, stateName) {

        this.render_legend(axis_name, 'SummaryGraph', 'legendsummarygraphsvg');
        // load data
        const len = this.time_range[1] - this.time_range[0] + 1
        let data_points = new Array(len).fill(0);
        let year = new Array(len).fill(0);
        let data = [];

        let data_points_elec_dem = new Array((((len - 1) / 4) + 1) * 2).fill(0);
        let data_elec_rep = [];
        let data_elec_dem = [];

        let overall_gdp = 0;
        let overall_shift = 0;
        let shift_direction = [];
        stateName.forEach(ele => {
            let [arr1, arr2, arr3] = this.preprocess_data(ele);
            data_points = data_points.map(function (num, idx) {
                return num + arr1[idx];
            });
            year = arr2;
            data_points_elec_dem = data_points_elec_dem.map(function (num, idx) {
                return num + arr3[idx];
            });
            // Calculate overal shift and gdp
            overall_gdp = overall_gdp + getGdpRate(this.dataset, this.time_range)[0][ele]
            overall_shift = overall_shift + parseFloat(getOverallVotesShift(this.dataset_elec, this.time_range)[0][ele].shift)
            shift_direction.push(getOverallVotesShift(this.dataset_elec, this.time_range)[0][ele].direction)

        })
        data_points = data_points.map(function (num, idx) {
            return num / 3;
        });
        data_points_elec_dem = data_points_elec_dem.map(function (num, idx) {
            return num / 3;
        });
        for (let va in data_points) {
            data.push({ 'y': data_points[va], 'x': year[va] })

        }
        for (let va = 0; va < data_points_elec_dem.length / 2; va++) {
            data_elec_dem.push({ 'y': data_points_elec_dem[va * 2], 'x': year[va * 4] })
            data_elec_rep.push({ 'y': data_points_elec_dem[va * 2 + 1], 'x': year[va * 4] })
        }
        overall_gdp = Math.round(overall_gdp / 3 * 100) / 100
        overall_shift = Math.round(overall_shift / 3 * 100) / 100
        let count_dem = 0
        shift_direction.forEach(ele => {
            if (ele == 'dem') {
                count_dem = count_dem + 1;
            }
        })
        if (count_dem > data_points_elec_dem.length / 4) {
            shift_direction = 'dem'
        }
        else {
            shift_direction = 'rep'
        }
        // console.log(data_points_elec_dem)

        var element = d3.select('.SummaryGraph').node();
        // console.log(element.getBoundingClientRect())
        // console.log(element.getBoundingClientRect().height)

        let originalWidth = 300;
        let scaleRatio = element.getBoundingClientRect().width / (originalWidth);
        if (originalWidth < element.getBoundingClientRect().width) {
            originalWidth = element.getBoundingClientRect().width;
            scaleRatio = 0.9
        }

        // define SVG for auxiliary part
        const margin = {
            top: 60, right: 60, bottom: 60, left: 60,
        };
        const width = element.getBoundingClientRect().width - margin.left - margin.right;
        const height = element.getBoundingClientRect().width * 0.55 - margin.top - margin.bottom;
        // calculate scale ratio

        let svg = {}
        let xScale = {}
        let yScale = {}
        let yScale_elec = {}
        let line = {}
        // console.log(d3.select('#summarygraphsvg'))
        if (d3.select('#summarygraphsvg').empty()) {
            svg = d3.select(".SummaryGraph").append("svg")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .attr('id', 'summarygraphsvg')
                // .attr('transform', 'translate(0,-30)')
                .append('g')
                .attr('transform',
                    `scale(${scaleRatio}) translate(${margin.left},${margin.top})`);

            // X scale will use the index of our data
            xScale = d3.scaleLinear()
                .domain(d3.extent(year))
                .range([0, width]);
            // 3. Call the x axis in a group tag
            svg.append("g")
                .attr("class", "yearAxis")
                // .attr("transform", "translate("+margin.left+"," + height + ")")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale)) // Create an axis component with d3.axisBottom
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-90)");

            // 6. Y scale will use the randomly generate number 
            yScale = d3.scaleLinear()
                .domain(d3.extent(data_points)) // input 
                .range([height, 0]);

            svg.append("g")
                .attr("class", "gdpAxis")
                .call(d3.axisLeft(yScale).ticks(5)
                )
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
            // 6. Y scale with election data
            yScale_elec = d3.scaleLinear()
                .domain(d3.extent(data_points_elec_dem)) // input 
                .range([height, 0]);

            svg.append("g")
                .attr("class", "elecAxis")
                .attr("transform", "translate( " + width + ", 0 )")
                .call(d3.axisRight(yScale_elec).ticks(5)
                )
            // add title 
            svg.append("text")
                .attr("x", 10)
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("All states");

            svg.append("text")
                .attr("x", (width * 0.7))
                .attr("y", 0 - (margin.top / 3))
                .attr("text-anchor", "middle")
                .style("font-size", "7px")
                .text(() => {
                    return 'Overall'
                });

            svg.append("text")
                .attr("x", (width))
                .attr("y", 0 - (margin.top / 3))
                .attr("text-anchor", "middle")
                .style("font-size", "7px")
                .text(() => {
                    return 'Overall'
                });

            // add text label for the x axis
            svg.append("text")
                .attr("transform",
                    "translate(" + (width / 2) + " ," +
                    (height + 50) + ")")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("year");

            // add text label for the y axis right
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", width + 30)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("font-size", "12px")
                .style("text-anchor", "middle")
                .text("vote-percentage");
        } else {
            svg = d3.select('#summarygraphsvg').select("g")
        }
        this.update_svg(svg,width, height, margin,overall_gdp,axis_name,overall_shift,shift_direction,
            year, data_points, data_points_elec_dem, data_elec_rep,
            data_elec_dem, xScale, yScale,yScale_elec,data);
    }

}
