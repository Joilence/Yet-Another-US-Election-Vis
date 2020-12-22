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

export function getGDPRate(gpd_data, beginYear, endYear) {
    let states_gdp = {};

    // convert data into dictionary format
    gpd_data.forEach(function (row) {
        states_gdp[row.state] = {"all_rate": [], "overall_growth":0.0}

        // extract rate from beginYear to endYear
        for (let i=beginYear; i<=endYear; i++) {
            states_gdp[row.state]["all_rate"].push(parseFloat(row[i].replace(" ", "").replace("(", "").replace(")", "").split(",")[1]));
        }

        // calculate overall growth rate
        let begin_amount_str = row[beginYear].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let end_amount_str = row[endYear].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];

        let [begin_amount, end_amount] = [parseFloat(begin_amount_str), parseFloat(end_amount_str)];
       
        let overall_growth = parseFloat(((end_amount - begin_amount) / begin_amount).toFixed(4));

        states_gdp[row.state]["overall_growth"] = overall_growth;

    });

    return states_gdp;

}

export function getOverallShift(election_data, beginYear, endYear) {
    let states_election = {};
    
    // convert data into dictionary format
    election_data.forEach(function (row) {
        if (row.year == beginYear) {
            if (!(row.state in states_election)) {
                states_election[row.state] = {"begin":{}, "end":{}, "direction":"", "shift":0}
            }
            states_election[row.state]["begin"] = {"rep_percent":row.rep_percent, "dem_percent":row.dem_percent}
            
        } else if (row.year == endYear) {
            if (!(row.state in states_election)) {
                states_election[row.state] = {"begin":{}, "end":{}}
            }
            states_election[row.state]["end"] = {"rep_percent":row.rep_percent, "dem_percent":row.dem_percent}
        }
    });

    // calculate shift rate
    for (let state in states_election) {
        let state_data = states_election[state];
        let dem_change = state_data["end"]["dem_percent"] - state_data["begin"]["dem_percent"];
        if (dem_change >= 0) {
            state_data["direction"] = "dem";
        } else {
            state_data["direction"] = "rep";
        }

        state_data["shift"] = Math.abs(dem_change).toFixed(4);
        
        delete state_data["begin"];
        delete state_data["end"];
        states_election[state] = state_data;
    }

    return states_election;
}
