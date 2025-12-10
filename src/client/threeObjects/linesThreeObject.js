import * as THREE from 'three';
import {ThreeObject}  from "./ThreeObject.js";

export class LinesThreeObject extends ThreeObject {

    static type = 'Lines';

    constructor (node, config){
        super(node);
        var uniformColor = node.color ?? colorsArray[2];
        let uniforms = {
            amplitude: { value: 7.0 },
            opacity: { value: 0.3 },
            color: { value: new THREE.Color( uniformColor ) }
        };
        //const geometry = new THREE.SphereGeometry( node.val , 32, 16 );
        const geometry = new THREE.IcosahedronGeometry(this.size, this.segmentWidth);

        const vertexShader = `
            uniform float amplitude;
            attribute vec3 displacement;
            attribute vec3 customColor;
            varying vec3 vColor;
            void main() {
                vec3 newPosition = position + amplitude * displacement;
                vColor = customColor;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
            }
        `;

        const fragmentShader = `
            uniform vec3 color;
            uniform float opacity;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4( vColor * color, opacity );
            }
        `;

        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true
        } );
        const count = geometry.attributes.position.count;

        const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
        geometry.setAttribute( 'displacement', displacement );

        const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
        geometry.setAttribute( 'customColor', customColor );

        const color = new THREE.Color( 0xffffff );

        for ( let i = 0, l = customColor.count; i < l; i ++ ) {
            color.setHSL( i / l, 0.5, 0.5 );
            color.toArray( customColor.array, i * customColor.itemSize );
        }
        this.mesh.add(new THREE.Line( geometry, shaderMaterial ));
    }

}
