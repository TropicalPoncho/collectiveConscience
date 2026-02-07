import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import {ThreeObject}  from "./ThreeObject.js";

export class LinesThreeObject extends ThreeObject {

    static type = 'Lines';

    constructor (node, config){
        super(node);

        const uniformColor = node.color ?? ThreeObject.colorsArray[2];
        const uniforms = {
            amplitude: { value: 7 },
            opacity: { value: 0.3 },
            color: { value: new THREE.Color(uniformColor) }
        };

        const detail = Math.max(1, Math.min(3, this.segmentWidth || 1)); // reduce subdivisiones
        const geometryKey = `lines-${this.size}-${detail}`;
        const geometry = ThreeObject.getSharedGeometry(geometryKey, () => {
            const geo = new THREE.IcosahedronGeometry(this.size, detail);
            const count = geo.attributes.position.count;

            const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
            geo.setAttribute('displacement', displacement);

            const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
            geo.setAttribute('customColor', customColor);

            const color = new THREE.Color(0xffffff);
            for (let i = 0, l = customColor.count; i < l; i++) {
                color.setHSL(i / l, 0.5, 0.5);
                color.toArray(customColor.array, i * customColor.itemSize);
            }
            return geo;
        });

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

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true
        });

        this.mesh.add(new THREE.Line( geometry, shaderMaterial ));
    }
}
