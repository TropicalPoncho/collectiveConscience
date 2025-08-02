import {ThreeObjectManager}  from '../threeObjects/ThreeObjectManager.js';
import Stats from 'three/addons/libs/stats.module'
import { GLOBAL_DEFAULT_SETTINGS, COLORS_ARRAY, ANIMATION_SETTINGS, CAMERA_SETTINGS } from './constants.js';
import { getSide, createLinks } from './utils.js';
import { CameraController } from './cameraController.js';
import { DataLoader } from './dataLoader.js';
import { GraphManager } from './graphManager.js';
import { AnimationManager } from './animationManager.js';
//mport { CSS2DRenderer } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Mundo - Facade principal del sistema de visualización de redes neuronales
 * Proporciona una API unificada para gestionar grafos 3D, cámara, datos y animaciones
 */
export default class Mundo {
    Graph;
    background;
    menu;
    scene;
    renderer; 
    camera;
    cameraController;
    graphManager;
    animationManager;

    threeObjectManager;

    stats;

    elements = [];
    dataLoader;
    showNeuronsCallBack;

    //Init graph:
    constructor(elementId, dimensionId, showNeuronsCallBack, arActive = false) {
        this.showNeuronsCallBack = showNeuronsCallBack;

        this.threeObjectManager = new ThreeObjectManager({animationType: 'Hover'});
        this.dataLoader = new DataLoader();

        if(!arActive) {
            this.Graph = ForceGraph3D({ controlType: 'orbit'})
            (document.getElementById(elementId))
                .nodeLabel('name')
                .cameraPosition({ z: GLOBAL_DEFAULT_SETTINGS.cameraDistance });

            this.Graph.d3Force('link')
                .distance(link => GLOBAL_DEFAULT_SETTINGS.linkDistance ); 

            this.Graph.d3Force('charge').strength(10);

            this.scene = this.Graph.scene();
            this.renderer = this.Graph.renderer();
            this.camera = this.Graph.camera();

            this.Graph.camera = new THREE.PerspectiveCamera(CAMERA_SETTINGS.FOV, window.outerWidth / window.outerHeight, CAMERA_SETTINGS.NEAR, CAMERA_SETTINGS.FAR);
            
        } else {
            this.Graph = ForceGraphAR(document.getElementById(elementId));
        }
        // Inicializar el controlador de cámara
        this.cameraController = new CameraController(this.Graph, this.camera, this.scene, this.renderer);
        this.cameraController.setupCamera();
        
        // Inicializar el gestor de animaciones
        this.animationManager = new AnimationManager(this.Graph, this.threeObjectManager, this.cameraController);
        
        // Inicializar el gestor del grafo
        this.graphManager = new GraphManager(this.Graph, this.threeObjectManager, this.dataLoader, this.animationManager);
        this.graphManager.setShowNeuronsCallback(showNeuronsCallBack);
        
        
        this.Graph
            .numDimensions(3)
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
                this.animationManager.animateNode(node);
            })
            .onNodeClick(node => {
                this.activeNode(node);
                this.animationManager.setFocusWithFade(node);
                showNeuronsCallBack(node);
            });
   
        this.dataLoader.preloadAllNetworks().then(() => {
            this.graph.insertNetworkByDimension(dimensionId);
        })
        
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.cameraController.resize();
        window.addEventListener('resize', this.cameraController.resize.bind(this.cameraController), false);
        this.render();
    }

    /**
     * Acceso directo al gestor del grafo
     */
    get graph() { return this.graphManager; }

    /**
     * Acceso directo al controlador de cámara
     */
    get cameraController() { return this.cameraController; }

    /**
     * Acceso directo al cargador de datos
     */
    get data() { return this.dataLoader; }

    /**
     * Acceso directo al gestor de animaciones
     */
    get animation() { return this.animationManager; }

    // ========================================
    // MÉTODOS INTERNOS (no parte de la API pública)
    // ========================================

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
        this.animationManager.animate();

        requestAnimationFrame(() => this.render());
        if(!arActive){
            this.renderer.render( this.scene, this.camera );
        }

        this.stats.end();
    }

    activeNodeById(neuronId){
        var node = this.graphManager.activeNodeById(neuronId);
        if(node){
            this.activeNode(node);
        }
        return node;
    }

    activeNode(node){
        try {
            this.animationManager.animateNode(node, true);
            if (this.cameraController) {
                node.side = this.cameraController.aimAtNode(node);
            }
        } catch (error) {
            console.log(error);
        }
        return node;
    }


    /**
     * Va a una neurona específica
     * @param {string|number} neuronId - ID de la neurona
     */
    goToNeuron(neuronId) {
        // Si ya está agregada
        if (this.graphManager.graphData.nodes.find(node => node.id == neuronId)) {
            var node = this.activeNodeById(neuronId);
            this.animationManager.setFocusWithFade(node);
            if (this.showNeuronsCallBack && node) {
                this.showNeuronsCallBack(node);
            }
        } else {
            this.graphManager.insertNodesById([neuronId], neuronId);
        }
    }

    /**
     * Agrega un elemento al mundo (como background, efectos, etc.)
     * @param {Object} element - Elemento que debe tener un método animate()
     */
    addElement(element) {
        this.elements.push(element);
    }

    /**
     * Carga las siguientes neuronas según tipos de sinapsis, con diferentes modos de carga.
     * @param {Array} synapseType - Tipos de sinapsis para filtrar las neuronas a mostrar/cargar
     * @param {string|number|boolean} nodeIdToFocus - ID de la neurona a enfocar (opcional, por defecto false)
     * @param {string} loadType - Tipo de carga: 'add', 'goInto', 'fade'
     */
    async loadNext(synapseTypes, nodeIdToFocus = false, loadType = 'add', fromNeuronId = null) {
        // Filtrar las neuronas siguientes según los tipos de sinapsis
        // Se asume que dataLoader tiene un método para esto, si no, hay que implementarlo
        const hideRoot = (loadType == "goInto" && fromNeuronId) ? fromNeuronId : false ;
        const result = await this.dataLoader.getNetworkBySynapseType(synapseTypes, hideRoot );
        const { neurons, synapses } = result;

        if (!neurons || synapses.length === 0) {
            // No hay neuronas nuevas para cargar
            return;
        }

        if (loadType === 'add') {

            await this.graphManager.addNodes(neurons, synapses, nodeIdToFocus);
        } else if (loadType === 'goInto') {

            //Efecto de entrar en la neurona
            await this.goIntoNeuron(fromNeuronId, neurons, synapses, nodeIdToFocus);
        } else if(loadType === 'replace') {

            await this.graphManager.replaceNetwork(filteredNeurons, synapses, nodeIdToFocus);
        } else if (loadType === 'fade') {

            // Agrega las nuevas y oculta las anteriores (asumimos que threeObjectManager puede hacer fade)
            await this.animationManager.fadeOutNetwork(duration);
            await this.graphManager.addNodes(neurons, synapses, nodeIdToFocus);
        }
/* 
        // Manejo de la cámara
        if (nodeIdToFocus) {
            this.goToNeuron(nodeIdToFocus);
        } else {
            this.graph.cameraController.backToBasics();
        } */
    }   
    
    async goIntoNeuron(fromNeuronId, neurons, synapses, nodeIdToFocus){

        // Zoom a la neurona y fade out de la red
        await this.animationManager.fadeOutNetwork(3000, 10);
        
        await this.graphManager.replaceNetwork(neurons, synapses, false);

        // Aleja la cámara y hace fade in de la red
        await this.animationManager.fadeInNetwork(8000, GLOBAL_DEFAULT_SETTINGS.cameraDistance);

    }
    

    /**
     * Limpia recursos y detiene animaciones
     */
    dispose() {
        if (this.cameraController) {
            this.cameraController.dispose();
        }
        if (this.dataLoader) {
            this.dataLoader.clearData();
        }
        if (this.graphManager) {
            this.graphManager.clearGraph();
        }
        if (this.animationManager) {
            this.animationManager.clearState();
        }
        if (this.orbitInterval) {









const { ForceGraph3D, ForceGraphAR } = window;// ForceGraph3D y ForceGraphAR deben ser accesibles globalmente, por eso se agregan aquí}    }        document.body.removeChild(this.stats.dom);        this.stats?.hidePanel();        }            clearInterval(this.orbitInterval);            clearInterval(this.orbitInterval);
        }
        this.stopOrbit();
    }
}

// ...existing code...
const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 1 // o el valor inicial que desees
});
const mesh = new THREE.Mesh(geometry, material);
// ...existing code...