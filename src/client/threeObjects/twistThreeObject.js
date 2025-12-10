import * as THREE from 'three';
import {ThreeObject}  from './ThreeObject.js';
import { noiseFS } from '../shaders/noise.js';

export class TwistThreeObject extends ThreeObject  {

    static type = 'Twist';

    constructor (node, config){
        super(node);

        this.uniforms = {
            uNoiseStrength: { type: "f", value: 4 },
            uNoiseDensity: { type: "f", value: 4.0 },
            uIntensity: { type: "f", value: 1.5 },
            uFrequency: { type: "f", value: 2 },
            uAmplitude: { type: "f", value: 2 },
            uBrightness: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
            uContrast: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
            uOscilation: { value: new THREE.Vector3(2, 1.0, 0) },
            uPhase: { value: new THREE.Vector3(0.3, 0.6, 0.2) }
        };

        if(node.style){
            $.extend(this.uniforms, node.style);
        }

        var material = new THREE.ShaderMaterial( {
            uniforms: { ...this.globalUniforms, ...this.uniforms },
            vertexShader: `
                ${noiseFS}

                mat3 rotation3dY(float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    
                    return mat3(
                        c, 0.0, -s,
                        0.0, 1.0, 0.0,
                        s, 0.0, c
                    );
                }
                    
                vec3 rotateY(vec3 v, float angle) {
                    return rotation3dY(angle) * v;
                }
                    
                varying vec3 vNormal;
                varying float vDistort;
                uniform float time;
                uniform float uNoiseDensity;
                uniform float uNoiseStrength;
                uniform float uFrequency;
                uniform float uAmplitude;

                void main() {

                    float distortion = pnoise( normal + time, vec3( 10.0 ) * uNoiseDensity) * uNoiseStrength; 
                    
                    vDistort = distortion; // Train goes to the fragment shader! Tchu tchuuu
                    vNormal = normal;

                    // Disturb each vertex along the direction of its normal
                    vec3 pos = position + (normal * distortion);

                    // Create a sine wave from top to bottom of the sphere
                    // To increase the amount of waves, we'll use uFrequency
                    // To make the waves bigger we'll use uAmplitude
                    float angle = sin(uv.y * uFrequency + time) * uAmplitude;
                    pos = rotateY(pos, angle);  

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                }
            `,
            fragmentShader: `
                varying float vDistort;

                uniform float uIntensity;

                uniform vec3 uBrightness;
                uniform vec3 uContrast;
                uniform vec3 uOscilation;
                uniform vec3 uPhase;
                
                vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
                    return a + b * cos(6.28318 * (c * t + d));
                }  

                void main() {
                    float distort = vDistort * uIntensity;

                    // These values are my fav combination, 
                    // they remind me of Zach Lieberman's work.
                    // You can find more combos in the examples from IQ:
                    // https://iquilezles.org/www/articles/palettes/palettes.htm
                    // Experiment with these!
                    vec3 brightness = vec3(0.5, 0.5, 0.5);
                    vec3 contrast = vec3(0.5, 0.5, 0.5);
                    vec3 oscilation = vec3(2, 1.0, 0);
                    vec3 phase = vec3(0.6, 0.2, 0.1);
                  
                    // Pass the distortion as input of cospalette
                    vec3 color = cosPalette(distort, uBrightness, uContrast, uOscilation, uPhase);

                    //vec3 color = vec3(distort);

                    gl_FragColor = vec4(color, 1.0);
                }`
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

