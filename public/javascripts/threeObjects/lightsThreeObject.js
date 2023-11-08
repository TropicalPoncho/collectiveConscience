import {ThreeObject}  from './ThreeObject.js';

export class LightsThreeObject extends ThreeObject  {

    type = 'Lights';

    constructor (node, config){
        super(node);

        this.localUniforms = {
            tExplosion: { type: "t", value: new THREE.TextureLoader().load( '/images/explosion.png' ) },
            weight: { type: "f", value: 9.0 }
        };

        this.speed = 0.009;

        var material = new THREE.ShaderMaterial( {
            uniforms: { ...this.globalUniforms, ...this.uniforms },
            vertexShader: `
                ${document.getElementById( 'noiseFS' ).textContent}
                varying vec3 vNormal;
                uniform float time;
                uniform float weight;

                void main() {

                    float f = 10.0 * pnoise( normal + time, vec3( 10.0 ) );
                    vNormal = normal;
                    vec4 pos = vec4( position + f * normal, 1.0 );
                    gl_Position = projectionMatrix * modelViewMatrix * pos;

                }
            `,
            fragmentShader: `	
                ${document.getElementById( 'noiseFS' ).textContent}
                varying vec3 vNormal;
                uniform sampler2D tShine;
                uniform float time;
            
                float PI = 3.14159265358979323846264;
            
                void main() {
            
                    float r = ( pnoise( .75 * ( vNormal + time ), vec3( 10.0 ) ) );
                    float g = ( pnoise( .8 * ( vNormal + time ), vec3( 10.0 ) ) );
                    float b = ( pnoise( .9 * ( vNormal + time ), vec3( 10.0 ) ) );
            
                    float n = pnoise( 1.5 * ( vNormal + time ), vec3( 10.0 ) );
                    n = pow( .001, n );
            
                    //float n = 10.0 * pnoise( 5.0 * ( vNormal + time ), vec3( 10.0 ) ) * pnoise( .5 * ( vNormal + time ), vec3( 10.0 ) );
            
                    //n += .5 * pnoise( 4.0 * vNormal, vec3( 10.0 ) );
                    vec3 color = vec3( r + n, g + n, b + n );
                    gl_FragColor = vec4( color, 1.0 );
            
                } `
        } );

        // create a sphere and assign the material
        this.mesh.add(new THREE.Mesh(
            new THREE.IcosahedronGeometry( 10, 10 ),
            material
        ));
        
    }

    animate(){
        super.animate();
    }

}
