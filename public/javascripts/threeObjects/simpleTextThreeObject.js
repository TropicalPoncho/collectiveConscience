import {ThreeObject}  from "./ThreeObject.js";
import SpriteText from "//unpkg.com/three-spritetext/dist/three-spritetext.mjs";

export class SimpleTextThreeObject extends ThreeObject  {

    type = 'SimpleText';

    constructor (node, config){
        super(node, false);

        const sprite = new SpriteText(node.name);
        sprite.material.depthWrite = false; // make sprite background transparent
        sprite.color = node.color;
        sprite.textHeight = node.val;
                
        this.mesh.add(sprite);
        
        return this;
    }
}

