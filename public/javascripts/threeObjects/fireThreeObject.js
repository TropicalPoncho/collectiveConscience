import {ThreeObject}  from './ThreeObject.js';

export class FireThreeObject extends ThreeObject  {

    type = 'Fire';

    constructor (node, config){
        super();
        material = new THREE.ShaderMaterial( {
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        } );

        // create a sphere and assign the material
        this.mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry( 20, 4 ),
            material
        );
        
    }

}
