import {ThreeObject}  from "./ThreeObject.js";

export class PerlinNoiseThreeObject extends ThreeObject {

    type = 'Perlin Noise';

    constructor (node, config){
        super(node);
        
        this.uniforms = {
            iResolution: { value: new THREE.Vector4() },
            iTime: { value: 0 },
        };

        const customMaterial = new THREE.MeshBasicMaterial();

        customMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.iResolution = this.uniforms.iResolution;
            shader.uniforms.iTime = this.uniforms.iTime;
          
            shader.fragmentShader = `
                uniform vec2 iResolution;
                uniform float iTime;
                const float PI = 3.141527;
                
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(/void main\(\) {/, (match) => `
                vec2 hash2(vec2 p) {
                    return fract(vec2(5978.23857, 2915.98275)*sin(vec2(
                                                                    p.x*832.2388 + p.y*234.9852,
                                                                    p.x*921.7381 + p.y*498.2348
                                                                    )))*2.-1.;
                }

                float getPerlinValue(vec2 uv, float scale, float offset){
                    uv *= scale;
                    vec2 f = fract(uv);
                    vec2 m = f * f * (3.-f-f);
                    vec2 p = uv - f;
                    
                    float n = mix(
                                    mix(dot(hash2(p + offset + vec2(0,0)), f - vec2(0,0)),
                                        dot(hash2(p + offset + vec2(1,0)), f - vec2(1,0)), m.x),
                                    mix(dot(hash2(p + offset + vec2(0,1)), f - vec2(0,1)),
                                        dot(hash2(p + offset + vec2(1,1)), f - vec2(1,1)), m.x),
                                    m.y);
                    
                    return float(0.5 * n + 0.5);
                }
            ` + match);

            shader.fragmentShader = shader.fragmentShader.replace(/vec4 diffuseColor.*;/, `
                vec4 uv = (gl_FragCoord - 0.5 * iResolution.xy) / iResolution.y;

                // Time varying pixel color
                //vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
                vec3 col = 1.0 - vec3(0.98, 0.96, 0.92);
                
                vec2 circCenter = vec2(0.0, 0.0);
                if(length(circCenter - uv) < 0.5){
                    //col = vec3(1.0, 0.0, 0.0);
                    float circlePoints = 0.0;
                    for(float i = 0.0; i < 250.0; ++i){
                        vec2 randNum = hash2(vec2(i));
                        vec2 position = sin(randNum * iTime * 0.25);
                        float n = 2.0 * PI * getPerlinValue(uv + cos(iTime * 0.5), 3.0 + sin(iTime), 5.0);
                        for(float j = 0.0; j < 5.0; ++j){
                            position.x = mod(position.x + cos(n), 1.0) - 0.5;
                            position.y = mod(position.y + sin(n), 1.0) - 0.5;
                            float dist = length(uv - position);
                            circlePoints += 1.0 - smoothstep(0.009, 0.020, dist);
                        }
                    }
                    col = max(vec3(circlePoints), col);//max(vec3(circlePoints), col);
                }
            
                // Output to screen
                vec4 diffuseColor = vec4(col,1.0);    
            `);
          
        };
        // Create a plane or any geometry to apply the shader material
        const geometry = new THREE.SphereGeometry(this.size, 64, 32);
        this.mesh.add(new THREE.Mesh(geometry, customMaterial));
        
        // Set the iResolution uniform (screen resolution)
        //this.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    }

    animate(){
        this.uniforms.iTime += 1;
    }

}