import * as d3 from 'd3';
import * as $ from 'jquery';

export function loadDatasets() {
    let datasets = {};
    const filenames = ['election_data', 'gdp_data'];

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

export function getGdpRate(gpd_data, yearRange) {
    /* gpd_data: d3.csv(file)*/
    
    let states_all_years = {};
    let states_overall_shift = {};
    let [beginYear, endYear] = yearRange
    

    // convert data into dictionary format
    gpd_data.forEach(function (row) {
        states_all_years[row.state] = [];

        // extract rate from beginYear to endYear
        for (let i=beginYear; i<=endYear; i++) {
            states_all_years[row.state].push(parseFloat(row[i].replace(" ", "").replace("(", "").replace(")", "").split(",")[1]));
        }

        // calculate overall growth rate
        let begin_amount_str = row[parseInt(beginYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let end_amount_str = row[parseInt(endYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let [begin_amount, end_amount] = [parseFloat(begin_amount_str), parseFloat(end_amount_str)];
        let overall_growth = parseFloat(((end_amount - begin_amount) / begin_amount).toFixed(4));

        states_overall_shift[row.state] = overall_growth;
    });

    return [states_overall_shift, states_all_years];
}

export function getOverallVotesShift(election_data, yearRange) {
    /* election_data: d3.csv(file)*/
    
    let states_all_years = {};
    let states_overall_shift = {};
    let [beginYear, endYear] = yearRange;
    
    // convert data into dictionary format
    election_data.forEach(function (row) {
        if (!(row.state in states_all_years)) {
            states_all_years[row.state] = {"dem":[], "rep":[]};
        }
        
        for (let i=beginYear; i<=endYear; i=i+4) {
            if (parseInt(row.year)==i) {
                states_all_years[row.state]["dem"].push(parseFloat(row.dem_percent));
                states_all_years[row.state]["rep"].push(parseFloat(row.rep_percent));
            }
        }
    });

    // calculate shift rate
    for (let state in states_all_years) {
        if (!(state in states_overall_shift)) {
            states_overall_shift[state] = {"direction":"", "shift":0.0}
        }
        
        let dem_precent = states_all_years[state]["dem"];

        let dem_change = parseFloat(dem_precent[dem_precent.length-1]) - parseFloat(dem_precent[0]);
        states_overall_shift[state]["shift"] = Math.abs(dem_change).toFixed(4);

        if (dem_change >= 0) {
            states_overall_shift[state]["direction"] = "dem";
        } else {
            states_overall_shift[state]["direction"] = "rep";
        }    
    }

    return [states_overall_shift, states_all_years];
}