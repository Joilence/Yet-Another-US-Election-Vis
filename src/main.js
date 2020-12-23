import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import { registerJQueryD3Click } from './tools/helpers';
import MapVisualization from './components/MapVisualization';
import { getRegionalDataName, getSymbolDataName, getYearRange } from './tools/data-manager';
import ControlPane from './components/ControlPane'
import AuxiliaryVis from './components/AuxiliaryVis';

const filenames = ['election_data', 'gdp_data'];
const datanames = ['election_data', 'gdp_data'];
const tasks = Array.from(filenames, fn => d3.csv(`/datasets/${fn}.csv`));
Promise.all(tasks).then(files => {
    let datasets = Object.assign({}, ...datanames.map((n, i) => ({[n]: files[i]})));
    console.log('data loaded', datasets);

    // Initialize Components
    const controlPane = new ControlPane(datasets);
    const auxiVis = new AuxiliaryVis();
    auxiVis.load_dataset(datasets.gdp_data, datasets.election_data);
    const mapVis = new MapVisualization(datasets);
    mapVis.mapVisRender();

    // Current Data Option
    let dataOption = {
        /* Year Range: [ , ]
        First element as startYear, second as endYear.
        eg. [2004, 2008]
        */
        yearRange: getYearRange(),
        symbolDataName: getSymbolDataName(),
        regionalDataName: getRegionalDataName(),
        selectedStates: ["alabama", "alaska", "new-york"],
    }

    // Detect Data Selection
    // TODO: detect change of selected states

    $('#symbol-data-selection input:radio').on('click', e => {
        let symbolDataName = getSymbolDataName();
        console.log('current symbol data name:', symbolDataName);

        // update vis if data changed
        if (dataOption.symbolDataName !== symbolDataName) {
            dataOption.symbolDataName = symbolDataName;      
            controlPane.yearSelectionRender();
        }
    })

    $('#regional-data-selection input:radio').on('click', e => {
        let regionalDataName = getRegionalDataName();
        console.log('current regional data name:', regionalDataName);

        // update vis if data changed
        if (dataOption.regionalDataName !== regionalDataName) {
            dataOption.regionalDataName = regionalDataName;
            controlPane.yearSelectionRender();
            auxiVis.render_auxiliary(regionalDataName, getYearRange(), dataOption.selectedStates);
        }
    })

    $('#year-selection').on('change', e => {
        let yearRange = getYearRange();
        console.log('current year range:', yearRange);

        // update vis if data changed
        if (dataOption.yearRange !== yearRange) {
            dataOption.yearRange = yearRange;
            auxiVis.render_auxiliary(getRegionalDataName(), yearRange, dataOption.selectedStates);
        }
    })

    // Render Components
    // year selection rendering will set default brush, automatically trigger refresh of other vis
    controlPane.yearSelectionRender();

}).catch(err => console.log(err));
