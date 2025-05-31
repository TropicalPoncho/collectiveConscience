import {ThreeObject}  from './ThreeObject.js';

export class LinkThreeObject extends ThreeObject  {

    type = 'SinLink';

    constructor (node, config){
        super(node);

        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 5, opacity: 1, transparent: true });

        // create a sphere and assign the material
        this.mesh = new THREE.Line(geometry, material);
        
        //this.mesh.material.color.set(0x00ff00);
    }

    animate(start, end){
        super.animate();

    }

}
