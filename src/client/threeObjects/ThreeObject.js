import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Represents a three-dimensional object.
 */
export class ThreeObject {

    get type() { return this.constructor.type; }

    uniforms;
    title;
    mesh;
    counter = 1;
    speed = 0.01;
    size = 15;
    segmentWidth = 64;
    segmentHeight = 32;

    globalUniforms = {
        time: {value: 0},
        aspect: {value: innerWidth / innerHeight}
    };

    static colorsArray = [
        "#8AE2C8",
        "#578CCB",
        "#9900FF",
        "#FF0074",
        "#FFBC00",
        "#111111",
        "#FFFFFF"
    ];

    /**
     * Creates a new instance of a ThreeObject.
     * @param {Object} node - The node object to be represented by the ThreeObject.
     * @param {boolean} label - Whether to display a label for the ThreeObject.
     */
    constructor(node, label = false) {
        this.mesh = new THREE.Group();

        // Recorremos todos los parámetros de node y reemplazamos los atributos homónimos si están definidos
        for (const key in node) {
            if (Object.prototype.hasOwnProperty.call(this, key) && node[key] !== undefined) {
                this[key] = node[key];
            }
        }


        if(label){
            const nodeEl = document.createElement('div');
            nodeEl.textContent = node.name;
            nodeEl.className = 'node-label';
            this.mesh.add(new CSS2DObject(nodeEl));
        }
        /* if(node.name){
            this.title = node.name;
            var title = this.title;
            const loader = new FontLoader();
            var scene = this.scene;
            loader.load( '/fonts/Briller_Regular.json', function ( font ) {

                const geometry = new THREE.TextGeometry( title, {
                    font: font,
                    size: 10,
                    height: 20,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 10,
                    bevelSize: 8,
                    bevelOffset: 0,
                    bevelSegments: 5
                } );
                var material = new THREE.MeshBasicMaterial( { overdraw: true, side:THREE.DoubleSide } );
                let meshText = new THREE.Mesh( geometry, material );
                //meshText.position.y = height * -2.5;
                meshText.position.z = node.z;
                meshText.position.x = node.x + (Math.sign(node.x));
                meshText.position.y = node.y;
                scene.add( meshText );
            } );
        } */
        
    }

    /**
     * Updates the ThreeObject.
     */
    animate() {
        let t = ++this.counter;
        this.globalUniforms.time.value = t * this.speed;
        // Do the other thing
    }

}