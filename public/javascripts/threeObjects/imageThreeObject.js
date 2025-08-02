import {ThreeObject}  from "./ThreeObject.js";
import { GLOBAL_DEFAULT_SETTINGS } from '../graph/constants.js';

export class ImageThreeObject extends ThreeObject  {

    type = 'Image';
    imgSize = GLOBAL_DEFAULT_SETTINGS.imgSize;

    constructor (node, config){
        super(node, false);

        // Calcula el tamaño de la imagen en base al nodeSize
        const getImageSize = (node, factor = 1) => {
            const size = node.nodeSize || GLOBAL_DEFAULT_SETTINGS.nodeSize || 20;
            return [size * factor, size * factor];
        };

        const imgTexture = new THREE.TextureLoader().load(`images/${node.img}`, () => {
            imgTexture.colorSpace = THREE.SRGBColorSpace;
            var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
            const sprite = new THREE.Sprite(material);

            // Usa el tamaño calculado en vez de imgSize
            var imgSize = Array.isArray(node.imgSize)
                ? node.imgSize
                : getImageSize(node, 2.1); // factor 1 = igual que el nodo

            sprite.scale.set(imgSize[0], imgSize[1]);
            
            this.mesh.add(sprite);
            return this;
        },
        undefined,
        (err) => { console.error('Error cargando imagen', err); }
        );
    }
}

