import { filterNeuronsByDimension, filterSynapsesByNetwork, filterSynapsesByNodeIds } from './utils.js';

/**
 * Cargador de datos para redes neuronales
 * Maneja la carga, filtrado y gestión de neuronas y sinapsis
 */
export class DataLoader {
    constructor() {
        this.loadedNeurons = [];
        this.loadedSynapses = [];
        this.preloadPromise = null;
    }

    /**
     * Precarga todos los datos de redes desde la API
     * @returns {Promise<Object>} Promise que resuelve con los datos cargados
     */
    async preloadAllNetworks() {
        try {
            const res = await fetch('/network');
            const { neurons, synapses } = await res.json();
            console.log('Datos precargados:', neurons.length, 'neuronas,', synapses.length, 'sinapsis');
            
            this.loadedNeurons = neurons;
            this.loadedSynapses = synapses;
            
            return { neurons, synapses };
        } catch (error) {
            console.error('Error cargando redes:', error);
            throw error;
        }
    }

    /**
     * Carga datos de red por dimensión específica
     * @param {string|number} dimensionId - ID de la dimensión
     * @returns {Promise<Object>} Promise que resuelve con los datos filtrados
     */
    async loadNetworkByDimension(dimensionId) {
        try {
            const res = await fetch(`/network/${dimensionId}`);
            const { neurons, synapses } = await res.json();
            
            if (neurons.length > 0 || synapses.length > 0) {
                // Agregar a los datos precargados
                this.loadedNeurons.push(...neurons);
                this.loadedSynapses.push(...synapses);
                
                console.log(`Red cargada para dimensión ${dimensionId}:`, neurons.length, 'neuronas,', synapses.length, 'sinapsis');
                return { neurons, synapses };
            } else {
                console.log(`No hay datos para la dimensión ${dimensionId}`);
                return { neurons: [], synapses: [] };
            }
        } catch (error) {
            console.error('Error cargando red por dimensión:', error);
            throw error;
        }
    }

    /**
     * Inserta red por dimensión usando datos precargados o cargando desde API
     * @param {string|number} dimensionId - ID de la dimensión
     * @param {string|number} networkId - ID de la red
     * @returns {Promise<Object>} Promise que resuelve con los datos filtrados
     */
    async insertNetworkByDimension(dimensionId, networkId) {
        try {
            // Filtrar datos precargados
            const filteredNeurons = filterNeuronsByDimension(this.loadedNeurons, dimensionId);
            const filteredSynapses = filterSynapsesByNetwork(this.loadedSynapses, networkId);
            
            console.log('Datos filtrados:', filteredNeurons.length, 'neuronas,', filteredSynapses.length, 'sinapsis');
            
            if (filteredNeurons.length > 0) {
                return { neurons: filteredNeurons, synapses: filteredSynapses };
            }
            
            // Si no hay datos precargados, cargar desde API
            return await this.loadNetworkByDimension(dimensionId);
        } catch (error) {
            console.error('Error insertando red por dimensión:', error);
            throw error;
        }
    }

    /**
     * Filtra sinapsis que conectan con los nodos especificados
     * @param {Array} nodeIds - Array de IDs de nodos
     * @returns {Array} Sinapsis filtradas
     */
    filterSynapsesByNodeIds(nodeIds) {
        return filterSynapsesByNodeIds(this.loadedSynapses, nodeIds);
    }

    /**
     * Filtra neuronas por dimensión
     * @param {string|number} dimensionId - ID de la dimensión
     * @returns {Array} Neuronas filtradas
     */
    filterNeuronsByDimension(dimensionId) {
        return filterNeuronsByDimension(this.loadedNeurons, dimensionId);
    }

    /**
     * Filtra sinapsis por red
     * @param {string|number} networkId - ID de la red
     * @returns {Array} Sinapsis filtradas
     */
    filterSynapsesByNetwork(networkId) {
        return filterSynapsesByNetwork(this.loadedSynapses, networkId);
    }

    /**
     * Busca neuronas por IDs específicos
     * @param {Array} nodeIds - Array de IDs de neuronas
     * @returns {Array} Neuronas encontradas
     */
    findNeuronsByIds(nodeIds) {
        return this.loadedNeurons.filter(node => nodeIds.includes(node.id.toString()));
    }

    /**
     * Verifica si una neurona existe
     * @param {string|number} neuronId - ID de la neurona
     * @returns {boolean} True si existe, false en caso contrario
     */
    neuronExists(neuronId) {
        return this.loadedNeurons.some(node => node.id == neuronId);
    }

    /**
     * Obtiene todos los datos cargados
     * @returns {Object} Objeto con neuronas y sinapsis
     */
    getAllData() {
        return {
            neurons: this.loadedNeurons,
            synapses: this.loadedSynapses
        };
    }

    /**
     * Obtiene solo las neuronas cargadas
     * @returns {Array} Array de neuronas
     */
    getLoadedNeurons() {
        return this.loadedNeurons;
    }

    /**
     * Obtiene solo las sinapsis cargadas
     * @returns {Array} Array de sinapsis
     */
    getLoadedSynapses() {
        return this.loadedSynapses;
    }

    /**
     * Limpia todos los datos cargados
     */
    clearData() {
        this.loadedNeurons = [];
        this.loadedSynapses = [];
        this.preloadPromise = null;
    }

    /**
     * Obtiene estadísticas de los datos cargados
     * @returns {Object} Estadísticas de los datos
     */
    getDataStats() {
        return {
            totalNeurons: this.loadedNeurons.length,
            totalSynapses: this.loadedSynapses.length,
            uniqueDimensions: [...new Set(this.loadedNeurons.map(n => n.dimensionId))].length,
            uniqueNetworks: [...new Set(this.loadedSynapses.map(s => s.networkId))].length
        };
    }
} 