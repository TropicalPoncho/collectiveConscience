import { ANIMATION_SETTINGS, GLOBAL_DEFAULT_SETTINGS } from './constants.js';

/**
 * Gestor de animaciones para el grafo 3D
 * Maneja animaciones de nodos, enlaces y transiciones visuales
 */
export class AnimationManager {
    lastDimensionNode;
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
     * @param {Object|null} node - Nodo destino para zoom in. Si es null, hace zoom out.
     * @param {number} duration - Duración de la animación en ms
     * @returns {Promise}
     */
    async fadeOutCanvasToBlack(node, duration = ANIMATION_SETTINGS.FADE_DURATION) {
        if (node) {
            this.lastDimensionNode = node;
            // Si hay nodo, hacemos Zoom IN (entrar en la neurona)
            this.graph.cameraPosition(
                { x: node.x, y: node.y, z: node.z }, // nueva posición de la cámara (pegada al nodo)
                { x: node.x, y: node.y, z: node.z }, // hacia dónde mira
                duration
            );
        } else {
            // Si NO hay nodo, hacemos Zoom OUT (alejarse para irse)
            this.graph.cameraPosition(
                { x: 0, y: 0, z: GLOBAL_DEFAULT_SETTINGS.longDistance * 2 }, // Nos alejamos mucho
                { x: 0, y: 0, z: 0 }, // Miramos al centro
                duration
            );
        }

        const fadeDuration = Math.max(duration * 0.7, 1); // Duración de la transición de opacidad
        const overlay = this.ensureBlackOverlay();
        overlay.style.opacity = '0';
        await this.animateOverlayOpacity(overlay, 1, fadeDuration);
    }

    /**
     * Fade in desde negro sobre el canvas de Three.js (animación suave)
     * @param {number} duration - Duración de la animación en ms
     * @param {boolean} zoomIn - Si es true, hace zoom in (de lejos a cerca). Si es false, hace zoom out (de cerca a lejos).
     * @returns {Promise}
     */
    async fadeInCanvasFromBlack(duration = ANIMATION_SETTINGS.FADE_DURATION, zoomOut = false) {
        const overlay = this.ensureBlackOverlay();
        // forzamos el repaint para que requestAnimationFrame tenga algo que animar
        overlay.getBoundingClientRect();
        overlay.style.opacity = '1';
        var extraDuration = 1.2; 
        if (zoomOut) {
            this.graph.cameraPosition(this.lastDimensionNode,this.lastDimensionNode);
            this.graph.cameraPosition(
                { x: this.lastDimensionNode.x, y: this.lastDimensionNode.y, z: GLOBAL_DEFAULT_SETTINGS.aimDistance },
                this.lastDimensionNode,
                duration
            );
            extraDuration = 0.5
        } else {
            // Efecto Zoom IN (entrar/explosión): Empezar lejos y acercarse
            this.graph.cameraPosition(
                { x: 1800, y: 1800, z: 1500 }, 
                { x: 0, y: 0, z: 0 }
            );
            this.graph.zoomToFit(duration, 10);
        }

        const fadeDuration = duration * extraDuration;
        await this.animateOverlayOpacity(overlay, 0, fadeDuration);
    }

    animateOverlayOpacity(overlay, targetOpacity, duration, startOpacity = null) {
        return new Promise(resolve => {
            overlay.style.transition = '';
            const fromOpacity = startOpacity !== null
                ? startOpacity
                : parseFloat(overlay.style.opacity) || 0;
            const normalizedDuration = Math.max(duration, 1);
            const delta = targetOpacity - fromOpacity;
            let start = null;
            const step = now => {
                if (!start) start = now;
                const elapsed = now - start;
                const t = Math.min(elapsed / normalizedDuration, 1);
                overlay.style.opacity = (fromOpacity + delta * t).toString();
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    overlay.style.opacity = targetOpacity.toString();
                    resolve();
                }
            };
            requestAnimationFrame(step);
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
        this.removeBlackOverlay();
    }

    /**
     * Remueve el overlay negro si existe
     */
    removeBlackOverlay() {
        if (!this.graph || !this.graph.renderer) return;
        let renderer = this.graph.renderer();
        if (!renderer) return;
        let canvas = renderer.domElement;
        if (!canvas) return;
        let parent = canvas.parentElement;
        if (!parent) return;
        let overlay = parent.querySelector('.threejs-black-fade');
        if (overlay) {
            overlay.remove();
        }
    }


    /**
     * Crea (si no existe) un overlay negro sobre el canvas
     */
    ensureBlackOverlay() {
        if (!this.graph || !this.graph.renderer) {
            throw new Error("Cannot create black overlay: missing graph or renderer");
        }
        let renderer = this.graph.renderer();
        if (!renderer) {
            throw new Error("Cannot create black overlay: renderer is missing");
        }
        let canvas = renderer.domElement;
        let parent = canvas.parentElement;
        let parent2 = parent.parentElement;
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