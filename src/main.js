// import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import { registerJQueryD3Click } from './tools/helpers';
// import { loadDatasets, renderNode } from './tools/data-manager';
import MapVisualization from './components/MapVisualization';
import ArrowVisualization from './components/ArrowVisualization'; 
import { loadDatasets } from './tools/data-manager';
import ControlPane from './components/ControlPane'
import AuxiliaryVis from './components/AuxiliaryVis';

const datasets = loadDatasets();
const mapVis = new MapVisualization();
const arrowVis = new ArrowVisualization();
const auxiVis = new AuxiliaryVis();

const controlPane = new ControlPane();
const svgGraph = mapVis.map_render();
controlPane.controlPaneInit();

$('#datasets-dropdown a').each((index, item) => {
    $(item).click((event) => {
        const selectedDataset = datasets[event.target.text];
        $('#selected-dataset').text(event.target.text);
        auxiVis.load_dataset(selectedDataset, datasets['1976-2016-president_DP'])
    });
})
// arrowVis.init_arrowVis(svgGraph);
