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
            throw new TypeError(`Invalid type parameter: ${type} ${node.id}`);
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
            if (objectInstance.type === "SinLink") {
                return objectInstance;
            }
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
        //Asks if the animation type is "All" so it animates all objects, if not, it animates the one selected
        if(this.animationType == ThreeObjectManager.animationTypes[0]){
            Object.values(this._objectInstances).forEach((objectInstance) => {
                // Solo animar si no es un link (los links se animan separadamente)
                if (objectInstance.type !== "SinLink") {
                    objectInstance.animate();
                }
            });
        }else{
            if(this.objectToAnimate && this._objectInstances[this.objectToAnimate]) {
                this._objectInstances[this.objectToAnimate].animate();
            }
        }
        
    }

    animateLinks(){
        // Recorre todas las instancias y anima solo las que sean de tipo "SinLink" (link)
        Object.values(this._objectInstances).forEach((objectInstance) => {
            if (objectInstance.type === "SinLink") {
                objectInstance.animate();
            }
        });
    }

    /**
     * Libera recursos de objetos Three.js que ya no se usan
     * @param {Array} nodeIdsToKeep - Array de IDs de nodos a mantener
     */
    disposeUnusedObjects(nodeIdsToKeep = []) {
        const idsToKeep = new Set(nodeIdsToKeep);
        const idsToRemove = [];

        // Identificar objetos a eliminar
        Object.keys(this._objectInstances).forEach(id => {
            if (!idsToKeep.has(id)) {
                idsToRemove.push(id);
            }
        });

        // Disponer y eliminar objetos
        idsToRemove.forEach(id => {
            const objectInstance = this._objectInstances[id];
            if (objectInstance) {
                // Disponer geometría y material si existen
                if (objectInstance.mesh) {
                    this._disposeMesh(objectInstance.mesh);
                }
                delete this._objectInstances[id];
            }
        });

        console.log(`Liberados ${idsToRemove.length} objetos. Quedan ${Object.keys(this._objectInstances).length}`);
    }

    /**
     * Libera recursivamente un mesh y sus hijos
     * @private
     */
    _disposeMesh(mesh) {
        if (!mesh) return;

        // Disponer hijos recursivamente
        if (mesh.children && mesh.children.length > 0) {
            mesh.children.forEach(child => this._disposeMesh(child));
        }

        // Disponer geometría
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        // Disponer material(es)
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(material => this._disposeMaterial(material));
            } else {
                this._disposeMaterial(mesh.material);
            }
        }
    }

    /**
     * Libera un material y sus texturas
     * @private
     */
    _disposeMaterial(material) {
        if (!material) return;

        // Disponer texturas
        Object.keys(material).forEach(prop => {
            if (material[prop] && material[prop].isTexture) {
                material[prop].dispose();
            }
        });

        material.dispose();
    }

    /**
     * Limpia todos los objetos
     */
    disposeAll() {
        Object.values(this._objectInstances).forEach(objectInstance => {
            if (objectInstance.mesh) {
                this._disposeMesh(objectInstance.mesh);
            }
        });
        this._objectInstances = {};
        console.log('Todos los objetos Three.js han sido liberados');
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
import { CrossedLinesThreeObject } from "./crossedLinesThreeObject.js";
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
ThreeObjectManager.registerType('CrossedLines', CrossedLinesThreeObject);
//ThreeObjectManager.registerType('LikeFire', LikeFireThreeObject);
