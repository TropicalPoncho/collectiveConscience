import {ThreeObject}  from "./ThreeObject.js";

export class ImageThreeObject extends ThreeObject  {

    type = 'Image';

    constructor (node, config){
        super();
        const imgTexture = new THREE.TextureLoader().load(`/images/${node.img}`);
        var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(node.imgSize, node.imgSize);
        
        this.mesh = sprite;
    }
}

