import {ThreeObjectManager}  from '../threeObjects/ThreeObjectManager.js';
import Stats from 'three/addons/libs/stats.module'
//mport { CSS2DRenderer } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

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
    nodeSize: 15,
    cameraDistance: 350,
    aimDistance: 90,
    aimOffsetX: 50,
    aimOffsetY: 30,
    aimOffsetZ: 70,
    activeNodeImg: true,
    imgSize: 50,
    linkDistance: 140,
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
    preloadPromise;
    loadedNeurons;
    loadedSynapses;
    showNeuronsCallBack;

    focusedNodeId = null;
    focusedNeighborIds = new Set();

    //Init graph:
    constructor(elementId, dimensionId, showNeuronsCallBack, arActive = false){
        
        this.showNeuronsCallBack = showNeuronsCallBack;

        this.threeObjectManager = new ThreeObjectManager({animationType: 'Hover'});

        if(!arActive){
            this.Graph = ForceGraph3D({ controlType: 'orbit'})
            (document.getElementById(elementId))
                .nodeLabel('name')
                .cameraPosition({ z: globalDefaultSettings.cameraDistance });

            this.Graph.d3Force('link')
                .distance(link => globalDefaultSettings.linkDistance ); 

            this.Graph.d3Force('charge').strength(10);

            this.scene = this.Graph.scene();
            this.renderer = this.Graph.renderer();
            this.camera = this.Graph.camera();

            this.Graph.camera = new THREE.PerspectiveCamera(70, window.outerWidth / window.outerHeight, 1, 1000);
            this.originalCameraPosition = this.camera.position;
        }else{
            this.Graph = ForceGraphAR(document.getElementById(elementId));
        }
        
        this.Graph
            .numDimensions(3)
            //.dagMode('radialout')
            .cooldownTicks(100)
            .nodeThreeObject(node => this.threeObjectManager.createObject(node) )
            .linkThreeObject(link => {
                // Crea el objeto y guarda la referencia en el propio link
                link.type = "SinLink";
                // Genera un id único para el link usando los ids de los nodos de inicio y fin
                link.id = `${link.source?.id || link.source}-${link.target?.id || link.target}`;
                const obj = this.threeObjectManager.createObject(link);
                link._threeObj = obj;
                return obj.mesh;
            })
            .linkPositionUpdate((line, { start, end }, link) => {
                // Si existe la referencia al objeto, accede a ella
                link._threeObj.setPosition(start, end);
            })
            .onNodeHover(node => {
                this.animateNode(node);
            })
            .onNodeClick(node => {
                this.activeNode(node);
                this.setFocusWithFade(node);
                showNeuronsCallBack(node);
            });
   
        this.preloadAllNetworks().then(() => {
            this.insertNetworkByDimension(dimensionId,0);
        })
        

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

        this.resize();
        window.addEventListener('resize', this.resize.bind(this), false);
        this.render();
        
        //this.consoleLogPosition(this.originalCameraPosition);
    }

    resize() {
        let width = window.outerWidth;
        let height = window.outerHeight;
        
        if(!arActive){
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    
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

        /* this.animateLinks(); */
    }

/*     animateLinks(){
        this.Graph
            .linkOpacity(link => this.highlightLinks.find(hLink => hLink.id == link.id) ? 1 : 0);
    } */

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

        this.threeObjectManager.animateLinks();

        requestAnimationFrame(() => this.render());
        if(!arActive){
            this.renderer.render( this.scene, this.camera );
        }

        this.stats.end();
    }

    nodeExists(nodeId){
        return this.graphData.nodes.find(node => node.id == nodeId);
    }

    goToNeuron(neuronId){
        //If already added:
        if(this.graphData.nodes.find(node => node.id == neuronId)){
            var node = this.activeNodeById(neuronId);
            this.showNeuronsCallBack(node);
        }else{
            this.insertNodesById([neuronId], neuronId);
        }
    }

    insertNodesById(nodeIds, nextIdToShow = false){
        //Si encuentro los nodos ya cargados pero no insertados:
        var newNeurons = this.loadedNeurons.filter(node => nodeIds.includes(node.id.toString()));
        if(!newNeurons){
            return;
        }
        this.graphData.nodes.push(...newNeurons);

        // Buscar sinapsis donde el nodeId esté como source o target
        var newSynapses = this.loadedSynapses.filter(synapse => {
            const sourceId = synapse.source?.id || synapse.source;
            const targetId = synapse.target?.id || synapse.target;
            return nodeIds.includes(sourceId.toString()) || nodeIds.includes(targetId.toString());
        });
        
        if(newSynapses.length > 0){
            this.graphData.links.push(...newSynapses);
        }
        
        this.reloadGraph(nextIdToShow);
    }

    addNodes(newNeurons, newSynapses, nextIdToShow = false){
        this.graphData.nodes.push(...newNeurons);
        this.graphData.links.push(...newSynapses);
        this.reloadGraph(nextIdToShow);
    }

    replaceNetwork(newNeurons, newSynapses, nextIdToShow = false){
        this.graphData.nodes = newNeurons;
        this.graphData.links = newSynapses;
        this.reloadGraph(nextIdToShow);
    }

    reloadGraph(nextIdToShow = false){                
        try {
            centrarGrafoEnCero(this.graphData.nodes);
            this.Graph.graphData(this.graphData);
            this.Graph.nodeThreeObject(node => this.threeObjectManager.createObject(node) );
            this.Graph.numDimensions(3);
            this.Graph.onEngineStop(() => {
                if(nextIdToShow){
                    var node = this.activeNodeById(nextIdToShow);
                    this.showNeuronsCallBack(node);
                }
                this.Graph.onEngineStop(() => {});
            });
        } catch (error) {
            console.log(error);
        }
    }

    // Método para precargar todos los datos
    async preloadAllNetworks() {
        try{
            const res = await fetch('/network');
            const { neurons, synapses } = await res.json();
            console.log(neurons,synapses);
            this.loadedNeurons = neurons;
            this.loadedSynapses = synapses;
        }catch(error){
            console.error('Error cargando redes:', error);
        }
    }

    // Método centralizado para cargar redes
    async insertNetworkByDimension(dimensionId, networkId) {
        try {
            // Esperar a que termine el preload si está en curso
            const filteredNeurons = this.loadedNeurons.filter(item => item.dimensionId == dimensionId);
            const filteredSynapses = this.loadedSynapses.filter(item => item.networkId == networkId);
            console.log(filteredNeurons,filteredSynapses);
            if (filteredNeurons.length > 0) {
                this.replaceNetwork(filteredNeurons,filteredSynapses);
                return;
            }
            // Si no hay datos precargados o no hay resultados, cargar desde API
            this.loadNetworkByDimension(dimensionId);
        } catch (error) {
            console.error('Error cargando red por dimensión:', error);
        }
    }

    async loadNetworkByDimension(dimensionId) {
        try {
            const res = await fetch(`/network/${dimensionId}`);
            const { neurons, synapses } = await res.json();
            if(neurons.length > 0 || synapses.length > 0){
                this.loadedNeurons.push(...neurons);
                this.loadedSynapses.push(...synapses);
                this.replaceNetwork(neurons,synapses);
            }else{
                console.log("No hay datos para la dimensión " + dimensionId);
            }
        } catch (error) {
            console.error('Error cargando red por dimensión:', error);
        }
    }

    activateZoomToFit(){
        this.Graph.onEngineStop(() => this.Graph.zoomToFit(700));
    } 

    activeNodeById(neuronId){
        var nodes = this.graphData.nodes;
        var filterNode = nodes.find(item => item.id == neuronId);
        if(filterNode){
            this.activeNode(filterNode);
        }
        return filterNode;
    }

    activeNode(node){
        try {
            this.animateNode(node, true);
            node.side = this.aimNode(node);
        } catch (error) {
            console.log(error);
        }
        return node;
    }

    aimNode(node){
        var distance = globalDefaultSettings.aimDistance;
        const offsetX = globalDefaultSettings.aimOffsetX;

        let lookAt = { x: node.x, y: node.y, z: node.z };
        let newPos;
        let returnSide;
    
        /* // Calcula el vector dirección
        const dir = {
            x: node.x - center.x,
            y: node.y - center.y,
            z: node.z - center.z
        };
        // Normaliza el vector
        const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z) || 1;
        const norm = {
            x: dir.x / length,
            y: dir.y / length,
            z: dir.z / length
        };

        // Posición de la cámara: un poco más lejos que el nodo, en la dirección opuesta al centro
        const camDistance = distance;
        const newPos = {
            x: node.x + norm.x * camDistance,
            y: node.y + norm.y * camDistance,
            z: node.z + norm.z * camDistance
        };
        const lookAt = { x: node.x, y: node.y, z: node.z }; */
        // Decide el lado según la posición X respecto al centro
        if (node.x < 0) {
            // Cámara a la izquierda
            newPos = { x: node.x - offsetX, y: node.y, z: node.z + distance };
            // Ajusta la posición del nodo para que esté en el centro
            lookAt.x = node.x - offsetX;
            returnSide = "izq";
        } else {
            // Cámara a la derecha
            newPos = { x: node.x + offsetX, y: node.y, z: node.z + distance };
            // Ajusta la posición del nodo para que esté en el centro
            lookAt.x = node.x + offsetX;
            returnSide = "der";
        }

        this.Graph.cameraPosition(
            newPos, // nueva posición de la cámara
            lookAt, // hacia dónde mira
            3000 // duración de la transición
        );

        return returnSide;
    }

    getSide(camPosition, camDirection, objPosition){
        if (camPosition.z < objPosition.z) {
            return camDirection.x > objPosition.x ? "izq" : "der";
        } else {
            return camDirection.x < objPosition.x ? "izq" : "der";
        }
    }

    backToBasicsView(extra = 0, cameraDistanceOffset = 0){
        this.fadeInAll();
        this.Graph.cameraPosition(
            {x:0,y:0,z:globalDefaultSettings.cameraDistance + cameraDistanceOffset},
            {x:0,y:extra,z:0},
            3000
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

    setFocusWithFade(node, duration = 500) {
        this.focusedNodeId = node.id;
        this.focusedNeighborIds = new Set([node.id]);
        this.graphData.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            if (sourceId === node.id) this.focusedNeighborIds.add(targetId);
            if (targetId === node.id) this.focusedNeighborIds.add(sourceId);
        });

        // Fade out animado
        const start = performance.now();
        const initialOpacity = 1;
        const targetOpacity = 0.05;

        const animate = (now) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const opacity = initialOpacity + (targetOpacity - initialOpacity) * t;

            this.Graph
                .nodeOpacity(n => this.focusedNeighborIds.has(n.id) ? 1 : opacity)
                .linkOpacity(l =>
                    this.focusedNeighborIds.has(l.source.id || l.source) &&
                    this.focusedNeighborIds.has(l.target.id || l.target) ? 1 : opacity
                );

            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    fadeInAll(duration = 500) {
        const start = performance.now();
        const initialOpacity = 0.05;
        const targetOpacity = 1;

        const animate = (now) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const opacity = initialOpacity + (targetOpacity - initialOpacity) * t;

            this.Graph
                .nodeOpacity(opacity)
                .linkOpacity(opacity);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Limpia el foco
                this.focusedNodeId = null;
                this.focusedNeighborIds = new Set();
            }
        };
        requestAnimationFrame(animate);
    }

    fadeOutNetwork(duration = 500){
        return new Promise(resolve => {
            const start = performance.now();
            const animate = now => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                const opacity = 1 - t;
                Graph.nodeOpacity(opacity).linkOpacity(opacity);
                if(t < 1){
                    requestAnimationFrame(animate);
                }else{
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    fadeInNetwork(duration = 500){
        return new Promise(resolve => {
            const start = performance.now();
            const animate = now => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                Graph.nodeOpacity(t).linkOpacity(t);
                if(t < 1){
                    requestAnimationFrame(animate);
                }else{
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    async switchNetwork(neuronId, dimensionId){
        if(neuronId){
            this.activeNodeById(neuronId);
        }
        await this.fadeOutNetwork();
        await this.loadNetworkByDimension(dimensionId);
        await this.fadeInNetwork();
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

function centrarGrafoEnCero(nodes) {
    if (!nodes.length) return;

    // Calcula el centroide
    let sumX = 0, sumY = 0, sumZ = 0;
    nodes.forEach(n => {
        sumX += n.x || 0;
        sumY += n.y || 0;
        sumZ += n.z || 0;
    });
    const cx = sumX / nodes.length;
    const cy = sumY / nodes.length;
    const cz = sumZ / nodes.length;

    // Resta el centroide a cada nodo
    nodes.forEach(n => {
        n.x = (n.x || 0) - cx;
        n.y = (n.y || 0) - cy;
        n.z = (n.z || 0) - cz;
    });
}




