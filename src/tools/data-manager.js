import * as d3 from 'd3';
import * as $ from 'jquery';

export function loadDatasets() {
    let datasets = {};
    const filenames = ['1976-2016-president_DP', 'gdp_data', '1976-2016-president_DP_Percentage', '1976-2016-president_DP2.0'];

    for (let i = 0; i < filenames.length; i++) {
        d3.csv(`/datasets/${filenames[i]}.csv`).then((data) => {
            datasets[filenames[i]] = data;
        });
    }
    
    return datasets;
}

export function getSymbolDataName() {
    return $("#symbol-data-selection input:radio:checked").val();
}

export function getRegionalDataName() {
    return $("#regional-data-selection input:radio:checked").val();
}

export function getYearRange() {
    // console.log('get range:', $("#year-selection").prop('range'));
    return $("#year-selection").prop('range');
}

export function getDataFilename(dataname) {
    var dataFilesDict = {
        'gdp': 'gdp_data.csv',
        'gdp-growth-rate': 'gdp_growth_rate.csv',
    }
    return dataFilesDict(dataname)
}