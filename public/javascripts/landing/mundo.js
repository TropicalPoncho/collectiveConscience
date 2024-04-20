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
    aimDistance: 40,
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

    stats;

    elements = [];

    //Init graph:
    constructor(elementId, graphData){

        this.graphData = graphData;
        this.threeObjectManager = new ThreeObjectManager({animationType: 'All'});

        this.Graph = ForceGraph3D({ controlType: 'orbit', extraRenderers: [new CSS2DRenderer()]  })
        (document.getElementById(elementId))
            /* .linkCurvature(1)
            .linkCurveRotation(0.5) */
            .nodeLabel('name')
            .cameraPosition({ z: globalDefaultSettings.cameraDistance })
            .onNodeHover(node => {
                console.log(node);
            })
            //.numDimensions(2)
            //.dagMode('zout')
            .cooldownTicks(100)
            .nodeThreeObject(node => this.threeObjectManager.createObject(node) )
            //.linkThreeObject(link => this.threeObjectManager.createObject({'id': link.source+''+link.target, 'type': 'Wave Line'}) )
            .onNodeHover(node => {
                this.consoleLogPosition();
                if ((!node && !this.threeObjectManager.objectToAnimate) || (node && this.hoverNode === node)) return;

                this.threeObjectManager.objectToAnimate = null;

                if (node)
                    this.threeObjectManager.objectToAnimate = node.id;

                this.hoverNode = node || null;

            })
            .onNodeClick(node => this.aimNode(node));

        this.Graph.d3Force('link')
            .distance(link =>  link.distance );

        this.Graph.nodeAutoColorBy('group')
            .linkWidth(globalDefaultSettings.LINK_WIDTH)
            .linkOpacity(globalDefaultSettings.LINK_OPACITY);
            //.linkDirectionalParticleWidth(LINK_PARTICLE_WIDTH)
            //.linkDirectionalParticles(LINK_PARTICLE_COUNT)
            //.linkDirectionalParticleSpeed(LINK_PARTICLE_SPEED);

        this.Graph.graphData(this.graphData);

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

        this.originalCameraPosition = this.camera.position;

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        
        document.body.appendChild(this.stats.dom);
        window.addEventListener('resize', this.resize.bind(this));

        this.render();
    }

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
    
        this.camera.aspect = width / height;
        this.renderer.setSize(width, height);
    
        this.camera.updateProjectionMatrix();
    }

    addElement(element){
        this.elements.push(element);
    }

    consoleLogPosition(){
        console.log(this.camera.position.x + " " + this.camera.position.y + " " + this.camera.position.z);
        var numMeshes = 0;
        scene.traverse(function(o) {
            if (o.isMesh) numMeshes++;
        });
        console.log('There are ' + numMeshes + ' meshes in this scene.');
    }

    render()
    {	
        this.stats.begin();

        this.elements.forEach(elem => elem.animate());
        this.threeObjectManager.animate();
        requestAnimationFrame(() => this.render());
        this.renderer.render( this.scene, this.camera );

        this.stats.end();
    }

    insertNodes(){
        indexNeurons.nodes.push(...nodeObras);
        indexNeurons.links.push(...linksObras);
        console.log(indexNeurons);
        try {
            this.Graph.graphData(indexNeurons);
            this.Graph.numDimensions(3);
        } catch (error) {
            console.log(error);
        }
    }

    activateZoomToFit(){
        this.Graph.onEngineStop(() => this.Graph.zoomToFit(400));
    }

    aimNodeFromId(neuronId){
        var node = graphData.nodes.find(item => item.id === neuronId);
        Cookies.set("neuron", node.id)
        this.aimNode(node);
    }

    aimNode(node){
        // Aim at node from outside it
        const distance = 20;//this.globalDefaultSettings.aimDistance;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y);

        const newPos = node.x || node.y || node.z
            ? { x: node.x , y: node.y , z: node.z + globalDefaultSettings.aimDistance}
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

        var lookAt = {x: node.x +(Math.sign(node.x) * 20), y: node.y, z: node.z};
        this.Graph.cameraPosition(
            newPos, // new position
            lookAt, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
        //ingestNodeInfo(node);
        $('.floatingInfo').children().hide(600);
        $(`#${node.id}`).show(600);

        if(node.id == 2){
            this.insertNodes();
        }
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




