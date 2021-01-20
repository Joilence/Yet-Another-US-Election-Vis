import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import { registerJQueryD3Click } from './tools/helpers';
import MapVisualization from './components/MapVisualization';
import { getRegionalDataName, getSelectedStates, getSymbolDataName, getYearRange } from './tools/data-manager';
import ControlPane from './components/ControlPane'
import AuxiliaryVis from './components/AuxiliaryVis';
import ScatterplotVis from './components/ScatterplotVis';

const filenames = ['election_data', 'gdp_data'];
const datanames = ['election_data', 'gdp_data'];
const tasks = Array.from(filenames, fn => d3.csv(`/datasets/${fn}.csv`));

Promise.all(tasks).then(files => {
    let datasets = Object.assign({}, ...datanames.map((n, i) => ({[n]: files[i]})));
    // console.log('data loaded', datasets);

    // Initialize Components
    const controlPane = new ControlPane(datasets);
    const auxiVis = new AuxiliaryVis();
    auxiVis.load_dataset(datasets.gdp_data, datasets.election_data);
    const mapVis = new MapVisualization(datasets);
    const scatterVis = new ScatterplotVis(datasets);


    // Current Data Option
    let dataOption = {
        /* Year Range: [ , ]
        First element as startYear, second as endYear.
        eg. [2004, 2008]
        */
        yearRange: [2000,2008],
        symbolDataName: "shift-of-vote",
        regionalDataName: "gdp-growth-rate",
        selectedStates: ["alabama", "alaska", "new-york"],
    }

    // Detect Data Selection
    // TODO: detect change of selected states
    $('#map-visualization').on('change', e => {
        let selectedStates = getSelectedStates();
        console.log('main.js: current selected states:', selectedStates);
        if (dataOption.selectedStates) {
            dataOption.selectedStates = selectedStates;
            if (!$("#sctplot-tab").hasClass("active")) auxiVis.render_auxiliary(dataOption.regionalDataName, dataOption.yearRange, dataOption.selectedStates);
            if ($("#sctplot-tab").hasClass("active")) scatterVis.scatterplotVisRender(dataOption);
        }
    })

    $('#symbol-data-selection input:radio').on('click', e => {
        let symbolDataName = getSymbolDataName();
        console.log('current symbol data name:', symbolDataName);

        // update vis if data changed
        if (dataOption.symbolDataName !== symbolDataName) {
            dataOption.symbolDataName = symbolDataName;
            // year selection rendering will set default brush, automatically trigger refresh of other vis  
            controlPane.yearSelectionRender();
        }
    })

    $('#regional-data-selection input:radio').on('click', e => {
        let regionalDataName = getRegionalDataName();
        console.log('current regional data name:', regionalDataName);

        // update vis if data changed
        if (dataOption.regionalDataName !== regionalDataName) {
            dataOption.regionalDataName = regionalDataName;
            // year selection rendering will set default brush, automatically trigger refresh of other vis
            controlPane.yearSelectionRender();
        }
    })

    $('#year-selection').on('change', e => {
        let yearRange = getYearRange();
        console.log('current year range:', yearRange);

        // update vis if data changed
        if (dataOption.yearRange !== yearRange) {
            dataOption.yearRange = yearRange;
            if (!$("#sctplot-tab").hasClass("active")) auxiVis.render_auxiliary(dataOption.regionalDataName, dataOption.yearRange, dataOption.selectedStates);
            mapVis.mapVisRender(dataOption.symbolDataName, dataOption.regionalDataName, dataOption.yearRange, dataOption.selectedStates);
            if ($("#sctplot-tab").hasClass("active")) scatterVis.scatterplotVisRender(dataOption);
        }
    })
    $('#auxiliary-list a').on('click', function (e) {
        e.preventDefault() 
        $(this).tab('show')
      })
      $("#sctplot-tab").on('click', e => {
        if ($("#sctplot-tab").hasClass("active")) scatterVis.scatterplotVisRender(dataOption);
      })

    // Render Components
    // year selection rendering will set default brush, automatically trigger refresh of other vis
    controlPane.yearSelectionRender();

}).catch(err => console.log(err));
