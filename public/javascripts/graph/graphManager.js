import { centrarGrafoEnCero } from './utils.js';
import { DataLoader } from './dataLoader.js';

/**
 * Gestor del grafo 3D
 * Maneja la manipulación de nodos, enlaces y actualización del grafo
 */
export class GraphManager {
    constructor(graph, threeObjectManager, dataLoader, animationManager) {
        this.graph = graph;
        this.animationManager = animationManager;
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
    async addNodes(newNeurons, newSynapses, nextIdToShow = false) {
        this.graphData.nodes.push(...newNeurons);
        this.graphData.links.push(...newSynapses);
        await this.reloadGraph(nextIdToShow);
    }

    /**
     * Reemplaza completamente la red del grafo
     * @param {Array} newNeurons - Array de nuevas neuronas
     * @param {Array} newSynapses - Array de nuevas sinapsis
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    async replaceNetwork(newNeurons, newSynapses, nextIdToShow = false) {
        this.graphData.nodes = newNeurons;
        this.graphData.links = newSynapses;
        await this.reloadGraph(nextIdToShow);
    }

    /**
     * Recarga el grafo con los datos actuales
     * @param {string|number} nextIdToShow - ID del nodo a mostrar después
     */
    reloadGraph(nextIdToShow = false) {
        return new Promise(resolve => {
            console.log("GraphData", this.graphData);
            try {
                centrarGrafoEnCero(this.graphData.nodes);
                this.graph.graphData(this.graphData);
                this.graph.nodeThreeObject(node => this.threeObjectManager.createObject(node));
                this.graph.numDimensions(3);
                this.graph.onEngineStop(() => {
                    if (nextIdToShow) {
                        console.log("nextIdToShow", nextIdToShow);
                        var node = this.getNodeById(nextIdToShow);
                        if (this.showNeuronsCallBack && node) {
                            this.showNeuronsCallBack(node);
                            return;
                        }
                    }
                    console.log("Reload Finished");
                    resolve();
                    this.graph.onEngineStop(() => {
                        console.log("onEngineStop");
                        resolve();
                    });
                });
                console.log("voy liberando antes");
            } catch (error) {
                console.log(error);
                resolve(); // O puedes usar reject(error) si prefieres manejar errores con catch
            }
        });
    }

    /**
     * Inserta red por dimensión usando datos precargados o cargando desde API
     * @param {string|number} dimensionId - ID de la dimensión
     * @param {string|number} networkId - ID de la red
     */
    async insertNetworkByDimension(dimensionId, networkId) {
        try {
            const { neurons, synapses } = await this.dataLoader.insertNetworkByDimension(dimensionId);
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
    getNodeById(neuronId) {
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