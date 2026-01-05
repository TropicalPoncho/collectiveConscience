import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import {ThreeObject}  from "./ThreeObject.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export class TextThreeObject extends ThreeObject  {

    static type = 'Text';

    constructor (node, config){
        super(node, false);

        const loader = new FontLoader();
        loader.load('fonts/Hypha_regular.json', (font) => {
            const imgTexture = new THREE.TextureLoader().load('images/texturaEspora.jpg', () => {
                imgTexture.colorSpace = THREE.SRGBColorSpace;
                imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
                imgTexture.repeat.set(0.05, 0.05);
                const material = new THREE.MeshBasicMaterial({ map: imgTexture });

                const textGeo = new TextGeometry('ESPORA', {
                    font: font,
                    size: 9, // Base size
                    height: 3,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.5,
                    bevelSize: 0.9,
                    bevelSegments: 5
                });

                // Centrar la geometría usando la caja envolvente
                const textMesh = new THREE.Mesh(textGeo, material);

                textGeo.computeBoundingBox();
                if (textGeo.boundingBox) {
                    textGeo.translate(-textGeo.boundingBox.max.x / 2, 0, 0);
                }
                
                this.mesh.add(textMesh);
            });
        });
    }
}


