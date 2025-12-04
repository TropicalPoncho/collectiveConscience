import {ThreeObject}  from './ThreeObject.js';

export class FireThreeObject extends ThreeObject  {

    static type = 'Fire';

    constructor (node, config){
        super(node);

        this.localUniforms = {
            tExplosion: { type: "t", value: new THREE.TextureLoader().load( '/images/explosion.png' ) },
            weight: { type: "f", value: 10.0 }
        };

        this.speed = 0.009;

        var material = new THREE.ShaderMaterial( {
            uniforms: {...this.globalUniforms, ...this.localUniforms},
            vertexShader: `
                ${document.getElementById( 'noiseFS' ).textContent}
                varying vec2 vUv;
                varying vec3 vReflect;
                varying vec3 pos;
                varying float ao;
                uniform float time;
                uniform float weight;
                varying float d;

                float stripes( float x, float f) {
                    float PI = 3.14159265358979323846264;
                    float t = .5 + .5 * sin( f * 2.0 * PI * x);
                    return t * t - .5;
                }

                float turbulence( vec3 p ) {
                    float w = 100.0;
                    float t = -.5;
                    for (float f = 1.0 ; f <= 10.0 ; f++ ){
                        float power = pow( 2.0, f );
                        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
                    }
                    return t;
                }

                void main() {

                    vUv = uv;

                    vec4 mPosition = modelMatrix * vec4( position, 1.0 );
                    vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
                    vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );

                    pos = position;
                    float noise = turbulence( .5 * normal + time );

                    float displacement = - weight * ( 10.0 *  -.10 * noise );
                    displacement += 5.0 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );

                    ao = noise;
                    //ao = turbulence( .5 * normal + time + 10. * sin( .001 * time ) );
                    vec3 newPosition = position + normal * vec3( displacement );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

                }
            `,
            fragmentShader: `	
                varying vec2 vUv;
                uniform sampler2D tExplosion;
                varying vec3 vReflect;
                varying vec3 pos;
                varying float ao;
                varying float d;
                float PI = 3.14159265358979323846264;
            
                float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}
            
                void main() {
            
                    float v = ( 1.1 * ao + 1. ) / 1.1;
                    vec3 color = texture2D( tExplosion, vec2( .5, v + .01 * random(vec3(12.9898,78.233,151.7182), 0. ) ) ).rgb;
                    gl_FragColor = vec4( color.rgb, 1.0 );
            
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
