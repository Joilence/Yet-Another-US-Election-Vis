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

    console.log(datasets[election_data])

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

export function getSelectedStates() {
    return $("#map-visualization").prop('states');
}

export function getDataFilename(dataname) {
    var dataFilesDict = {
        'gdp': 'gdp_data.csv',
        'gdp-growth-rate': 'gdp_growth_rate.csv',
    }
    return dataFilesDict(dataname)
}

export function getGdpRate(gdp_data, yearRange) {
    /* gdp_data: d3.csv(file)*/
    
    let states_all_years = {};
    let states_overall_shift = {};
    let [beginYear, endYear] = yearRange
    

    // convert data into dictionary format
    gdp_data.forEach(function (row) {
        states_all_years[row.state] = [];

        // extract rate from beginYear to endYear
        for (let i=beginYear; i<=endYear; i++) {
            states_all_years[row.state].push(parseFloat(row[i].replace(" ", "").replace("(", "").replace(")", "").split(",")[1]));
        }

        // calculate overall growth rate
        let begin_amount_str = row[parseInt(beginYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let end_amount_str = row[parseInt(endYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let [begin_amount, end_amount] = [parseFloat(begin_amount_str), parseFloat(end_amount_str)];
        let overall_growth_rate = parseFloat(((end_amount - begin_amount) / begin_amount).toFixed(4));

        states_overall_shift[row.state] = overall_growth_rate;
    });

    return [states_overall_shift, states_all_years];
}

export function getGdpValue(gdp_data, yearRange) {
    let states_all_years = {};
    let states_overall_shift = {};
    let [beginYear, endYear] = yearRange
    

    // convert data into dictionary format
    gdp_data.forEach(function (row) {
        states_all_years[row.state] = [];

        // extract rate from beginYear to endYear
        for (let i=beginYear; i<=endYear; i++) {
            states_all_years[row.state].push(parseFloat(row[i].replace(" ", "").replace("(", "").replace(")", "").split(",")[1]));
        }

        // calculate overall growth rate
        let begin_amount_str = row[parseInt(beginYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let end_amount_str = row[parseInt(endYear)].replace(" ", "").replace("(", "").replace(")", "").split(",")[0];
        let [begin_amount, end_amount] = [parseFloat(begin_amount_str), parseFloat(end_amount_str)];
        let overall_growth_value = parseFloat((end_amount - begin_amount).toFixed(4));

        states_overall_shift[row.state] = overall_growth_value;
    });

    return [states_overall_shift, states_all_years];
}

export function getOverallVotesShift(election_data, yearRange) {
    /* election_data: d3.csv(file)*/
    
    let states_all_years = {};
    let states_overall_shift = {};
    let [beginYear, endYear] = yearRange;
    console.log("+++")
    console.log(yearRange, parseInt(beginYear), parseInt(endYear))

    // convert data into dictionary format
    election_data.forEach(function (row) {
        if (!(row.state in states_all_years)) {
            states_all_years[row.state] = {"dem":[], "rep":[], "vote-amount":[], "elect-result":[]};
        }

        if (row.state == "oregon") {
            console.log("------")
            console.log(yearRange, parseInt(beginYear), parseInt(endYear))
        }
        
        
        for (let i=parseInt(beginYear); i<=parseInt(endYear); i=i+4) {
            if (parseInt(row.year)==i) {
                states_all_years[row.state]["dem"].push(parseFloat(row.dem_percent));
                states_all_years[row.state]["rep"].push(parseFloat(row.rep_percent));
                states_all_years[row.state]["vote-amount"].push(parseInt(row.total_vote));




                
                // decide the election result
                if (parseInt(row.year)==parseInt(beginYear) || parseInt(row.year)==parseInt(endYear)) {
                    if (parseInt(row.dem_vote) > parseInt(row.rep_vote)) {
                        if (row.state == "oregon") {
                            console.log(row.year, "dem")
                        }
                        states_all_years[row.state]["elect-result"].push("dem");
                    } else {
                        if (row.state == "oregon") {
                            console.log(row.year, "rep")
                        }
                        states_all_years[row.state]["elect-result"].push("rep");
                    }
                }
            }
        }


    });

    
    for (let state in states_all_years) {
        if (!(state in states_overall_shift)) {
            states_overall_shift[state] = {"direction":"", "shift":0.0, "vote-amount":0}
        }

        // calculate average voting amount among these years
        let average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        states_overall_shift[state]["avg-vote-amount"] = average(states_all_years[state]["vote-amount"]).toFixed(0);

        // get the election result changing
        // if (state == "oregon") {
        //     console.log(states_all_years[state]["elect-result"])
        // }

        states_overall_shift[state]["elect-result-change"] = states_all_years[state]["elect-result"][0] 
                                                            + "-" 
                                                            + states_all_years[state]["elect-result"][states_all_years[state]["elect-result"].length-1];

        
        // calculate the shift rate, dem_rate + rep_rate = 1.0, abs(change) = the shift of the winner
        let dem_precent = states_all_years[state]["dem"];
        let dem_change = parseFloat(dem_precent[dem_precent.length-1]) - parseFloat(dem_precent[0]);
        states_overall_shift[state]["shift"] = Math.abs(dem_change).toFixed(4);

        // decide the direction
        if (dem_change >= 0) {
            states_overall_shift[state]["direction"] = "dem";
        } else {
            states_overall_shift[state]["direction"] = "rep";
        }
    }

    return [states_overall_shift, states_all_years];
}