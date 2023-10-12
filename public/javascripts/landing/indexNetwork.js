import {ThreeObjectManager}  from '../threeObjects/ThreeObjectManager.js';
import Background from './background.js';


const colorsArray = [
    "#8AE2C8", //verde
    "#578CCB", //azul
    "#9900FF", //violeta
    "#FF0074", //magenta
    "#FFBC00", //amarillo
    "#111111", //"negro"
    "#FFFFFF" //blanco
];

var graphData = { "nodes": [], "links": [] };

var globalDefaultSettings = {
    nodeSize: 8,
    cameraDistance: 350,    
    aimDistance: 150,
    activeNodeImg: true,
    marbleColorA: colorsArray[2],
    marbleColorB: "#000000",
    myNeuronColor: colorsArray[0],
    imgSize: 50,
    particlesSize: 50,
    linkDistance: 150,
    longDistance: 500,
    somaDistance: 200
};

var Graph;
var background;
var scene, renderer, camera;

var nodes = [{
    "id": 0,
    "type": "Image", 
    "name": "Tropical Poncho",
    "img": 'isologo_blanco.png',
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize
},{
    "id": 1, 
    "name": "Nosotres",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[1],
    "links": [0],
    "type": "Marble"
},{
    "id": 2, 
    "name": "Obras",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[2],
    "links": [0],
    "type": "Perlin"
},{
    "id": 3, 
    "name": "Convocatoria",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[3],
    "links": [0]
},{
    "id": 4, 
    "name": "Contacto",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[4],
    "links": [0]
}];
var links = [];
nodes.forEach( elem => {
    if(elem.links){
        elem.links.forEach( target => {
            links.push({
                source: elem.id,
                target: target
            });
        });
    }
});
var indexNeurons = {nodes: nodes , links: links};

const threeObjectManager = new ThreeObjectManager(Graph);
//Init graph:
export function initGraph(elementId){

    Graph = ForceGraph3D({ controlType: 'orbit'  })
    (document.getElementById(elementId))
        .nodeLabel('name')
        .cameraPosition({ z: globalDefaultSettings.cameraDistance })
        .onNodeHover(node => {
            console.log(node);
        })
        //.dagMode('zout')
        .cooldownTicks(100)
        .nodeThreeObject(node => threeObjectManager.createObject(node) )
        .onNodeClick(node => aimNode(node))
        .onEngineTick(() => {
            threeObjectManager.animate();
        });

    Graph.d3Force('link')
        .distance(link => '50' );
    Graph.numDimensions(3);

    const LINK_WIDTH = 1.5;
    const LINK_OPACITY = 0.4;
    const LINK_PARTICLE_WIDTH = 1;
    const LINK_PARTICLE_COUNT = 4;
    const LINK_PARTICLE_SPEED = d => 4 * 0.001;

    Graph.nodeAutoColorBy('group')
        .linkWidth(LINK_WIDTH)
        .linkOpacity(LINK_OPACITY)
        .linkDirectionalParticleWidth(LINK_PARTICLE_WIDTH)
        .linkDirectionalParticles(LINK_PARTICLE_COUNT)
        .linkDirectionalParticleSpeed(LINK_PARTICLE_SPEED);

    Graph.graphData(indexNeurons);
    //background = new Background(Graph);

    scene = Graph.scene();
    renderer = Graph.renderer();
    camera = Graph.camera();

    render();

    return Graph;
}

function render() 
{	
    requestAnimationFrame(render);
    //background.animate();
    threeObjectManager.animate();
    renderer.render( scene, camera );
}

window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

export function activateZoomToFit(){
    Graph.onEngineStop(() => Graph.zoomToFit(400));
}

export function takeScreenshot() {
    // open in new window like this
    var w = window.open('', '');
    w.document.title = "Screenshot";
    var img = new Image();
    // Without 'preserveDrawingBuffer' set to true, we must render now
    renderer.render(scene, camera);
    img.src = renderer.domElement.toDataURL();
    w.document.body.appendChild(img);  
}

export function aimNodeFromId(neuronId){
    var node = graphData.nodes.find(item => item.id === neuronId);
    Cookies.set("neuron", node.id)
    aimNode(node);
}

function aimNode(node){
    // Aim at node from outside it
    const distance = globalDefaultSettings.aimDistance;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)


    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
    );
    ingestNodeInfo(node);
}


//Camera orbit
var orbitInterval = null;
var angle = 0;
var finalDistance = 0;
var extraDistance = 0;
export function activateOrbit(addDistance = 0, resetAndStop){
    finalDistance += addDistance;

    if(!orbitInterval){
        orbitInterval = setInterval(() => {
            if(somaNode == null){
                somaNode = graphData.nodes.find(item => item.id == '636326c5b63661e98b47ed11');
            }
            
            if(extraDistance < finalDistance){
                extraDistance += 1;
            }
            if(resetAndStop && extraDistance >= finalDistance){
                stopOrbit();
            }
            
            Graph.cameraPosition({
                x: ( globalDefaultSettings.cameraDistance + extraDistance ) * Math.sin(angle),
                y: -90,
                z: ( globalDefaultSettings.cameraDistance + extraDistance ) * Math.cos(angle)
            }, somaNode);
            angle += Math.PI / 1500;
        }, 10);  
    }
}

export function resetOrbit(distance, resetAndStop = false){
    stopOrbit();
    activateOrbit(distance, resetAndStop);
}

export function stopOrbit(){
    if(orbitInterval){
        clearInterval(orbitInterval);
        orbitInterval = null;
    }
}

function ingestNodeInfo(node){
    if(node.info && node.name != "SOMA BETA"){ 
        var $neuronInfoElem = $(`.neuronInfo#${node.id}`); //Busco la data de esta neurona
        if(!$neuronInfoElem.length){ //Si no existe lo creo
            $neuronInfoElem = $("<div></div>",{class: "neuronInfo", id: node.id }).appendTo('.neuronInfoContainer');
            $("<h3></h3>").text(node.name).appendTo($neuronInfoElem);
            $("<h4></h4>").text(node.info.sub).appendTo($neuronInfoElem);
            if(node.info.img){
                $('<img src="'+ node.info.img +'">').load(function() {
                    $(this).appendTo($neuronInfoElem);
                });
            }
            $("<p></p>").text(node.info.bio).appendTo($neuronInfoElem);
            if(node.info.links){
                node.info.links.forEach((item, index, arr) => {
                    var elem = $(`<a class="btn" target="_blank" type="button" href="${item.href}"></a>`);
                    elem.append($(`<i class="ico ig"></i>"Instagram"`));
                    $("<div></div>").append(elem).appendTo($neuronInfoElem);
                });
            }
        }
        $('.neuronInfoContainer > .neuronInfo').addClass("hidden"); //Oculto el anterior
        $neuronInfoElem.removeClass("hidden"); //Muestro el actual
        $("#flyerInfoContent").addClass("hidden"); //Oculto la data original
    }else{
        $(".neuronInfo").addClass("hidden"); //Oculto todas las neuronInfo
        $("#flyerInfoContent").removeClass("hidden"); //Muestro la data original
    }
}


/* function update()
{
	if ( keyboard.pressed("p") )
		video.play();
		
	if ( keyboard.pressed("space") )
		video.pause();

	if ( keyboard.pressed("s") ) // stop video
	{
		video.pause();
		video.currentTime = 0;
	}
	
	if ( keyboard.pressed("r") ) // rewind video
		video.currentTime = 0;

    if( keyboard.pressed("c") ){
        console.log(JSON.stringify(Graph.cameraPosition()));
    }
	
}
 */




