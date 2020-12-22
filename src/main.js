import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import { registerJQueryD3Click } from './tools/helpers';
// import { loadDatasets, renderNode } from './tools/data-manager';
import MapVisualization from './components/MapVisualization';
import ArrowVisualization from './components/ArrowVisualization'; 
import { loadDatasets, getRegionalDataName, getSymbolDataName, getYearRange, getGDPRate, getOverallShift, getDataFilename } from './tools/data-manager';
import ControlPane from './components/ControlPane'
import AuxiliaryVis from './components/AuxiliaryVis';

// Initialize Interface
const datasets = loadDatasets();

const controlPane = new ControlPane();
controlPane.yearSelectionRender();

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

const mapVis = new MapVisualization();
// TODO: render map visualization
// mapVis.render();

const auxiVis = new AuxiliaryVis();
// TODO: render auxiliary vis
// auxiVis.render();
setTimeout(() => {
    const { election_data, gdp_data } = datasets;
    // load dataset to auxiliary component
    auxiVis.load_dataset(gdp_data, election_data);
    // render auxiliary with three parameter 
    // (data_option, time_range, selected states to present in auxiliary)
    auxiVis.render_auxiliary(getRegionalDataName(), getYearRange(), dataOption.selectedStates);
}, 1000);

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
