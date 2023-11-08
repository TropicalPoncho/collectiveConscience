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
    "type": "Image", 
    "name": "Tropical Poncho",
    "img": 'isologo_blanco.png',
    "color": colorsArray[6],
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize
},{
    "id": 1, 
    "name": "Nosotres",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0,distance: 40}],
    "type": "Twist"
},{
    "id": 2, 
    "name": "Obras",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 60}],
    "type": "Marble",
},{
    "id": 3, 
    "name": "Contacto",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 80}],
    "type": "Perlin",
    "nodeVisibility": false
},{
    "id": 4, 
    "name": "Convocatoria",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100}],
    "type": "Lights"
}/* ,{ //Obras -------------------------------------------
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
    mundo.addElement(new Background(mundo));

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