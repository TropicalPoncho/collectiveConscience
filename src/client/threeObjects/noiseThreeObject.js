import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import {ThreeObject}  from './ThreeObject.js';

import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js'; 

export class NoiseThreeObject extends ThreeObject  {

    static type = 'Noise';

    constructor (node, config){
        super(node);
        new HDRCubeTextureLoader()
        .setPath( 'https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/pisaHDR/' )
        .load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
            function ( hdrTexture ) { 

                const widthSegments = Math.max(8, Math.min(32, this.segmentWidth || 16));
                const heightSegments = Math.max(6, Math.min(24, this.segmentHeight || 12));
                const geometryKey = `noise-${this.size}-${widthSegments}-${heightSegments}`;
                const geometry = ThreeObject.getSharedGeometry(geometryKey, () => new THREE.SphereGeometry(
                    this.size,
                    widthSegments,
                    heightSegments
                ));

                // left top
                let material = new MeshPhysicalNodeMaterial();

                this.mesh.add(new THREE.Mesh( geometry, material ));
            }); 
    }

}

