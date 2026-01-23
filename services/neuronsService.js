const Neuron = require('../models/neurons');
const { Types } = require('mongoose');

const limit = 40;

class NeuronsService {

    /**
     * @description Attempt to create a post with the provided object
     * @param postToCreate {object} Object containing all required fields to
     * create post
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async create ( input ) {
        try{
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

    async getAll ( cursor, filters = {} ) {
        try {
            const query = Neuron.find(filters)
                .sort({ _id: 1 })
                .limit(limit + 1); // Fetch one extra to detect next cursor

            if (cursor) {
                if (!Types.ObjectId.isValid(cursor)) {
                    throw new Error('Invalid cursor');
                }
                query.where('_id').gt(new Types.ObjectId(cursor));
            }

            const result = await query.exec();
            const hasNext = result.length > limit;
            const items = hasNext ? result.slice(0, limit) : result;
            const nextCursor = hasNext ? items.at(-1)._id.toString() : null;

            return { items, nextCursor };
        } catch ( err ) {
            console.error('❌ Error in NeuronsService.getAll:', err);
            throw err;
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