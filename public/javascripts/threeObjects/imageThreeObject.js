import {ThreeObject}  from "./ThreeObject.js";

export class ImageThreeObject extends ThreeObject  {

    type = 'Image';

    constructor (node, config){
        super(node, false);
        const imgTexture = new THREE.TextureLoader().load(`images/${node.img}`, () => {
            imgTexture.colorSpace = THREE.SRGBColorSpace;
            var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
            const sprite = new THREE.Sprite(material);

            var imgSize = (typeof node.imgSize !== 'array' ) ? [node.imgSize, node.imgSize]: node.imgSize;

            sprite.scale.set(imgSize[0], imgSize[1]);
            
            this.mesh.add(sprite);
            return this;
        });
    }
}

