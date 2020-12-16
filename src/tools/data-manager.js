import * as d3 from 'd3';

export function loadDatasets() {
    let datasets = {};
    const filenames = ['1976-2016-president_DP', 'gdp_data'];

    for (let i = 0; i < filenames.length; i++) {
        d3.csv(`/datasets/${filenames[i]}.csv`).then((data) => {
            datasets[filenames[i]] = data;
        });
    }
    
    return datasets;
}
