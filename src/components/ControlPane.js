import * as d3 from 'd3';

export default class ControlPane {
    ControlPane(){

    }
    controlPaneInit() {
        this.yearSelectionRender();
    }
    yearSelectionRender() {
        //TODO: dynamically load selected data
        d3.dsv('../data/eg_year_selection.csv', d => {
            // preprocessing data
            return {
                year: d.year,
                GDPGrwoth: d.GDPGrowthRate,
            }
        }).then(data => {
            console.log('raw data:', data);

            var xYear = d3.scaleTime()
                          .domain(d3.extent(data, d => d.year))
                          .range([0, yearSelectionWidth]);
            var yGDPGrowth = d3.scaleLinear()
                               .domain(d3.extent(data, d => d.GDPGrwoth))
                               .range([yearSelectionHeight, 0]);
            
            
            var yearVis = d3.select('#year-selection');

            // x axis for year
            var xAxisYear = d3.axisBottom(xYear);
            yearVis.append('g')
                .attr('class', 'x axis')
                .call(xAxisYear)

            // line generator
            var curve = d3.curveMonotoneX;
            var GDPGrowthLine = d3.line()
                .x(d => d.year)
                .y(d => d.GDPGrwoth)
                .curve(curve)
            
            // draw line
            yearVis.append('path')
                .datum(data)
                .attr('class', 'line line-gdp')
                .attr('d', GDPGrowthLine);
            
            // brush
            let brush = d3.brushX()
                .extent([[0, 0], [yearSelectionWidth, yearSelectionHeight]])
                .on('start brush end', () => {
                    let s = d3.event.selection;
                    if (s === null) s = [0, yearSelectionWidth];
                    //TODO: invoke visualization refresh
                });
            
            yearVis.append('g')
                .attr('class', 'brush')
                .call(brush)

            
        })
    }
}


