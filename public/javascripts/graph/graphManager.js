import { centrarGrafoEnCero } from './utils.js';
import { DataLoader } from './dataLoader.js';

/**
 * Gestor del grafo 3D
 * Maneja la manipulación de nodos, enlaces y actualización del grafo
 */
export class GraphManager {
    constructor(graph, threeObjectManager, dataLoader) {
        this.graph = graph;
        this.threeObjectManager = threeObjectManager;
        this.dataLoader = dataLoader;
        this.graphData = { "nodes": [], "links": [] };
        this.showNeuronsCallBack = null;
    }

    /**
     * Establece el callback para mostrar neuronas
     * @param {Function} callback - Función callback
     */
    setShowNeuronsCallback(callback) {
        this.showNeuronsCallBack = callback;
    }

    /**
     * Carga las siguientes neuronas según tipos de sinapsis, con diferentes modos de carga.
     * @param {Array} synapseTypes - Tipos de sinapsis para filtrar las neuronas a mostrar/cargar
     * @param {string|number|boolean} nodeIdToFocus - ID de la neurona a enfocar (opcional, por defecto false)
     * @param {string} loadType - Tipo de carga: 'add', 'goInto', 'fade'
     */
    loadNext(synapseTypes, nodeIdToFocus = false, loadType = 'add') {
        // Filtrar las neuronas siguientes según los tipos de sinapsis
        // Se asume que dataLoader tiene un método para esto, si no, hay que implementarlo
        const result = this.dataLoader.getNextNeuronsBySynapseTypes(this.graphData.nodes, synapseTypes);
        const { newNeurons, newSynapses } = result;

        if (!newNeurons || newNeurons.length === 0) {
            // No hay neuronas nuevas para cargar
            return;
        }

        if (loadType === 'add') {
            this.addNodes(newNeurons, newSynapses, nodeIdToFocus);
        } else if (loadType === 'goInto' || loadType === 'replace') {
            // 'replace' es sinónimo de 'goInto' según la consigna
            this.replaceNetwork(newNeurons, newSynapses, nodeIdToFocus);
        } else if (loadType === 'fade') {
            // Agrega las nuevas y oculta las anteriores (asumimos que threeObjectManager puede hacer fade)
            this.addNodes(newNeurons, newSynapses, nodeIdToFocus);
            if (this.threeObjectManager && typeof this.threeObjectManager.fadeOutNodes === 'function') {
                // Oculta las neuronas anteriores (las que no están en newNeurons)
                const prevNodeIds = this.graphData.nodes
                    .filter(n => !newNeurons.some(nn => nn.id === n.id))
                    .map(n => n.id);
                this.threeObjectManager.fadeOutNodes(prevNodeIds);
            }
        }

        // Manejo de la cámara
        if (nodeIdToFocus) {
            if (typeof this.goToNeuron === 'function') {
                this.goToNeuron(nodeIdToFocus);
            } else if (this.graph && typeof this.graph.goToNeuron === 'function') {
                this.graph.goToNeuron(nodeIdToFocus);
            }
        } else {
            if (this.graph && this.graph.cameraController && typeof this.graph.cameraController.backToBasics === 'function') {
                this.graph.cameraController.backToBasics();
            }
        }
    }

    /**
     * Inserta nodos por IDs específicos
     * @param {Array} nodeIds - Array de IDs de nodos
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    insertNodesById(nodeIds, nextIdToShow = false) {
        // Si encuentro los nodos ya cargados pero no insertados
        var newNeurons = this.dataLoader.findNeuronsByIds(nodeIds);
        if (!newNeurons || newNeurons.length === 0) {
            return;
        }
        this.graphData.nodes.push(...newNeurons);

        // Buscar sinapsis donde el nodeId esté como source o target
        var newSynapses = this.dataLoader.filterSynapsesByNodeIds(nodeIds);
        
        if (newSynapses.length > 0) {
            this.graphData.links.push(...newSynapses);
        }
        
        this.reloadGraph(nextIdToShow);
    }

    /**
     * Agrega nuevos nodos y enlaces al grafo
     * @param {Array} newNeurons - Array de nuevas neuronas
     * @param {Array} newSynapses - Array de nuevas sinapsis
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    addNodes(newNeurons, newSynapses, nextIdToShow = false) {
        this.graphData.nodes.push(...newNeurons);
        this.graphData.links.push(...newSynapses);
        this.reloadGraph(nextIdToShow);
    }

    /**
     * Reemplaza completamente la red del grafo
     * @param {Array} newNeurons - Array de nuevas neuronas
     * @param {Array} newSynapses - Array de nuevas sinapsis
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    replaceNetwork(newNeurons, newSynapses, nextIdToShow = false) {
        this.graphData.nodes = newNeurons;
        this.graphData.links = newSynapses;
        this.reloadGraph(nextIdToShow);
    }

    /**
     * Recarga el grafo con los datos actuales
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    reloadGraph(nextIdToShow = false) {
        try {
            centrarGrafoEnCero(this.graphData.nodes);
            this.graph.graphData(this.graphData);
            this.graph.nodeThreeObject(node => this.threeObjectManager.createObject(node));
            this.graph.numDimensions(3);
            this.graph.onEngineStop(() => {
                if (nextIdToShow) {
                    var node = this.activeNodeById(nextIdToShow);
                    if (this.showNeuronsCallBack && node) {
                        this.showNeuronsCallBack(node);
                    }
                }
                this.graph.onEngineStop(() => {});
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Inserta red por dimensión usando datos precargados o cargando desde API
     * @param {string|number} dimensionId - ID de la dimensión
     * @param {string|number} networkId - ID de la red
     */
    async insertNetworkByDimension(dimensionId, networkId) {
        try {
            const { neurons, synapses } = await this.dataLoader.insertNetworkByDimension(dimensionId, networkId);
            if (neurons.length > 0) {
                this.replaceNetwork(neurons, synapses);
            }
        } catch (error) {
            console.error('Error cargando red por dimensión:', error);
        }
    }

    /**
     * Carga red por dimensión desde la API
     * @param {string|number} dimensionId - ID de la dimensión
     */
    async loadNetworkByDimension(dimensionId) {
        try {
            const { neurons, synapses } = await this.dataLoader.loadNetworkByDimension(dimensionId);
            if (neurons.length > 0 || synapses.length > 0) {
                this.replaceNetwork(neurons, synapses);
            }
        } catch (error) {
            console.error('Error cargando red por dimensión:', error);
        }
    }

    /**
     * Busca un nodo activo por ID
     * @param {string|number} neuronId - ID de la neurona
     * @returns {Object|null} Nodo encontrado o null
     */
    activeNodeById(neuronId) {
        var nodes = this.graphData.nodes;
        var filterNode = nodes.find(item => item.id == neuronId);
        return filterNode || null;
    }

    /**
     * Verifica si un nodo existe en el grafo
     * @param {string|number} nodeId - ID del nodo
     * @returns {boolean} True si existe, false en caso contrario
     */
    nodeExists(nodeId) {
        return this.graphData.nodes.find(node => node.id == nodeId);
    }

    /**
     * Obtiene los datos actuales del grafo
     * @returns {Object} Datos del grafo
     */
    getGraphData() {
        return this.graphData;
    }

    /**
     * Obtiene solo los nodos del grafo
     * @returns {Array} Array de nodos
     */
    getNodes() {
        return this.graphData.nodes;
    }

    /**
     * Obtiene solo los enlaces del grafo
     * @returns {Array} Array de enlaces
     */
    getLinks() {
        return this.graphData.links;
    }

    /**
     * Limpia todos los datos del grafo
     */
    clearGraph() {
        this.graphData = { "nodes": [], "links": [] };
        this.reloadGraph();
    }
} 