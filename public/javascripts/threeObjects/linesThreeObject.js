import {ThreeObject}  from "./ThreeObject.js";

export class LinesThreeObject extends ThreeObject {

    type = 'Lines';

    constructor (node, config){
        super(node);
        var uniformColor = node.color ?? colorsArray[2];
        let uniforms = {
            amplitude: { value: 7.0 },
            opacity: { value: 0.3 },
            color: { value: new THREE.Color( uniformColor ) }
        };
        //const geometry = new THREE.SphereGeometry( node.val , 32, 16 );
        const geometry = new THREE.IcosahedronGeometry(10, 5);

        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
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