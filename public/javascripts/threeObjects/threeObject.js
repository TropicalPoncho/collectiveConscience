var threeObjects = [];
class ThreeObject {
    static _objectInstances = [];

    constructor(type, node, config){
        var objectInstance = new threeObjects[type](node,config);
        this._objectInstances[type].push(objectInstance); 

        return objectInstance;
    }

    animate(){
        //Hago nada
    }

    //Executes animation for each object created.
    static animate(){
        _objectInstances.array.forEach(objectsByType => {
            objectsByType.forEach((objectInstance) => { objectInstance.animate(); });
        });
    }

}

export { ThreeObject, threeObjects};