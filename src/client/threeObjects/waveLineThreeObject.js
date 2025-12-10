import * as THREE from 'three';
import {ThreeObject}  from './ThreeObject.js';
import { noiseFS } from '../shaders/noise.js';

export class WaveLineThreeObject extends ThreeObject  {

    static type = 'Wave Line';

    constructor (node, config){
        super(node);

        this.localUniforms = {
            weight: { type: "f", value: 3.0 },
            colorR: { type: "f", value: .9},
            colorG: { type: "f", value: .0},
            colorB: { type: "f", value: .8},
            colorChange: { type: "f", value: 2},
            u_pointsize: { type: "f", value: 2.0 },
            u_noise_freq_1: { type: "f", value: 3},
            u_noise_amp_1: { type: "f", value: .2},
            u_spd_modifier_1: { type: "f", value: 1},
            u_noise_freq_2: { type: "f", value: 2},
            u_noise_amp_2: { type: "f", value: .3},
            u_spd_modifier_2: { type: "f", value: .8},
            amplitude: { type: "f", value: .2},
            waveLength: { type: "f", value: 2},
            weedHeight: { type: "f", value: 100},
            initRotation: { type: "f", value: .2},
            speedRotation: { type: "f", value: .2},
        };

        if(node.style){
            $.extend(this.localUniforms, node.style);
        }

        this.speed = 0.009;

        var material = new THREE.ShaderMaterial( {
            uniforms: { ...this.localUniforms, ...this.globalUniforms, ...this.uniforms },
            vertexShader: `
                #define PI 3.14159265359
                uniform float time;
                uniform float u_pointsize;
                uniform float u_noise_amp_1;
                uniform float u_noise_freq_1;
                uniform float u_spd_modifier_1;
                uniform float u_noise_amp_2;
                uniform float u_noise_freq_2;
                uniform float u_spd_modifier_2;

                varying vec3 vNormal;

                // 2D Random
                float random (in vec2 st) {
                    return fract(sin(dot(st.xy,
                                        vec2(12.9898,78.233)))
                                * 43758.5453123);
                }

                // 2D Noise based on Morgan McGuire @morgan3d
                // https://www.shadertoy.com/view/4dS3Wd
                float noise (in vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);

                    // Four corners in 2D of a tile
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));

                    // Smooth Interpolation

                    // Cubic Hermine Curve.  Same as SmoothStep()
                    vec2 u = f*f*(3.0-2.0*f);
                    // u = smoothstep(0.,1.,f);

                    // Mix 4 coorners percentages
                    return mix(a, b, u.x) +
                            (c - a)* u.y * (1.0 - u.x) +
                            (d - b) * u.x * u.y;
                }

                mat2 rotate2d(float angle){
                    return mat2(cos(angle),-sin(angle),
                            sin(angle),cos(angle));
                }

                void main() {
                    gl_PointSize = u_pointsize;

                    vec3 pos = position;
                    // pos.xy is the original 2D dimension of the plane coordinates
                    pos.y += noise(pos.xy * u_noise_freq_1 + time * u_spd_modifier_1) * u_noise_amp_1;
                    // add noise layering
                    // minus u_time makes the second layer of wave goes the other direction
                    pos.y += noise(rotate2d(PI / 4.) * pos.yx * u_noise_freq_2 - time * u_spd_modifier_2 * 0.6) * u_noise_amp_2;

                    vNormal = normal;

                    vec4 mvm = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvm; 
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
            new THREE.PlaneGeometry(4, 4, 100, 32),
            material
        ));
        
    }

    animate(){
        super.animate();
    }

}

/*  orta opcion
    #define PI 3.1415926
    uniform float time;
    uniform float amplitude;
    uniform float waveLength;
    uniform vec3 pos;
    uniform float timeSpeed;
    uniform float weedHeight;
    uniform float initRotation;
    uniform float speedRotation;
    varying vec3 varPos;
    
    void main() {
    
        vec3 p = position + pos + vec3(0., .1, 0.);
        float wLength = 1. / waveLength;
        float heightNormal = position.y / weedHeight;
        float oneRound = heightNormal * PI * 2.;
        //rotation
        p.y += sin(p.x * wLength + time) * cos(p.z * wLength  + time) * amplitude;
        p.x = cos(-time * speedRotation + oneRound + initRotation) * position.x;
        p.z = sin(-time * speedRotation + oneRound + initRotation) * position.x;
        
        //swirl
        p.x += cos(-time * speedRotation + oneRound) * heightNormal * 10.;
        p.z += sin(-time * speedRotation + oneRound) * heightNormal * 10.;
        
        p += pos + vec3(0., .1, 0.);
        
        varPos = position;
        
        vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    } 



    #define PI 3.14159265359

                uniform float time;
                uniform float u_pointsize;
                uniform float u_noise_amp_1;
                uniform float u_noise_freq_1;
                uniform float u_spd_modifier_1;
                uniform float u_noise_amp_2;
                uniform float u_noise_freq_2;
                uniform float u_spd_modifier_2;

                varying vec3 vNormal;

                // 2D Random
                float random (in vec2 st) {
                    return fract(sin(dot(st.xy,
                                        vec2(12.9898,78.233)))
                                * 43758.5453123);
                }

                // 2D Noise based on Morgan McGuire @morgan3d
                // https://www.shadertoy.com/view/4dS3Wd
                float noise (in vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);

                    // Four corners in 2D of a tile
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));

                    // Smooth Interpolation

                    // Cubic Hermine Curve.  Same as SmoothStep()
                    vec2 u = f*f*(3.0-2.0*f);
                    // u = smoothstep(0.,1.,f);

                    // Mix 4 coorners percentages
                    return mix(a, b, u.x) +
                            (c - a)* u.y * (1.0 - u.x) +
                            (d - b) * u.x * u.y;
                }

                mat2 rotate2d(float angle){
                    return mat2(cos(angle),-sin(angle),
                            sin(angle),cos(angle));
                }

                void main() {
                    gl_PointSize = u_pointsize;

                    vec3 pos = position;
                    // pos.xy is the original 2D dimension of the plane coordinates
                    pos.z += noise(pos.xy * u_noise_freq_1 + time * u_spd_modifier_1) * u_noise_amp_1;
                    // add noise layering
                    // minus u_time makes the second layer of wave goes the other direction
                    pos.z += noise(rotate2d(PI / 4.) * pos.yx * u_noise_freq_2 - time * u_spd_modifier_2 * 0.6) * u_noise_amp_2;

                    vNormal = normal;

                    vec4 mvm = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvm; 
                }
*/
