import * as THREE from 'three';
import {ThreeObject}  from './ThreeObject.js';
import { noiseFS } from '../shaders/noise.js';

export class LightsThreeObject extends ThreeObject  {

    static type = 'Lights';

    constructor (node, config){
        super(node);

        this.localUniforms = {
            weight: { type: "f", value: 3.0 },
            colorR: { type: "f", value: .9},
            colorG: { type: "f", value: .0},
            colorB: { type: "f", value: .8},
            colorChange: { type: "f", value: 2},
        };

        if(node.style){
            $.extend(this.localUniforms, node.style);
        }

        this.speed = 0.009;

        var material = new THREE.ShaderMaterial( {
            uniforms: { ...this.localUniforms, ...this.globalUniforms, ...this.uniforms },
            vertexShader: `
                ${noiseFS}
                varying vec3 vNormal;
                uniform float time;
                uniform float weight;

                void main() {

                    float f = weight * pnoise( normal + time, vec3( 10.0 ) );
                    vNormal = normal;
                    vec4 pos = vec4( position + f * normal, 1.0 );
                    gl_Position = projectionMatrix * modelViewMatrix * pos;

                }
            `,
            fragmentShader: `	
                ${noiseFS}
                varying vec3 vNormal;
                uniform sampler2D tShine;
                uniform float time;
                uniform float colorR;
                uniform float colorG;
                uniform float colorB;
                uniform float colorChange;
                
                float PI = 3.14159265358979323846264;
            
                void main() {
            
                    float r = ( pnoise( colorR * ( vNormal + time ), vec3( 10.0 ) ) );
                    float g = ( pnoise( colorG * ( vNormal + time ), vec3( 10.0 ) ) );
                    float b = ( pnoise( colorB * ( vNormal + time ), vec3( 10.0 ) ) );
            
                    float n = pnoise( colorChange * ( vNormal + time ), vec3( 10.0 ) );
                    n = pow( .001, n );
            
                    //float n = 10.0 * pnoise( 5.0 * ( vNormal + time ), vec3( 10.0 ) ) * pnoise( .5 * ( vNormal + time ), vec3( 10.0 ) );
            
                    //n += .5 * pnoise( 4.0 * vNormal, vec3( 10.0 ) );
                    vec3 color = vec3( r + n, g + n, b + n );
                    gl_FragColor = vec4( color, 1.0 );
            
                } `
        } );

        // create a sphere and assign the material
        this.mesh.add(new THREE.Mesh(
            new THREE.IcosahedronGeometry( this.size, this.segmentWidth ),
            material
        ));
        
    }

    animate(){
        super.animate();
    }

}

