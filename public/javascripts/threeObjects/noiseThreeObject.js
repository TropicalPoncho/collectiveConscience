import {ThreeObject}  from './ThreeObject.js';

import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js'; 

export class NoiseThreeObject extends ThreeObject  {

    type = 'Noise';

    constructor (node, config){
        super(node);
        new HDRCubeTextureLoader()
        .setPath( 'https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/pisaHDR/' )
        .load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
            function ( hdrTexture ) { 

                const geometry = new THREE.SphereGeometry(
                    this.size,
                    this.segmentWidth,
                    this.segmentHeight
                );

                //const offsetNode = timerLocal();
                //const customUV = add( mul( normalWorld, 10 ), offsetNode );

                // left top

                let material = new MeshPhysicalNodeMaterial();
                //material.colorNode = mx_noise_vec3( customUV );

                this.mesh.add(new THREE.Mesh( geometry, material ));
            }); 
    }

    animate(){
    }
}
