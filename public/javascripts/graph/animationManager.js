import { ANIMATION_SETTINGS } from './constants.js';

/**
 * Gestor de animaciones para el grafo 3D
 * Maneja animaciones de nodos, enlaces y transiciones visuales
 */
export class AnimationManager {
    constructor(graph, threeObjectManager) {
        this.graph = graph;
        this.threeObjectManager = threeObjectManager;
        
        // Estado de animaciones
        this.hoverNode = null;
        this.highlightLinks = [];
        this.focusedNodeId = null;
        this.focusedNeighborIds = new Set();
    }

    /**
     * Anima un nodo (hover, selección, etc.)
     * @param {Object} node - Nodo a animar
     * @param {boolean} stay - Si la animación debe permanecer
     */
    animateNode(node, stay = false) {
        if ((!node && !this.threeObjectManager.objectToAnimate) || (node && this.hoverNode === node)) return;

        if(stay) {
            this.threeObjectManager.objectToAnimate = null;
        }

        this.highlightLinks = [];
        if (node) {
            this.threeObjectManager.objectToAnimate = node.id;
            // Obtener enlaces del grafo actual
            const graphData = this.graph.graphData();
            this.highlightLinks = graphData.links.filter(link => 
                link.source.id == node.id || link.target.id == node.id
            );
        }

        this.hoverNode = node || null;
    }

    /**
     * Establece foco en un nodo con fade animado
     * @param {Object} node - Nodo a enfocar
     * @param {number} duration - Duración de la animación
     */
    setFocusWithFade(node, duration = ANIMATION_SETTINGS.FADE_DURATION) {
        this.focusedNodeId = node.id;
        this.focusedNeighborIds = new Set([node.id]);
        
        // Obtener enlaces del grafo actual
        const graphData = this.graph.graphData();
        graphData.links.forEach(link => {
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

            this.graph
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

    /**
     * Fade in de todos los elementos
     * @param {number} duration - Duración de la animación
     */
    fadeInAll(duration = ANIMATION_SETTINGS.FADE_DURATION) {
        const start = performance.now();
        const initialOpacity = 0.05;
        const targetOpacity = 1;

        const animate = (now) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const opacity = initialOpacity + (targetOpacity - initialOpacity) * t;

            this.graph
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

    /**
     * Fade out de toda la red
     * @param {number} duration - Duración de la animación
     * @returns {Promise} Promise que se resuelve cuando termina la animación
     */
    fadeOutNetwork(duration = ANIMATION_SETTINGS.FADE_DURATION) {
        return new Promise(resolve => {
            const start = performance.now();
            const animate = now => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                const opacity = 1 - t;
                this.graph.nodeOpacity(opacity).linkOpacity(opacity);
                if(t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    /**
     * Fade in de toda la red
     * @param {number} duration - Duración de la animación
     * @returns {Promise} Promise que se resuelve cuando termina la animación
     */
    fadeInNetwork(duration = ANIMATION_SETTINGS.FADE_DURATION) {
        return new Promise(resolve => {
            const start = performance.now();
            const animate = now => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                this.graph.nodeOpacity(t).linkOpacity(t);
                if(t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }

    /**
     * Ejecuta el ciclo de animación
     */
    animate() {
        this.threeObjectManager.animate();
        this.threeObjectManager.animateLinks();
    }

    /**
     * Obtiene el nodo actualmente en hover
     * @returns {Object|null} Nodo en hover o null
     */
    getHoverNode() {
        return this.hoverNode;
    }

    /**
     * Obtiene los enlaces resaltados
     * @returns {Array} Array de enlaces resaltados
     */
    getHighlightLinks() {
        return this.highlightLinks;
    }

    /**
     * Obtiene el ID del nodo enfocado
     * @returns {string|null} ID del nodo enfocado o null
     */
    getFocusedNodeId() {
        return this.focusedNodeId;
    }

    /**
     * Obtiene los IDs de los vecinos enfocados
     * @returns {Set} Set de IDs de vecinos enfocados
     */
    getFocusedNeighborIds() {
        return this.focusedNeighborIds;
    }

    /**
     * Limpia el estado de animación
     */
    clearState() {
        this.hoverNode = null;
        this.highlightLinks = [];
        this.focusedNodeId = null;
        this.focusedNeighborIds = new Set();
    }
} 