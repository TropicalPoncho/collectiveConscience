import { ThreeObject } from "./ThreeObject.js";

export class ThreeObjectManager {

    static ThreeObjectsTypes;
    static defaultType = 'Lines';
    _graph;

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
    constructor(graph){
/*         import('./dynamic-import.js')
            .then((modules) => {
                for (const module of modules) {
                    const ThreeObjectClass = module.default;
                    if (ThreeObjectClass.prototype instanceof ThreeObject) {
                        this.registerType(ThreeObjectClass.type, ThreeObjectClass);
                    }
                }
            })
            .catch((error) => {
                console.error('Error importing module:', error);
            }); */
        this._graph = graph;
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
        if (typeof type !== 'string' || type.trim() === '') {
            throw new TypeError(`Invalid type parameter: ${type}`);
        }
        const ThreeObjectClass = ThreeObjectManager.ThreeObjectsTypes[type];
        if (!ThreeObjectClass) {
            throw new Error(`Invalid ThreeObject Class type: ${type}`);
        }
        try {
            if (!this._objectInstances[type]) {
                this._objectInstances[type] = []; //Initialize instances for this object
            }
            let objectInstance = new ThreeObjectClass(node);
            this._objectInstances[type].push(objectInstance);
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
        Object.values(this._objectInstances).forEach((objectsByType) => {
            objectsByType.forEach((objectInstance) => {
                objectInstance.animate();
            });
        });
    }
}

import { LinesThreeObject } from "./linesThreeObject.js";
import { ImageThreeObject } from "./imageThreeObject.js";
import { ParticlesThreeObject } from "./particlesThreeObject.js";
import { MarbleThreeObject} from "./marbleThreeObject.js";
import { NoiseThreeObject } from "./noiseThreeObject.js";
import { FireThreeObject } from "./fireThreeObject.js";
import { LightsThreeObject } from "./lightsThreeObject.js";
import { PerlinThreeObject } from "./PerlinThreeObject.js";
import { PerlinNoiseThreeObject } from "./perlinNoiseThreeObject.js";


ThreeObjectManager.registerType("Lines", LinesThreeObject);
ThreeObjectManager.registerType("Image", ImageThreeObject);
ThreeObjectManager.registerType("Particles", ParticlesThreeObject);
ThreeObjectManager.registerType("Marble", MarbleThreeObject);
ThreeObjectManager.registerType("Noise", NoiseThreeObject);
ThreeObjectManager.registerType("Fire", FireThreeObject);
ThreeObjectManager.registerType("Lights", LightsThreeObject);
ThreeObjectManager.registerType("Perlin", PerlinThreeObject);
ThreeObjectManager.registerType("Perlin Noise", PerlinNoiseThreeObject);
