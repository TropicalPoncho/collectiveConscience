import Background from "./landing/background.js";
import Mundo from "./landing/mundo.js";
import somasData from "./landing/somasData.json" assert { type: 'json' };

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
    "name": "Nosotres",
    "img": 'isologo_blanco.png',
    "color": colorsArray[6],
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize,
    "type": "Image"
},{
    "id": 1, 
    "name": "Obras",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0,distance: 100}],
    "type": "Twist",
    "style": {
        uNoiseStrength: { type: "f", value: 8 },
        uNoiseDensity: { type: "f", value: 8.0 },
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
    "name": "Audiovisuales",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100}],
    "type": "Twist",
    "style": {
        uNoiseStrength: { type: "f", value: 8 },
        uNoiseDensity: { type: "f", value: 1.0 },
        uIntensity: { type: "f", value: 1 },
        uFrequency: { type: "f", value: .5 },
        uAmplitude: { type: "f", value: .2 },
        uBrightness: { value: new THREE.Vector3(0.2, 0.9, 0.3) },
        uContrast: { value: new THREE.Vector3(0.5, 0.7, 0.5	) },
        uOscilation: { value: new THREE.Vector3(2.0, 1.0, 0) },
        uPhase: { value: new THREE.Vector3(0.50, 0.20, 0.25) }
    }
},{
    "id": 3, 
    "name": "Editorial",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100}],
    "type": "Twist",
    "style":{
        color1: {value: new THREE.Color(0x335566)},
        color2: {value: new THREE.Color(0x9900FF)}
    }
},{
    "id": 4, 
    "name": "Tecnología",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100}],
    "type": "Lights",
    "style":{
        colorR: { type: "f", value: .5},
        colorG: { type: "f", value: .6},
        colorB: { type: "f", value: .2},
        colorChange: { type: "f", value: 7}
    }
},{
    "id": 5, 
    "name": "Laboratorios",
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
    "name": "Amigues",
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
        uNoiseStrength: { type: "f", value: 1 },
        uNoiseDensity: { type: "f", value: 9.0 },
        uIntensity: { type: "f", value: 2 },
        uFrequency: { type: "f", value: 4 },
        uAmplitude: { type: "f", value: 2 },
        uBrightness: { value: new THREE.Vector3(0.5, 0.7, 0.5) },
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
    var mundo = new Mundo('contentNetwork', indexNeurons, showNeuronData);
    mundo.addElement(new Background(mundo));

    $(document).on('click', '#takeScreenshot', function(){
        takeScreenshot(mundo);
    });


    $(document).on('click', '.floatingMenu > .bn', function(){
        var node = mundo.activeNodeById($(this).attr('neuronId'));
        showNeuronData(node);
    });

    $(document).on("click", '.volver', function( event ) {
        $(".floatingMenu").removeClass("der");
        $(".floatingMenu").removeClass("izq");
        mundo.activateZoomToFit();
        $(".floatingTitle").fadeIn(600);
        $(".floatingInfo").fadeOut(600);
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
    
function showNeuronData(node){
    var thisNode = somasData.filter(textNode => textNode.id == node.id)[0];
    if(thisNode.subtitle)
        $(".subtitle").text(thisNode.subtitle);
    if(thisNode.info)
        $(".info").text(thisNode.info);
    if(thisNode.next){
        $(".next").attr("id",thisNode.next.id);
        $(".next").show();
    }else{
        $(".next").hide();
    }
    console.log("nodeside:" + node.side);
    if(node.side == "izq"){
        $(".floatingInfo").addClass("izq");
        $(".floatingInfo").removeClass("der");

        $(".floatingMenu").addClass("izq");
        $(".floatingMenu").removeClass("der");
    }else{
        $(".floatingInfo").removeClass("izq");
        $(".floatingInfo").addClass("der");

        $(".floatingMenu").removeClass("izq");
        $(".floatingMenu").addClass("der");
    }
    $(".floatingTitle").fadeOut(600);//Oculto el titulo
    $(".floatingInfo").fadeIn(600); //Muestro la data
}

