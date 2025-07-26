/**
 * Utilidades para el manejo de grafos y geometría
 */

/**
 * Centra el grafo en el origen (0,0,0) calculando el centroide
 * de todos los nodos y restando ese valor a cada posición
 * @param {Array} nodes - Array de nodos con propiedades x, y, z
 */
export function centrarGrafoEnCero(nodes) {
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

/**
 * Determina el lado (izquierda/derecha) de un objeto respecto a la cámara
 * @param {Object} camPosition - Posición de la cámara {x, y, z}
 * @param {Object} camDirection - Dirección de la cámara {x, y, z}
 * @param {Object} objPosition - Posición del objeto {x, y, z}
 * @returns {string} "izq" o "der"
 */
export function getSide(camPosition, camDirection, objPosition) {
    if (camPosition.z < objPosition.z) {
        return camDirection.x > objPosition.x ? "izq" : "der";
    } else {
        return camDirection.x < objPosition.x ? "izq" : "der";
    }
}

/**
 * Crea enlaces entre nodos basándose en las propiedades links de cada nodo
 * @param {Array} nodes - Array de nodos con propiedades links
 * @param {Object} settings - Configuraciones para los enlaces
 * @returns {Array} Array de enlaces creados
 */
export function createLinks(nodes, settings = {}) {
    const nodeLinks = [];
    const linkDistance = settings.linkDistance || 140;
    
    nodes.forEach(node => {
        if (node.links) {
            node.links.forEach(link => {
                if (nodes.find(item => item.id == link.id)) {
                    const newLink = {
                        source: link.id,
                        target: node.id,
                        distance: link.distance ?? linkDistance
                    };
                    nodeLinks.push(newLink);
                }
            });
        }
    });
    
    return nodeLinks;
}

/**
 * Filtra sinapsis que conectan con los nodos especificados
 * @param {Array} synapses - Array de sinapsis
 * @param {Array} nodeIds - Array de IDs de nodos
 * @returns {Array} Sinapsis filtradas
 */
export function filterSynapsesByNodeIds(synapses, nodeIds) {
    return synapses.filter(synapse => {
        const sourceId = synapse.source?.id || synapse.source;
        const targetId = synapse.target?.id || synapse.target;
        return nodeIds.includes(sourceId.toString()) || nodeIds.includes(targetId.toString());
    });
}

/**
 * Filtra neuronas por dimensión
 * @param {Array} neurons - Array de neuronas
 * @param {string|number} dimensionId - ID de la dimensión
 * @returns {Array} Neuronas filtradas
 */
export function filterNeuronsByDimension(neurons, dimensionId) {
    return neurons.filter(item => item.dimensionId == dimensionId);
}

/**
 * Filtra sinapsis por red
 * @param {Array} synapses - Array de sinapsis
 * @param {string|number} networkId - ID de la red
 * @returns {Array} Sinapsis filtradas
 */
export function filterSynapsesByNetwork(synapses, networkId) {
    return synapses.filter(item => item.networkId == networkId);
} 