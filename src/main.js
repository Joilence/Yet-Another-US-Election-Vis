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

const mapVis = new MapVisualization();
const arrowVis = new ArrowVisualization();

mapVis.map_render();
arrowVis.init_arrowVis();

