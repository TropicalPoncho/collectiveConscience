import {ThreeObjectManager}  from '../threeObjects/ThreeObjectManager.js';
import Background from './background.js';
import Stats from 'three/addons/libs/stats.module'
import { CSS2DRenderer } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

const colorsArray = [
    "#8AE2C8", //verde
    "#578CCB", //azul
    "#9900FF", //violeta
    "#FF0074", //magenta
    "#FFBC00", //amarillo
    "#111111", //"negro"
    "#FFFFFF" //blanco
];

const globalDefaultSettings = {
    nodeSize: 8,
    cameraDistance: 350,
    aimDistance: 100,
    aimOffsetX: 20,
    aimOffsetY: 30,
    aimOffsetZ: 70,
    activeNodeImg: true,
    imgSize: 50,
    linkDistance: 50,
    LINK_WIDTH: .5,
    LINK_OPACITY: 0.8,
    LINK_PARTICLE_WIDTH: 1,
    LINK_PARTICLE_COUNT: 4,
    LINK_PARTICLE_SPEED: 4 * 0.001
};

export default class Mundo{

    Graph;
    background;
    menu;
    scene;
    renderer; 
    camera;
    hoverNode = null;
    originalCameraPosition;
    graphData = { "nodes": [], "links": [] };

    threeObjectManager;

    highlightLinks = [];

    stats;

    elements = [];

    //Init graph:
    constructor(elementId, order, showNeuronsCallBack){

        this.threeObjectManager = new ThreeObjectManager({animationType: 'Hover'});

        this.Graph = ForceGraph3D({ controlType: 'orbit'})
        (document.getElementById(elementId))
            .linkCurvature(.4)
            .linkCurveRotation(0.1) 
            .nodeLabel('name')
            .cameraPosition({ z: globalDefaultSettings.cameraDistance })
            .numDimensions(3)
            //.dagMode('zout')
            .cooldownTicks(100)
            .nodeThreeObject(node => this.threeObjectManager.createObject(node) )
            //.linkThreeObject(link => this.threeObjectManager.createObject({'id': link.source+''+link.target, 'type': 'Wave Line'}) )
            .onNodeHover(node => {
                this.animateNode(node);
            })
            .onNodeClick(node => {
                this.activeNode(node);
                showNeuronsCallBack(node);
            });

        this.Graph.d3Force('link')
            .distance(link =>  link.distance ); 

        this.Graph.nodeAutoColorBy('group')
            .linkWidth(globalDefaultSettings.LINK_WIDTH)
            .linkOpacity(.8)
            .linkDirectionalParticleWidth(globalDefaultSettings.LINK_PARTICLE_WIDTH)
            .linkDirectionalParticles(globalDefaultSettings.LINK_PARTICLE_COUNT)
            .linkDirectionalParticleSpeed(globalDefaultSettings.LINK_PARTICLE_SPEED);

        this.Graph.d3Force('charge').strength(-120);

        this.insertNodesFromApi(order,0);

        this.scene = this.Graph.scene();
        this.renderer = this.Graph.renderer();
        this.camera = this.Graph.camera();

/*         this.camera.near = 30;
        this.camera.far = 300;
        this.camera.fov = 55;
        this.camera.updateProjectionMatrix(); */

        //this.scene.remove(scene.getObjectByName('Light'));

        /*this.renderer.shadowMap.enabled = false;
        this.scene.traverse(function (child) {
            if (child.material) {
                child.material.needsUpdate = true
            }
        });*/
        
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.Graph.camera = new THREE.PerspectiveCamera(70, window.outerWidth / window.outerHeight, 1, 1000);
        this.originalCameraPosition = this.camera.position;
        
        this.resize();
        window.addEventListener('resize', this.resize.bind(this), false);
        this.render();
        
        //this.consoleLogPosition(this.originalCameraPosition);
    }

    resize() {
        let width = window.outerWidth;
        let height = window.outerHeight;
    
        this.camera.aspect = width / height;
        this.renderer.setSize(width, height);
    
        this.camera.updateProjectionMatrix();
    }

    addElement(element){
        this.elements.push(element);
    }
    
    animateNode(node, stay = false){
        if ((!node && !this.threeObjectManager.objectToAnimate) || (node && this.hoverNode === node)) return;

        if(stay){
            this.threeObjectManager.objectToAnimate = null;
        }

        this.highlightLinks = [];
        if (node){
            this.threeObjectManager.objectToAnimate = node.id;
            this.highlightLinks = this.graphData.links.filter( link => link.source.id == node.id || link.target.id == node.id);
        }

        this.hoverNode = node || null;

        //this.animateLinks();
    }

    animateLinks(){
        this.Graph
            .linkOpacity(link => this.highlightLinks.find(hLink => hLink.id == link.id) ? 1 : 0);
    }

    consoleLogPosition(position = false){
        var pos = position ?? this.camera.position;
        console.log(pos.x + " " + pos.y + " " + pos.z);
        var numMeshes = 0;
        scene.traverse(function(o) {
            if (o.isMesh) numMeshes++;
        });
        //console.log('There are ' + numMeshes + ' meshes in this scene.');
    }

    render(){	
        this.stats.begin();

        this.elements.forEach(elem => elem.animate());
        this.threeObjectManager.animate();
        requestAnimationFrame(() => this.render());
        this.renderer.render( this.scene, this.camera );

        this.stats.end();
    }

    insertNodes(newGraphData, nextIdToShow = false, goToNeuronDataCallback = false){
        //Si encuentro el primer nodo ingresado, ejecuto el callback y return
        if(this.graphData.nodes.find(node => node.id == newGraphData.nodes[0].id)){
            if(goToNeuronDataCallback){
                this.Graph.onEngineStop(() => {
                    goToNeuronDataCallback(nextIdToShow);
                    this.Graph.onEngineStop(() => {});
                });
            }
            return;
        }
        //Sino lo integro:
        this.graphData.nodes.push(...newGraphData);
        this.graphData.links.push(...this.createLinks(newGraphData));
        try {
            this.Graph.graphData(this.graphData);
            this.Graph.nodeThreeObject(node => this.threeObjectManager.createObject(node) );
            this.Graph.numDimensions(3);
            this.Graph.onEngineStop(() => {
                if(goToNeuronDataCallback){
                    goToNeuronDataCallback(nextIdToShow);
                }
                this.Graph.onEngineStop(() => {});
            });
        } catch (error) {
            console.log(error);
        }
    }

    insertNodesFromApi(order, page){
        $.get( `/neurons`, {page: page}, ( neurons) => {
            if(neurons.length != 0){
                let filtered = neurons.filter(item => item.order == order);
                this.insertNodes(filtered);
                //Hacerlo recursivo?
            }else{ //Cuando termina de cargar
                //setTimeout(() => { manageNewNeurons(); }, 5000);
            }
        });
    }

    activateZoomToFit(){
        this.Graph.onEngineStop(() => this.Graph.zoomToFit(700));
    } 


    activeNodeById(neuronId){
        var nodes = this.graphData.nodes;
        var filterNode = nodes.find(item => item.id == neuronId);
        filterNode = this.activeNode(filterNode);
        return filterNode;
    }

    activeNode(node){
        this.animateNode(node, true);
        node.side = this.aimNode(node);
        return node;
    }

    aimNode(node){
        // Aim at node from outside it
        var distance = globalDefaultSettings.aimDistance;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y);

        var lookAt = {x: node.x +(Math.sign(node.x) * globalDefaultSettings.aimOffsetX), y: node.y, z: node.z};
        
        if(window.innerWidth < 800){
            lookAt = {x: node.x , y: node.y - globalDefaultSettings.aimOffsetY, z: node.z};
            distance += globalDefaultSettings.aimOffsetZ;
        }

        const newPos = node.x || node.y || node.z
            ? { x: node.x , y: node.y , z: node.z + distance }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

        var side = this.getSide(newPos,lookAt,node); 

        console.log("newPos x "+ Math.round(newPos.x) +" lookAt x" + Math.round(lookAt.x));
        this.Graph.cameraPosition(
            newPos, // new position
            lookAt, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );

        return side;
    }

    getSide(camPosition, camDirection, objPosition){
        if (camPosition.z < objPosition.z) {
            return camDirection.x > objPosition.x ? "izq" : "der";
        } else {
            return camDirection.x < objPosition.x ? "izq" : "der";
        }
    }

    backToBasicsView(extra = 0, cameraDistanceOffset = 0){
        /* if(window.innerWidth < 800){
            extra = 50;
        } */
        this.Graph.cameraPosition(
            {x:0,y:0,z:globalDefaultSettings.cameraDistance + cameraDistanceOffset}, // new position
            {x:0,y:extra,z:0}, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    }


    //Camera orbit
    orbitInterval = null;
    angle = 0;
    finalDistance = 0;
    extraDistance = 0;
    activateOrbit(addDistance = 0, resetAndStop){
        this.finalDistance += addDistance;

        if(!this.orbitInterval){
            this.orbitInterval = setInterval(() => {
                if(somaNode == null){
                    somaNode = graphData.nodes.find(item => item.id == '636326c5b63661e98b47ed11');
                }
                
                if(this.extraDistance < this.finalDistance){
                    this.extraDistance += 1;
                }
                if(resetAndStop && this.extraDistance >= this.finalDistance){
                    stopOrbit();
                }
                
                this.Graph.cameraPosition({
                    x: ( globalDefaultSettings.cameraDistance + this.extraDistance ) * Math.sin(angle),
                    y: -90,
                    z: ( globalDefaultSettings.cameraDistance + this.extraDistance ) * Math.cos(angle)
                }, somaNode);
                angle += Math.PI / 1500;
            }, 10);  
        }
    }

    resetOrbit(distance, resetAndStop = false){
        stopOrbit();
        activateOrbit(distance, resetAndStop);
    }

    stopOrbit(){
        if(this.orbitInterval){
            clearInterval(this.orbitInterval);
            this.orbitInterval = null;
        }
    }

    createLinks(nodes){
        var nodeLinks = [];
        //var newBlend = indexNeurons.concat(nodes);
        nodes.forEach( node => {
            if( node.links ){
                node.links.forEach( link => {
                    if(nodes.find( item => item.id == link.id)){
                        var newLink = {
                            source: link.id,
                            target: node.id
                        };
                        
                        newLink.distance = link.distance ?? globalDefaultSettings.linkDistance;
                        nodeLinks.push(newLink);
                    }
                });
            }
        });
        return nodeLinks;
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




