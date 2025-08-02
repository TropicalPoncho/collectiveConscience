import { ANIMATION_SETTINGS, GLOBAL_DEFAULT_SETTINGS } from './constants.js';

/**
 * Gestor de animaciones para el grafo 3D
 * Maneja animaciones de nodos, enlaces y transiciones visuales
 */
export class AnimationManager {
    constructor(graph, threeObjectManager, cameraController) {
        this.graph = graph;
        this.threeObjectManager = threeObjectManager;
        this.cameraController = cameraController;
        
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
     * Fade out a negro sobre el canvas de Three.js (animación suave)
     * @param {number} duration - Duración de la animación en ms
     * @returns {Promise}
     */
    fadeOutCanvasToBlack(node, duration = ANIMATION_SETTINGS.FADE_DURATION) {
        return new Promise(resolve => {
            this.graph.cameraPosition(
                { x: node.x, y: node.y, z: node.z }, // nueva posición de la cámara
                { x: node.x, y: node.y, z: node.z }, // hacia dónde mira
                duration // duración de la transición
            );
            const fadeDuration = duration * 0.7; // Duración de la transición de opacidad
            const overlay = this.ensureBlackOverlay();
            overlay.style.transition = ''; // Desactiva transición CSS
            let start = null;
            const animate = now => {
                if (!start) start = now;
                const elapsed = now - start;
                const t = Math.min(elapsed / fadeDuration, 1);
                overlay.style.opacity = t;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    overlay.style.opacity = '1';
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }

    /**
     * Fade in desde negro sobre el canvas de Three.js (animación suave)
     * @param {number} duration - Duración de la animación en ms
     * @returns {Promise}
     */
    fadeInCanvasFromBlack(duration = ANIMATION_SETTINGS.FADE_DURATION) {
        return new Promise(resolve => {
            this.graph.cameraPosition(
                { x: 1800, y: 1800, z: 1500 },
                { x: 0, y: 0, z: 0 }
            );

            this.graph.zoomToFit(duration, 10);
            const fadeDuration = duration * 1.2; // Duración de la transición de opacidad
            const overlay = this.ensureBlackOverlay();
            overlay.style.transition = ''; // Desactiva transición CSS
            let start = null;
            const animate = now => {
                if (!start) start = now;
                const elapsed = now - start;
                const t = Math.min(elapsed / fadeDuration, 1);
                overlay.style.opacity = 1 - t;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    overlay.style.opacity = '0';
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


    /**
     * Crea (si no existe) un overlay negro sobre el canvas
     */
    ensureBlackOverlay() {
        let canvas = this.graph.renderer().domElement;
        let parent = canvas.parentElement;
        let overlay = parent.querySelector('.threejs-black-fade');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'threejs-black-fade';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'none';
            overlay.style.background = '#000';
            overlay.style.opacity = '0';
            overlay.style.transition = '';
            parent.appendChild(overlay);
        }
        return overlay;
    }

}