// import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import { registerJQueryD3Click } from './tools/helpers';
import MapVisualization from './components/MapVisualization';
import ArrowVisualization from './components/ArrowVisualization'; 
import { loadDatasets } from './tools/data-manager';
import AuxiliaryVis from './components/AuxiliaryVis';

const datasets = loadDatasets();
const mapVis = new MapVisualization();
const arrowVis = new ArrowVisualization();
const auxiVis = new AuxiliaryVis();

const svgGraph = mapVis.map_render();

$('#datasets-dropdown a').each((index, item) => {
    $(item).click((event) => {
        const selectedDataset = datasets[event.target.text];
        $('#selected-dataset').text(event.target.text);
        auxiVis.load_dataset(selectedDataset, datasets['1976-2016-president_DP'])
    });
})
// arrowVis.init_arrowVis(svgGraph);