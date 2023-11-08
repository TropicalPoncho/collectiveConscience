import { CSS2DObject } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Represents a three-dimensional object.
 */
export class ThreeObject {

    uniforms;
    mesh;
    counter = 1;
    speed = 0.01;

    globalUniforms = {
        time: {value: 0},
        aspect: {value: innerWidth / innerHeight}
    };

    /**
     * Creates a new instance of a ThreeObject.
     */
    constructor(node, label = false) {
        this.mesh = new THREE.Group();

        if(label){
            const nodeEl = document.createElement('div');
            nodeEl.textContent = node.name;
            nodeEl.className = 'node-label';
            this.mesh.add(new CSS2DObject(nodeEl));
        }
    
    }

    /**
     * Does nothing.
     */
    animate() {
        let t = ++this.counter;
        this.globalUniforms.time.value = t * this.speed;
        // Do the other thing
    }

}