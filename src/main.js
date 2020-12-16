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
import { loadDatasets, getRegionalDataName, getSymbolDataName, getYearRange } from './tools/data-manager';
import ControlPane from './components/ControlPane'
import AuxiliaryVis from './components/AuxiliaryVis';

const datasets = loadDatasets();
const mapVis = new MapVisualization();
const arrowVis = new ArrowVisualization();
const auxiVis = new AuxiliaryVis();

const controlPane = new ControlPane();
controlPane.yearSelectionRender();

$('#datasets-dropdown a').each((index, item) => {
    $(item).click((event) => {
        const selectedDataset = datasets[event.target.text];
        $('#selected-dataset').text(event.target.text);
        auxiVis.load_dataset(selectedDataset, datasets['1976-2016-president_DP'])
        const svgGraph = mapVis.map_render(selectedDataset);
    });
})
// arrowVis.init_arrowVis(svgGraph);

// Current Data Option
let dataOption = {
    /* Year Range: [ , ]
       First element as startYear, second as endYear.
       eg. [2004, 2008]
    */
    yearRange: getYearRange(),
    symbolDataName: getSymbolDataName(),
    regionalDataName: getRegionalDataName(),
}

// Data Selection
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
    }
})

$('#year-selection').on('change', e => {
    let yearRange = getYearRange();
    console.log('current year range:', yearRange);

    // update vis if data changed
    if (dataOption.yearRange !== yearRange) {
        dataOption.yearRange = yearRange;
    }
})