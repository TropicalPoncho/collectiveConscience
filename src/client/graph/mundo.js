import ForceGraph3D from '3d-force-graph';

let ForceGraphAR;
let THREE;
let ThreeObjectManager; // Variable para la clase cargada dinámicamente

if (globalThis.location.pathname === '/ar') {
    console.log("Iniciando modo AR...");
    
    try {
        // Importamos A-Frame explícitamente (ahora unificado a 1.4.2)
        await import('aframe');
        await import('@ar-js-org/ar.js');
        
        // IMPORTANTE: Usar la instancia de THREE que A-Frame pone en el objeto globalThis
        // Esto evita el error "not an instance of THREE.Object3D"
        THREE = globalThis.THREE;

        const module = await import('3d-force-graph-ar');
        ForceGraphAR = module.default;
        console.log("3d-force-graph-ar importado.", ForceGraphAR);
    } catch (e) {
        console.error("Error importando librerías AR:", e);
    }
} else {
    THREE = await import('three');
    globalThis.THREE = THREE; // Exponer globalmente para consistencia
}

// Importamos ThreeObjectManager dinámicamente DESPUÉS de establecer el entorno THREE
const tomModule = await import('../threeObjects/ThreeObjectManager.js');
ThreeObjectManager = tomModule.ThreeObjectManager;

import { GLOBAL_DEFAULT_SETTINGS, CAMERA_SETTINGS } from './constants.js';
import { CameraController } from './cameraController.js';
import { DataLoader } from './dataLoader.js';
import { GraphManager } from './graphManager.js';
import { AnimationManager } from './animationManager.js';

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

    dimension = 0;

    //Init graph:
    constructor(elementId, dimensionId, showNeuronsCallBack, arActive = false) {
        this.arActive = arActive;
        this.showNeuronsCallBack = showNeuronsCallBack;

        this.threeObjectManager = new ThreeObjectManager({animationType: 'Hover'});
        this.dataLoader = new DataLoader();

        if(!this.arActive) {
            this.Graph = ForceGraph3D({ controlType: 'orbit'})
            (document.getElementById(elementId))
                .nodeLabel('name')
                .cameraPosition({ z: GLOBAL_DEFAULT_SETTINGS.cameraDistance });

            this.Graph.d3Force('link')
                .distance(link => GLOBAL_DEFAULT_SETTINGS.linkDistance)

            this.Graph.d3Force('charge').strength(10);

            this.scene = this.Graph.scene();
            this.renderer = this.Graph.renderer();
            this.camera = this.Graph.camera();

            this.Graph.camera = new THREE.PerspectiveCamera(CAMERA_SETTINGS.FOV, window.outerWidth / window.outerHeight, CAMERA_SETTINGS.NEAR, CAMERA_SETTINGS.FAR);
            
        } else {
            console.log("Instanciando ForceGraphAR...");
            // ForceGraphAR es una factoría que devuelve la función de inicialización
            // Debemos llamarla primero () y luego pasarle el elemento DOM
            this.Graph = ForceGraphAR()(document.getElementById(elementId));
            
            console.log("ForceGraphAR instanciado:", this.Graph);
                /* .markerAttrs({
                    type: 'pattern',
                    url: '/ar/sticker01.patt'
                }); */
            // En modo AR, la escena puede no estar expuesta directamente o ser gestionada internamente
            this.scene = this.Graph.scene ? this.Graph.scene() : null;
            console.log("Escena AR:", this.scene);
        }
        // Inicializar el controlador de cámara
        this.cameraController = new CameraController(this.Graph, this.camera, this.renderer);
        this.cameraController.setupCamera();
        
        // Inicializar el gestor de animaciones
        this.animationManager = new AnimationManager(this.Graph, this.threeObjectManager, this.cameraController);
        
        // Inicializar el gestor del grafo
        this.graphManager = new GraphManager(this.Graph, this.threeObjectManager, this.dataLoader, this.animationManager);
        this.graphManager.setShowNeuronsCallback(showNeuronsCallBack);
        
        // Helper para corregir instancias de THREE en modo AR (Parche de prototipos)
        const patchForAR = (obj) => {
            if (!this.arActive || !window.THREE) return obj;
            
            const patch = (o) => {
                if (!o) return;
                // Detectar tipo y asignar prototipo de la instancia global (A-Frame)
                let TargetType = window.THREE.Object3D;
                if (o.isMesh) TargetType = window.THREE.Mesh;
                else if (o.isGroup) TargetType = window.THREE.Group;
                else if (o.isLine) TargetType = window.THREE.Line;
                else if (o.isSprite) TargetType = window.THREE.Sprite;
                
                // Si el objeto no es instancia del THREE global, forzamos el prototipo
                if (!(o instanceof TargetType)) {
                    Object.setPrototypeOf(o, TargetType.prototype);
                }
                if (o.children) o.children.forEach(patch);
            };
            patch(obj);
            return obj;
        };
        
        this.Graph
            .numDimensions(3)
            .cooldownTicks(100)
            .nodeThreeObject(node => {
                const obj = this.threeObjectManager.createObject(node);
                return patchForAR(obj);
            })
            .linkThreeObject(link => {
                // Crea el objeto y guarda la referencia en el propio link
                link.type = "SinLink";
                // Genera un id único para el link usando los ids de los nodos de inicio y fin
                link.id = `${link.source?.id || link.source}-${link.target?.id || link.target}`;
                const obj = this.threeObjectManager.createObject(link);
                link._threeObj = obj;
                return patchForAR(obj.mesh);
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
                showNeuronsCallBack(node);
            });
   
        this.dataLoader.preloadAllNetworks().then(() => {
            this.graph.insertNetworkByDimension(dimensionId);
        })
        
        /* this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom); */

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
        var pos = position ?? (this.camera ? this.camera.position : {x:0, y:0, z:0});
        console.log(pos.x + " " + pos.y + " " + pos.z);
        var numMeshes = 0;
        if (this.scene) {
            this.scene.traverse(function(o) {
                if (o.isMesh) numMeshes++;
            });
        }
        //console.log('There are ' + numMeshes + ' meshes in this scene.');
    }

    render(){	
        //this.stats.begin();

        this.elements.forEach(elem => elem.animate());
        this.animationManager.animate();

        requestAnimationFrame(() => this.render());
        if(!this.arActive){
            this.renderer.render( this.scene, this.camera );
        }

        //this.stats.end();
    }

    activeNodeById(neuronId){
        var node = this.graphManager.getNodeById(neuronId);
        if(node){
            this.activeNode(node);
        }
        return node;
    }

    activeNode(node){
        try {
            this.animationManager.animateNode(node, true);
            if (this.cameraController && !this.arActive) {
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
    async goToNeuron(neuronId) {
        // Si ya está agregada
        if (this.graphManager.graphData.nodes.find(node => node.id == neuronId)) {
            var node = this.activeNodeById(neuronId);
            if (this.showNeuronsCallBack && node) {
                this.showNeuronsCallBack(node);
            }
        } else {
            if(this.dimension != 0){ //Esta en otra dimensión. Debo volver
                var {neurons, synapses} = await this.dataLoader.insertNetworkByDimension(0);
                await this.goBackFromNeuron(neurons, synapses, false);
                var node = this.activeNodeById(neuronId);
                if (this.showNeuronsCallBack && node) {
                    this.showNeuronsCallBack(node);
                    return;
                }
            }else{
                this.graphManager.insertNodesById([neuronId], neuronId);
            }
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
    async loadNext(synapseTypes, nodeIdToFocus = false, loadType = 'add', fromNeuronId = null, manageMenuesCallback) {
        // Filtrar las neuronas siguientes según los tipos de sinapsis
        const hideRoot = (loadType == "goInto" && fromNeuronId) ? fromNeuronId : false ;
        const result = await this.dataLoader.getNetworkBySynapseType(synapseTypes, hideRoot );
        const { neurons, synapses } = result;
        

        if (!neurons || synapses.length === 0) {
            // No hay neuronas nuevas para cargar
            return []; // Retornamos array vacío
        }

        if (loadType === 'add') {

            await this.graphManager.addNodes(neurons, synapses, nodeIdToFocus);
        } else if (loadType === 'goInto') {

            //Efecto de entrar en la neurona
            await this.goIntoNeuron(fromNeuronId, neurons, synapses, nodeIdToFocus);
            manageMenuesCallback(neurons);
        } else if(loadType === 'replace') {

            await this.graphManager.replaceNetwork(filteredNeurons, synapses, nodeIdToFocus);
        } else if (loadType === 'fade') {

            // Agrega las nuevas y oculta las anteriores (asumimos que threeObjectManager puede hacer fade)
            await this.animationManager.fadeAndZoomIntoNeuron(duration);
            await this.graphManager.addNodes(neurons, synapses, nodeIdToFocus);
        }

        
        return neurons; // Retornamos las neuronas cargadas para que index.js las use
/* 
        // Manejo de la cámara
        if (nodeIdToFocus) {
            this.goToNeuron(nodeIdToFocus);
        } else {
            this.graph.cameraController.backToBasics();
        } */
    }   
    
    async goIntoNeuron(fromNeuronId, neurons, synapses, nodeIdToFocus) {
        this.lastDimensionNode = this.graphManager.getNodeById(fromNeuronId);
        this.dimension++;
        // Pasamos isBack = false (Entrando)
        await this.goFromToNeuron(this.lastDimensionNode, neurons, synapses, nodeIdToFocus, false);
    }

    async goBackFromNeuron(neurons, synapses, nodeIdToFocus) {
        this.dimension--;
        await this.goFromToNeuron(null, neurons, synapses, nodeIdToFocus, true);
    }

    async goFromToNeuron(node, neurons, synapses, nodeIdToFocus, isBack) {
        // 1. Fade Out
        await this.animationManager.fadeOutCanvasToBlack(node, 3000);

        // 2. Reemplazar red y ESPERAR a que se completen los objetos
        await this.graphManager.replaceNetwork(neurons, synapses, nodeIdToFocus);

        // 4. Fade In
        await this.animationManager.fadeInCanvasFromBlack(4000, isBack);
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
            this.graphManager.dispose();
        }
        if (this.animationManager) {
            this.animationManager.clearState();
        }
        if (this.threeObjectManager) {
            this.threeObjectManager.disposeAll();
        }
        if (this.orbitInterval) {
            clearInterval(this.orbitInterval);
        }
        this.stopOrbit();
    }
}






