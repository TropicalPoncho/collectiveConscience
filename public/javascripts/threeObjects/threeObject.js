import { CSS2DObject } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
/**
 * Represents a three-dimensional object.
 */
export class ThreeObject {

    uniforms;
    title;
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
        this.title = node.name;
        var title = this.title;
        const loader = new FontLoader();
        var scene = this.scene;
        var height = this.mountainsHeight;
        loader.load( '/fonts/Briller_Regular.json', function ( font ) {

            const geometry = new TextGeometry( title, {
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