import { GLOBAL_DEFAULT_SETTINGS, ANIMATION_SETTINGS, CAMERA_SETTINGS } from './constants.js';
import { getSide } from './utils.js';

/**
 * Controlador de cámara para el grafo 3D
 * Maneja posicionamiento, orbit, zoom y animaciones de cámara
 */
export class CameraController {
    constructor(graph, camera, scene, renderer) {
        this.graph = graph;
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        
        // Estado del orbit
        this.orbitInterval = null;
        this.angle = 0;
        this.finalDistance = 0;
        this.extraDistance = 0;
        
        // Posición original de la cámara
        this.originalCameraPosition = camera ? camera.position.clone() : null;
        
        // Nodo de referencia para orbit (soma)
        this.somaNode = null;
    }

    /**
     * Configura la cámara inicial
     */
    setupCamera() {
        if (this.camera) {
            this.camera.near = CAMERA_SETTINGS.NEAR;
            this.camera.far = CAMERA_SETTINGS.FAR;
            this.camera.fov = CAMERA_SETTINGS.FOV;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * Maneja el redimensionamiento de la ventana
     */
    resize() {
        if (this.renderer && this.camera) {
            const width = window.outerWidth;
            const height = window.outerHeight;
            
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * Posiciona la cámara para apuntar a un nodo específico
     * @param {Object} node - Nodo al que apuntar
     * @returns {string} Lado desde donde se apunta ("izq" o "der")
     */
    aimAtNode(node) {
        const distance = GLOBAL_DEFAULT_SETTINGS.aimDistance;
        const offsetX = GLOBAL_DEFAULT_SETTINGS.aimOffsetX;

        let lookAt = { x: node.x, y: node.y, z: node.z };
        let newPos;
        let returnSide;

        // Decide el lado según la posición X respecto al centro
        if (node.x < 0) {
            // Cámara a la izquierda
            newPos = { 
                x: node.x - offsetX, 
                y: node.y, 
                z: node.z + distance 
            };
            // Ajusta la posición del nodo para que esté en el centro
            lookAt.x = node.x - offsetX;
            returnSide = "izq";
        } else {
            // Cámara a la derecha
            newPos = { 
                x: node.x + offsetX, 
                y: node.y, 
                z: node.z + distance 
            };
            // Ajusta la posición del nodo para que esté en el centro
            lookAt.x = node.x + offsetX;
            returnSide = "der";
        }

        this.graph.cameraPosition(
            newPos, // nueva posición de la cámara
            lookAt, // hacia dónde mira
            ANIMATION_SETTINGS.CAMERA_TRANSITION_DURATION // duración de la transición
        );

        return returnSide;
    }

    /**
     * Vuelve a la vista básica (vista general)
     * @param {number} extra - Offset vertical adicional
     * @param {number} cameraDistanceOffset - Offset adicional en la distancia de la cámara
     */
    backToBasicsView(extra = 0, cameraDistanceOffset = 0) {
        this.graph.cameraPosition(
            {
                x: 0, 
                y: 0, 
                z: GLOBAL_DEFAULT_SETTINGS.cameraDistance + cameraDistanceOffset
            },
            { x: 0, y: extra, z: 0 },
            ANIMATION_SETTINGS.CAMERA_TRANSITION_DURATION
        );
    }

    /**
     * Determina el lado de un objeto respecto a la cámara
     * @param {Object} camPosition - Posición de la cámara
     * @param {Object} camDirection - Dirección de la cámara
     * @param {Object} objPosition - Posición del objeto
     * @returns {string} "izq" o "der"
     */
    getSide(camPosition, camDirection, objPosition) {
        return getSide(camPosition, camDirection, objPosition);
    }

    /**
     * Activa el modo orbit alrededor del nodo soma
     * @param {number} addDistance - Distancia adicional para el orbit
     * @param {boolean} resetAndStop - Si debe parar cuando llegue a la distancia final
     */
    activateOrbit(addDistance = 0, resetAndStop = false) {
        this.finalDistance += addDistance;

        if (!this.orbitInterval) {
            this.orbitInterval = setInterval(() => {
                // Buscar el nodo soma si no está definido
                if (this.somaNode == null) {
                    this.somaNode = this.graph.graphData().nodes.find(
                        item => item.id == '636326c5b63661e98b47ed11'
                    );
                }
                
                if (this.extraDistance < this.finalDistance) {
                    this.extraDistance += 1;
                }
                
                if (resetAndStop && this.extraDistance >= this.finalDistance) {
                    this.stopOrbit();
                }
                
                this.graph.cameraPosition({
                    x: (GLOBAL_DEFAULT_SETTINGS.cameraDistance + this.extraDistance) * Math.sin(this.angle),
                    y: -90,
                    z: (GLOBAL_DEFAULT_SETTINGS.cameraDistance + this.extraDistance) * Math.cos(this.angle)
                }, this.somaNode);
                
                this.angle += ANIMATION_SETTINGS.ORBIT_SPEED;
            }, ANIMATION_SETTINGS.ORBIT_INTERVAL);
        }
    }

    /**
     * Reinicia el orbit con nueva distancia
     * @param {number} distance - Nueva distancia para el orbit
     * @param {boolean} resetAndStop - Si debe parar al llegar a la distancia
     */
    resetOrbit(distance, resetAndStop = false) {
        this.stopOrbit();
        this.activateOrbit(distance, resetAndStop);
    }

    /**
     * Detiene el orbit
     */
    stopOrbit() {
        if (this.orbitInterval) {
            clearInterval(this.orbitInterval);
            this.orbitInterval = null;
        }
    }

    /**
     * Activa el zoom para ajustar la vista a todos los elementos
     */
    activateZoomToFit() {
        this.graph.onEngineStop(() => this.graph.zoomToFit(700));
    }

    /**
     * Obtiene la posición actual de la cámara
     * @returns {Object} Posición de la cámara
     */
    getCameraPosition() {
        return this.graph.cameraPosition();
    }

    /**
     * Establece la posición de la cámara
     * @param {Object} position - Nueva posición
     * @param {Object} lookAt - Punto hacia donde mirar
     * @param {number} duration - Duración de la transición
     */
    setCameraPosition(position, lookAt = null, duration = 0) {
        this.graph.cameraPosition(position, lookAt, duration);
    }

    /**
     * Limpia recursos del controlador
     */
    dispose() {
        this.stopOrbit();
        this.orbitInterval = null;
        this.somaNode = null;
    }
} 