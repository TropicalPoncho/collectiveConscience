const Neuron = require('../models/neurons');

const limit = 30;

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
            //Si se informa un fromId
            if(input.fromId){ //Comprueba si el id es valido
                Neuron.countDocuments({_id: input.fromId}, function (err, count){ 
                    if(err || count == 0){
                        console.log('Error!', err);
                        return err;
                    }
                });
            }

            const neuron = new Neuron({
                name: input.name,
                fromId: input.fromId,
                graphVal: input.graphVal,
                imgPath: input.imgPath
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

    getAll ( page , lastSynapse = null) {
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
    }
}

module.exports = NeuronsService;