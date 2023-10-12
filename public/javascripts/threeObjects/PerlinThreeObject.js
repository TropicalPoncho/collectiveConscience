import {OrbitControls} from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ThreeObject } from "./ThreeObject.js";


export class PerlinThreeObject extends ThreeObject{

    clock = new THREE.Clock();

    type = 'Perlin';

    globalUniforms = {
        bloom: {value: 0},
        time: {value: 0},
        aspect: {value: innerWidth / innerHeight}
    };

    constructor(){
        super();
        /* bloomComposer.setSize( innerWidth, innerHeight );
            finalComposer.setSize( innerWidth, innerHeight );
            rt.setSize(innerWidth, innerHeight);
            globalUniforms.aspect.value = camera.aspect;
        */
        let cubeMap = createCubeMap();

        // <OBJECT>
        let g = new THREE.IcosahedronGeometry(1, 70);
        let localUniforms = {
            color1: {value: new THREE.Color(0xff3232)},
            color2: {value: new THREE.Color(0x0032ff)}
        }
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.125,
            metalness: 0.875,
            envMap: cubeMap,
            onBeforeCompile: shader => {
                shader.uniforms.bloom = this.globalUniforms.bloom;
                shader.uniforms.time = this.globalUniforms.time;
                shader.uniforms.color1 = localUniforms.color1;
                shader.uniforms.color2 = localUniforms.color2;
                shader.vertexShader = `
                uniform float time;
                varying vec3 rPos;
                ${document.getElementById( 'noiseFS' ).textContent}
                float noise(vec3 p){
                    return cnoise(vec4(p, time));
                }
                vec3 getPos(vec3 p){
                    return p * (4. + noise(p * 3.) * 2.);
                }
                ${shader.vertexShader}
                `.replace(
                `#include <beginnormal_vertex>`,
                `#include <beginnormal_vertex>
                
                    vec3 p0 = getPos(position);
                    
                    // https://stackoverflow.com/a/39296939/4045502
                    
                    float theta = .1; 
                    vec3 vecTangent = normalize(cross(p0, vec3(1.0, 0.0, 0.0)) + cross(p0, vec3(0.0, 1.0, 0.0)));
                    vec3 vecBitangent = normalize(cross(vecTangent, p0));
                    vec3 ptTangentSample = getPos(normalize(p0 + theta * normalize(vecTangent)));
                    vec3 ptBitangentSample = getPos(normalize(p0 + theta * normalize(vecBitangent)));
                    
                    objectNormal = normalize(cross(ptBitangentSample - p0, ptTangentSample - p0));
                    
                    ///////////////////////////////////////////////
                `
                )
                .replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                    transformed = p0;
                    rPos = transformed;
                `
                );
                //console.log(shader.vertexShader);
                shader.fragmentShader = `
                #define ss(a, b, c) smoothstep(a, b, c)
                uniform float bloom;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec3 rPos;
                ${shader.fragmentShader}
                `.replace(
                `vec4 diffuseColor = vec4( diffuse, opacity );`,
                `
                vec3 col = mix(color1, color2, ss(2., 6., length(rPos)));
                vec4 diffuseColor = vec4( col, opacity );
                `
                )
                .replace(
                `#include <dithering_fragment>`,
                `#include <dithering_fragment>
                    
                    //https://madebyevan.com/shaders/grid/
                    float coord = length(rPos) * 4.;
                    float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord) / 1.25;
                    float grid = 1.0 - min(line, 1.0);
                    //////////////////////////////////////
                    
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0), bloom);
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, col * 2., grid);
                    
                `
                );
                //console.log(shader.fragmentShader);
            }
        });
        this.mesh = new THREE.Mesh(g, m);
        // </OBJECT>

        // <BLOOM>
       /*  const params = {
            exposure: 1,
            bloomStrength: 1,
            bloomThreshold: 0,
            bloomRadius: 0
        };

        const renderScene = new RenderPass( scene, camera );

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        const bloomComposer = new EffectComposer( renderer );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( renderScene );
        bloomComposer.addPass( bloomPass );

        const finalPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                defines: {}
            } ), 'baseTexture'
        );
        finalPass.needsSwap = true;

        const finalComposer = new EffectComposer( renderer );
        finalComposer.addPass( renderScene );
        finalComposer.addPass( finalPass );
        // </BLOOM> */
    }

    animate(){
        let t = this.clock.getElapsedTime();
        this.globalUniforms.time.value = t * 0.1;
        //globalUniforms.bloom.value = 1;
        //bloomComposer.render();
        //scene.background = rt.texture;
        this.globalUniforms.bloom.value = 0;
        //finalComposer.render();
        //renderer.render(scene, camera);
    }
}

function createCubeMap(){
    let images = [];

    let c = document.createElement("canvas");
    c.width = 4;
    c.height = c.width;
    let ctx = c.getContext("2d");
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);

      for (let j = 0; j < (c.width * c.height) / 2; j++) {
        ctx.fillStyle = Math.random() < 0.5 ? "#a8a9ad" : "#646464";
        ctx.fillRect(
          Math.floor(Math.random() * c.width),
          Math.floor(Math.random() * c.height),
          2,
          1
        );
      }

      images.push(c.toDataURL());
    }
    return new THREE.CubeTextureLoader().load(images);
}