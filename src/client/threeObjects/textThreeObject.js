import * as THREE from 'three';
import {ThreeObject}  from "./ThreeObject.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export class TextThreeObject extends ThreeObject  {

    static type = 'Text';

    constructor (node, config){
        super(node, false);

        const phongMaterial = new THREE.MeshPhongMaterial( { color: this.colorsArray[0], emissive: 0x000000 } );

        const loader = new FontLoader();
        let that = this;
        loader.load( 'fonts/Hypha_regular.json', function ( font ) {

            const imgTexture = new THREE.TextureLoader().load(`images/texturaEspora.jpg`, () => {
                imgTexture.colorSpace = THREE.SRGBColorSpace;
                //var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });

                imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
                imgTexture.repeat.set( 0.05, 0.05 );
                var material = new THREE.MeshBasicMaterial( { map: imgTexture } );
                /* const sprite = new THREE.Sprite(material);
    
                var imgSize = (typeof node.imgSize !== 'array' ) ? [node.imgSize, node.imgSize]: node.imgSize;
    
                sprite.scale.set(imgSize[0], imgSize[1]);
                
                that.mesh.add(sprite); */
            

                const textGeo = new TextGeometry( 'ESPORA', {
                    font: font,
                    size: 9, // Base size
                    height: 3,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.5,
                    bevelSize: 0.9,
                    bevelSegments: 5
                } );

                // Centrar la geometría usando la caja envolvente
                //textGeo.computeBoundingBox();
                //const center = textGeo.boundingBox.getCenter(new THREE.Vector3());
                var textMesh = new THREE.Mesh( textGeo, material );
                /* center.applyMatrix4(textMesh.matrixWorld);
                textMesh.updateMatrixWorld(); */

                textGeo.computeBoundingBox();
                if (textGeo.boundingBox) {
                    textGeo.translate(-textGeo.boundingBox.max.x / 2, 0, 0);
                }
                
                that.mesh.add(textMesh);
                
                return that;
            });
        } );
    }
}


