import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import CustomShaderMaterial from '/node_modules/three-custom-shader-material/vanilla'
import { ThreeObject } from "./ThreeObject.js";


export class LikeFireThreeObject extends ThreeObject{

    clock = new THREE.Clock();

    type = 'Perlin';

    globalUniforms = {
        bloom: {value: 0},
        time: {value: 0},
        aspect: {value: innerWidth / innerHeight}
    };

    constructor(node){
        super(node);
        
        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        const material = new CustomShaderMaterial({
          baseMaterial: THREE.MeshBasicMaterial,
          vertexShader: `
              varying vec2 custom_vUv;
      
              void main() {
                custom_vUv = uv;
              }
          `,
          fragmentShader: `
              varying vec2 custom_vUv;
      
              void main() {
                  csm_FragColor = vec4(custom_vUv, 1., 1.);
              }
          `,
        });
        this.mesh.add(new THREE.Mesh(geometry, material));
        //this.mesh.scale.set( 3, 3, 3 );
    }

    animate(){
        let t = this.clock.getElapsedTime();
        this.globalUniforms.time.value = t * 0.1;
    }
}

