import Background from "./landing/background.js";
import Mundo from "./landing/mundo.js";

const globalDefaultSettings = {
    nodeSize: 3,
    imgSize: 50,
};

const colorsArray = [
    "#8AE2C8", //verde
    "#578CCB", //azul
    "#9900FF", //violeta
    "#FF0074", //magenta
    "#FFBC00", //amarillo
    "#111111", //"negro"
    "#FFFFFF" //blanco
];

var nodes = [{
    "id": 0,
    "name": "Amigues de Tropical",
    "img": 'isologo_blanco.png',
    "color": colorsArray[6],
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize,
    "type": "Twist"
},{
    "id": 1, 
    "name": "Nosotres",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0,distance: 100}],
    "type": "Twist",
    "style": {
        uNoiseStrength: { type: "f", value: 2 },
        uNoiseDensity: { type: "f", value: 4.0 },
        uIntensity: { type: "f", value: 2 },
        uFrequency: { type: "f", value: 5 },
        uAmplitude: { type: "f", value: 1 },
        uBrightness: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uContrast: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uOscilation: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uPhase: { value: new THREE.Vector3(0.00, 0.33, 0.67) }
    }
},{
    "id": 2, 
    "name": "Obras",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100}],
    "type": "Twist",
    "style": {
        uNoiseStrength: { type: "f", value: 8 },
        uNoiseDensity: { type: "f", value: 2.0 },
        uIntensity: { type: "f", value: 1 },
        uFrequency: { type: "f", value: .5 },
        uAmplitude: { type: "f", value: .2 },
        uBrightness: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uContrast: { value: new THREE.Vector3(0.5, 0.5, 0.5	) },
        uOscilation: { value: new THREE.Vector3(2.0, 1.0, 0) },
        uPhase: { value: new THREE.Vector3(0.50, 0.20, 0.25) }
    }
},{
    "id": 3, 
    "name": "Proyectos",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100}],
    "type": "Twist",
    "style":{
        color1: {value: new THREE.Color(0x111111)},
        color2: {value: new THREE.Color(0x9900FF)}
    }
},{
    "id": 4, 
    "name": "Laboratorios",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100}],
    "type": "Lights",
    "style":{
        colorR: { type: "f", value: .1},
        colorG: { type: "f", value: .1},
        colorB: { type: "f", value: .2},
        colorChange: { type: "f", value: 5}
    }
},{
    "id": 5, 
    "name": "Audiovisuales",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100},{id:4, distance: 100}],
    "type": "Twist",
    "style":{
        color1: {value: new THREE.Color(0xff0011)},
        color2: {value: new THREE.Color(0x442211)}
    }
},{
    "id": 6, 
    "name": "Editorial",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100},{id:4, distance: 100},{id:5, distance: 100}],
    "type": "Lights",
    "style":{
        weight: { type: "f", value: 13}
    }
} ,{
    "id": 7, 
    "name": "Contacto",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100}, {id:1, distance: 100}, {id:2, distance: 100}, {id:3, distance: 100}, {id:4, distance: 100}, {id:5, distance: 100}, {id:6, distance: 100}],
    "type": "Twist",
    "style":{
        uNoiseStrength: { type: "f", value: 10 },
        uNoiseDensity: { type: "f", value: 7.0 },
        uIntensity: { type: "f", value: 6 },
        uFrequency: { type: "f", value: 4 },
        uAmplitude: { type: "f", value: 5 },
        uBrightness: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uContrast: { value: new THREE.Vector3(0.5, 0.5, 0.5	) },
        uOscilation: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uPhase: { value: new THREE.Vector3(0.30, 0.20, 0.20) }
    }
} /* ,{ //Obras -------------------------------------------
    "id": 20,
    "name": "Kutral",
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize,
    "links": [{id:2, distance: 40}],
    "type": "Fire"
},{
    "id": 21, 
    "name": "Tempistica I",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[1],
    "links": [{id:2, distance: 60}],
    "type": "Twist"
},{
    "id": 22, 
    "name": "Tempistica II",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[2],
    "links": [{id:2, distance: 70}, {id:2}],
    "type": "Twist"
},{
    "id": 23, 
    "name": "Tropical Posporno",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[3],
    "links": [{id:2, distance: 80}],
    "type": "Lights"
},{
    "id": 24, 
    "name": "SOMA beta",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[4],
    "links": [{id:2, distance: 90}],
    "type": "Marble"
},{
    "id": 25, 
    "name": "SOMA",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[4],
    "links": [{id:2, distance: 90}, {id:24}],
    "type": "Lights"
} */];
var nodeLinks = [];
nodes.forEach( node => {
    if( node.links ){
        node.links.forEach( link => {

            var newLink = {
                source: link.id,
                target: node.id
            };

            newLink.distance = link.distance ?? globalDefaultSettings.linkDistance;

            nodeLinks.push(newLink);

        });
    }
});
var indexNeurons = {nodes: nodes , links: nodeLinks};
console.log(nodeLinks);

jQuery(function(){
    var mundo = new Mundo('contentNetwork', indexNeurons);
    //mundo.addElement(new Background(mundo));

    $(document).on('click', '#takeScreenshot', function(){
        takeScreenshot(mundo);
    });

});


function takeScreenshot(mundo){
    // open in new window like this
    var w = window.open('', '');
    w.document.title = "Screenshot";
    var img = new Image();
    // Without 'preserveDrawingBuffer' set to true, we must render now
    mundo.render();
    img.src = mundo.renderer.domElement.toDataURL('image/png');
    w.document.body.appendChild(img);  

    /* const imgData = canvas.toBlob( ( blob ) => { 
        const imgEl = document.createElement( 'img' ); 
        imgEl.src = URL.createObjectURL( blob ); 
        document.body.appendChild( imgEl ); 
    }); */
}