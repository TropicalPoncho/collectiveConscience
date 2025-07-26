// Configuraciones globales para el grafo 3D
export const GLOBAL_DEFAULT_SETTINGS = {
    nodeSize: 15,
    cameraDistance: 350,
    aimDistance: 90,
    aimOffsetX: 50,
    aimOffsetY: 30,
    aimOffsetZ: 70,
    activeNodeImg: true,
    imgSize: 50,
    linkDistance: 140,
    LINK_WIDTH: .5,
    LINK_OPACITY: 0.8,
    LINK_PARTICLE_WIDTH: 1,
    LINK_PARTICLE_COUNT: 4,
    LINK_PARTICLE_SPEED: 4 * 0.001
};

// Paleta de colores para los nodos
export const COLORS_ARRAY = [
    "#8AE2C8", // verde
    "#578CCB", // azul
    "#9900FF", // violeta
    "#FF0074", // magenta
    "#FFBC00", // amarillo
    "#111111", // "negro"
    "#FFFFFF"  // blanco
];

// Configuraciones de animación
export const ANIMATION_SETTINGS = {
    CAMERA_TRANSITION_DURATION: 3000,
    FADE_DURATION: 500,
    ORBIT_SPEED: Math.PI / 1500,
    ORBIT_INTERVAL: 10
};

// Configuraciones de la cámara
export const CAMERA_SETTINGS = {
    FOV: 70,
    NEAR: 1,
    FAR: 1000,
    ORBIT_DISTANCE: 90
}; 