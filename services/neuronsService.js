const Neuron = require('../models/neurons');

const limit = 40;

class NeuronsService {
    /**
     * @description Create an instance of PostService
     */
    constructor () {
      // Create instance of Data Access layer using our desired model
      //this.MongooseServiceInstance = new MongooseService( PostModel );
    }
  
    /**
     * @description Attempt to create a post with the provided object
     * @param postToCreate {object} Object containing all required fields to
     * create post
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async create ( input ) {
        try{
            /* var fromId;
            //Si se informa un fromId
            if(input.fromId){ //Comprueba si el id es valido
                fromId = input.fromId;
            }else if(input.fromNickName){ //Si no, busca el nickName
                var fromNeuron = await Neuron.findOne({nickName: input.fromNickName},'_id').exec();
                if(!fromNeuron){
                    console.log(input.fromNickName + " doesn't exists");
                    //throw new Error(input.fromNickName + " doesn't exists");
                }
                fromId = fromNeuron._id;
            } */

            const neuron = new Neuron({
                //name: input.name,
                //fromId: fromId,
                nickName: input.nickName ?? null,
                //graphVal: input.graphVal,
                //imgPath: input.imgPath,
                email: input.email,
                comentario: input.comentario
            }, (err, msg) => {
                if(err){
                    console.log("ERROR", err, msg);
                }
            });

            return neuron.save();
        } catch ( err ) {
            return err;
        }
    }

    /* getAll ( page , lastSynapse = null) {
        try {
            const query = Neuron.find();
            if(lastSynapse){ //if lastSynapse informed
                query.where('creationDate').lt(lastSynapse.creationDate); //Get the network from here
            }
            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }
            
            return query.limit(limit).exec();
            //const result = await this.MongooseServiceInstance.create( postToCreate );
        } catch ( err ) {
            return err;
        }
    } */

    getAll ( page, filters = {} ) {
        try {
            const query = Neuron.aggregate();
            query.addFields({
                nOrder: {$ifNull : [ "$order" , 100 ] },
            });

            // Aplicar filtros si existen
            if (Object.keys(filters).length > 0) {
                query.match(filters);
            }

            query.sort({"nOrder":1, "_id": 1 })
            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }
            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    getByOrder ( order , page ) {
        try {
            const query = Neuron.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ order: order })
                .sort({"nOrder":1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get neurons by dimensionId
     * @param dimensionId {number} Dimension ID to filter
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByDimensionId ( dimensionId , page ) {
        try {
            const query = Neuron.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ dimensionId: dimensionId })
                .sort({"nOrder":1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get neurons by dimensionId and order
     * @param dimensionId {number} Dimension ID to filter
     * @param order {number} Order to filter
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByDimensionIdAndOrder ( dimensionId, order, page ) {
        try {
            const query = Neuron.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ 
                    dimensionId: dimensionId,
                    order: order 
                })
                .sort({"nOrder":1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get all unique dimensionIds
     * @returns {Promise<Array>}
     */
    getAllDimensionIds () {
        try {
            return Neuron.aggregate()
                .group({
                    _id: "$dimensionId",
                    count: { $sum: 1 }
                })
                .sort({ "_id": 1 })
                .exec();
        } catch ( err ) {
            return err;
        }
    }
}

module.exports = NeuronsService;