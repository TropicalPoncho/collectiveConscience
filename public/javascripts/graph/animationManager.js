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
    } */
    
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
            const fadeDuration = duration * 0.4; // Duración de la transición de opacidad
            const overlay = this.ensureBlackOverlay();
            overlay.style.transition = ''; // Desactiva transición CSS
            let start = null;
            const animate = now => {
                if (!start) start = now;
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
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
                { x: 1500, y: 1500, z: 1500 },
                { x: 0, y: 0, z: 0 }
            );

            /* this.graph.cameraPosition(
                { x: 0, y: 0, z: GLOBAL_DEFAULT_SETTINGS.cameraDistance },
                { x: 0, y: 0, z: 0 },
                duration
            ); */
            this.graph.zoomToFit(duration, 30);
            const fadeDuration = duration * 0.8; // Duración de la transición de opacidad
            const overlay = this.ensureBlackOverlay();
            overlay.style.transition = ''; // Desactiva transición CSS
            let start = null;
            const animate = now => {
                if (!start) start = now;
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
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