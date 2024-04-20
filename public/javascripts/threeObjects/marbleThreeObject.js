import {ThreeObject}  from './ThreeObject.js';

const heightMapURL = 'https://i.imgur.com/dMYV4cf.png'
const displacementMapURL = 'https://i.imgur.com/L1pqRg9.jpeg'

/**
 * Represents a 3D object with a marble texture.
 * Inherits from the ThreeObject class.
 *
 * credits to Math Rosman (https://tympanus.net/codrops/2021/08/02/magical-marbles-in-three-js/)
 * @class
 * @extends ThreeObject
 *
 * @example
 * import { MarbleThreeObject } from './MarbleThreeObject.js';
 *
 * const node = document.getElementById('canvas');
 * const config = { /* configuration options * / };
 *
 * const marbleObject = new MarbleThreeObject(node, config);
 * marbleObject.animate();
 */
export class MarbleThreeObject extends ThreeObject  {

/*     params = {
        roughness: 0.1,
        iterations: 32,
        depth: 0.6,
        smoothing: 0.2,
        colorA: '#000000',
        colorB: '#00ffaa'
    }; */

    params = {
        roughness: 0.5,
        iterations: 100,
        depth: 0.4,
        smoothing: 0.5,
        displacement: 0.8,
        colorA: '#111111',
        colorB: '#d719c7'
    };

    type = 'Marble';

    constructor (node, config){
        super(node);
        /*  var randomColorA = colorsArray[randomIntFromInterval(0,6)];
        var randomColorB = colorsArray[randomIntFromInterval(0,6)]; */

        /* var randomColorA = node.color ?? globalDefaultSettings.marbleColorA;
        var randomColorB = globalDefaultSettings.marbleColorB; */

        const geometry = new THREE.SphereGeometry(10, 64, 32);
        const material = new THREE.MeshStandardMaterial({ roughness: this.params.roughness });
        
         // Load heightmap and displacement textures
        const heightMap = new THREE.TextureLoader().load(heightMapURL);
        const displacementMap = new THREE.TextureLoader().load(displacementMapURL);
        displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping
        
        // Prevent seam introduced by THREE.LinearFilter
        heightMap.minFilter = displacementMap.minFilter = THREE.NearestFilter
        
        // Set up local uniforms object
        this.uniforms = {
            iterations: { value: this.params.iterations },
            depth: { value: this.params.depth },
            smoothing: { value: this.params.smoothing },
            colorA: { value: new THREE.Color(this.params.colorA) },
            colorB: { value: new THREE.Color(this.params.colorB) },
            heightMap: { value: heightMap },
            displacementMap: { value: displacementMap },
            displacement: { value: this.params.displacement },
        }
        
        material.onBeforeCompile = shader => {
            // Wire up local uniform references
            shader.uniforms = { ...shader.uniforms, ...this.globalUniforms, ...this.uniforms }
            
            // Add to top of vertex shader
            shader.vertexShader = `
                varying vec3 v_pos;
                varying vec3 v_dir;
            ` + shader.vertexShader
            
            // Assign values to varyings inside of main()
            shader.vertexShader = shader.vertexShader.replace(/void main\(\) {/, (match) => match + `
                v_dir = position - cameraPosition; // Points from camera to vertex
                v_pos = position;
            `)
            
            // Add to top of fragment shader
            shader.fragmentShader = `
                #define FLIP vec2(1., -1.)
                
                uniform vec3 colorA;
                uniform vec3 colorB;
                uniform sampler2D heightMap;
                uniform sampler2D displacementMap;
                uniform int iterations;
                uniform float depth;
                uniform float smoothing;
                uniform float displacement;
                uniform float time;
                
                varying vec3 v_pos;
                varying vec3 v_dir;
            ` + shader.fragmentShader
            
            // Add above fragment shader main() so we can access common.glsl.js
            shader.fragmentShader = shader.fragmentShader.replace(/void main\(\) {/, (match) => `
                /**
                 * @param p - Point to displace
                 * @param strength - How much the map can displace the point
                 * @returns Point with scrolling displacement applied
                 */
                vec3 displacePoint(vec3 p, float strength) {
                    vec2 uv = equirectUv(normalize(p));
                    vec2 scroll = vec2(time, 0.);
                    vec3 displacementA = texture(displacementMap, uv + scroll).rgb; // Upright
                                vec3 displacementB = texture(displacementMap, uv * FLIP - scroll).rgb; // Upside down
                    
                    // Center the range to [-0.5, 0.5], note the range of their sum is [-1, 1]
                    displacementA -= 0.5;
                    displacementB -= 0.5;
                    
                    return p + strength * (displacementA + displacementB);
                }
                
                /**
                 * @param rayOrigin - Point on sphere
                 * @param rayDir - Normalized ray direction
                 * @returns Diffuse RGB color
                 */
                vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
                    float perIteration = 1. / float(iterations);
                    vec3 deltaRay = rayDir * perIteration * depth;

                    // Start at point of intersection and accumulate volume
                    vec3 p = rayOrigin;
                    float totalVolume = 0.;

                    for (int i=0; i<iterations; ++i) {
                        // Read heightmap from spherical direction of displaced ray position
                        vec3 displaced = displacePoint(p, displacement);
                        vec2 uv = equirectUv(normalize(displaced));
                        float heightMapVal = texture(heightMap, uv).r;

                        // Take a slice of the heightmap
                        float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
                        float cutoff = 1. - float(i) * perIteration;
                        float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

                        // Accumulate the volume and advance the ray forward one step
                        totalVolume += slice * perIteration * 3.;
                        p += deltaRay;
                    }
                    return mix(colorA, colorB, clamp(totalVolume, 0., 1.));
                }
            ` + match)
            
            shader.fragmentShader = shader.fragmentShader.replace(/vec4 diffuseColor.*;/, `
                vec3 rayDir = normalize(v_dir);
                vec3 rayOrigin = v_pos;
                
                vec3 rgb = marchMarble(rayOrigin, rayDir);
                vec4 diffuseColor = vec4(rgb, 1.);      
            `)
        }
        
        this.mesh.add(new THREE.Mesh(geometry, material));
    }

    animate(){
        super.animate();
    }
}
