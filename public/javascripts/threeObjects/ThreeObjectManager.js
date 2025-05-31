import { ThreeObject } from "./ThreeObject.js";


export class ThreeObjectManager {

    static ThreeObjectsTypes;
    static defaultType = 'Lines';

    static animationTypes = [
        'All','Hover'
    ];
    
    animationType = ThreeObjectManager.animationTypes[0]; 
    objectToAnimate;

    /**
     * The ThreeObjectFactory class is responsible for creating and managing instances of Three.js objects.
     * It allows for the creation of objects of different types and provides a way to animate these objects.
     * 
     * @example
     * const factory = new ThreeObjectFactory();
     * 
     * // Create a Three.js object
     * const object = factory.createObject({ type: 'Cube' });
     * 
     * // Animate the objects
     * factory.animate();
     */
    constructor(properties){
        Object.assign(this, properties);
        
        if(!ThreeObjectManager.animationTypes.includes(this.animationType)){
            throw new Error(`The Animation type is not valid.`);
        }
        if(!ThreeObjectManager.defaultType){
            throw new Error(`There is no default type defined, define one!`);
        }
        
    }
    
    static registerType(type, classReference, isDefault = false) {
        if (!ThreeObjectManager.ThreeObjectsTypes) {
            ThreeObjectManager.ThreeObjectsTypes = {};
        }
        
        ThreeObjectManager.ThreeObjectsTypes[type] = classReference;
        
        if(isDefault){
            if(!ThreeObjectManager.defaultType){
                ThreeObjectManager.defaultType = type;
            }else{
                throw new Error(`There can be only 1 defaultType: ${ThreeObjectManager.defaultType}`);
            }
        }
    }

    static getTypes() {
        return ThreeObjectManager.ThreeObjectsTypes;
    }

    /**
     * Keeps track of all instances of objects created.
     */
    _objectInstances = {};

    /**
     * Creates a Three.js object of the specified type.
     * 
     * @param {Object} node - The node data.
     * @param {string} node.type - The type of the Three.js object to create.
     * @returns {Object} - The created Three.js object.
     * @throws {TypeError} - If the specified type is not a string or is empty.
     * @throws {Error} - If the specified type is invalid.
     */
    createObject(node){
        let type = node.type ?? ThreeObjectManager.defaultType; //if type not defined, i get first //TODO: define a default type
        if (typeof type !== 'string' || type.trim() === '' ) {
            throw new TypeError(`Invalid type parameter: ${type}`);
        }
        const ThreeObjectClass = ThreeObjectManager.ThreeObjectsTypes[type];
        if (!ThreeObjectClass) {
            throw new Error(`Invalid ThreeObject Class type: ${type}`);
        }
        try {
/*             if (!this._objectInstances[type]) {
                this._objectInstances[type] = []; //Initialize instances for this object
            } */
            let objectInstance = new ThreeObjectClass(node);
            this._objectInstances[node.id] = objectInstance;

            console.log(this._objectInstances);
            return objectInstance.mesh;
        } catch (error) {
            console.log(error);
          // Handle error during instantiation
        }
    }

    /**
     * Executes animation for each object created.
     */
    animate() {
        if(this.animationType == ThreeObjectManager.animationTypes[0]){
            Object.values(this._objectInstances).forEach((objectInstance) => {
                objectInstance.animate();
            });
        }else{
            if(this.objectToAnimate)
                this._objectInstances[this.objectToAnimate].animate();
        }
        
    }
}
import { LinesThreeObject } from "./linesThreeObject.js";
import { ImageThreeObject } from "./imageThreeObject.js";
import { ParticlesThreeObject } from "./particlesThreeObject.js";
import { MarbleThreeObject } from "./marbleThreeObject.js";
import { NoiseThreeObject } from "./noiseThreeObject.js";
import { FireThreeObject } from "./fireThreeObject.js";
import { LightsThreeObject } from "./lightsThreeObject.js";
import { TwistThreeObject } from "./twistThreeObject.js";
import { PerlinThreeObject } from "./perlinThreeObject.js";
import { PerlinNoiseThreeObject } from "./perlinNoiseThreeObject.js";
import { WaveLineThreeObject } from "./waveLineThreeObject.js";
import { TextThreeObject } from "./textThreeObject.js";
import { SimpleTextThreeObject } from "./simpleTextThreeObject.js";
import { LinkThreeObject } from "./linkThreeObject.js";
//import { LikeFireThreeObject } from "./LikeFireThreeObject.js";
//ThreeObjectManager.registerType('Lines', LinesThreeObject, true);
ThreeObjectManager.registerType('Image', ImageThreeObject);
ThreeObjectManager.registerType('Particles', ParticlesThreeObject);
ThreeObjectManager.registerType('Marble', MarbleThreeObject);
ThreeObjectManager.registerType('Noise', NoiseThreeObject);
ThreeObjectManager.registerType('Fire', FireThreeObject);
ThreeObjectManager.registerType('Lights', LightsThreeObject);
ThreeObjectManager.registerType('Twist', TwistThreeObject);
ThreeObjectManager.registerType('Perlin', PerlinThreeObject);
ThreeObjectManager.registerType('Perlin Noise', PerlinNoiseThreeObject);
ThreeObjectManager.registerType('Wave Line', WaveLineThreeObject);
ThreeObjectManager.registerType('Text', TextThreeObject);
ThreeObjectManager.registerType('SimpleText', SimpleTextThreeObject);
ThreeObjectManager.registerType('SinLink', LinkThreeObject);
//ThreeObjectManager.registerType('LikeFire', LikeFireThreeObject);
