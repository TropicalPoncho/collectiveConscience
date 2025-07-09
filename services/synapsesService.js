const { Synapse, synapseType } = require('../models/synapses');

const limit = 40;

// Funciones helper para manejar tipos de sinapsis
const getTypeCode = (typeName) => {
    for (const [code, name] of Object.entries(synapseType)) {
        if (name === typeName) {
            return parseInt(code);
        }
    }
    return null;
};

const getTypeName = (typeCode) => {
    return synapseType[typeCode] || null;
};

class SynapsesService {
    /**
     * @description Create an instance of SynapsesService
     */
    constructor () {
      // Create instance of Data Access layer using our desired model
    }
  
    /**
     * @description Attempt to create a synapse with the provided object
     * @param synapseToCreate {object} Object containing all required fields to
     * create synapse
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async create ( input ) {
        try{
            // Convertir nombre de tipo a código si es necesario
            let typeCode = input.type;
            if (typeof input.type === 'string') {
                typeCode = getTypeCode(input.type);
                if (!typeCode) {
                    throw new Error(`Tipo de sinapsis inválido: ${input.type}`);
                }
            }

            const synapse = new Synapse({
                source: input.source,
                target: input.target,
                dimensionId: input.dimensionId,
                type: typeCode,
                distance: input.distance ?? null,
                weight: input.weight ?? null
            }, (err, msg) => {
                if(err){
                    console.log("ERROR", err, msg);
                }
            });

            return synapse.save();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get all synapses with pagination
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    async getAll ( page, filters = {} ) {
        try {
            console.log('🔍 SynapsesService.getAll called with:', { page, filters });
            
            // Usar find() en lugar de aggregate() para consultas simples
            let query = Synapse.find();
            console.log('📊 Query created');

            // Aplicar filtros si existen
            if (Object.keys(filters).length > 0) {
                console.log('🔧 Applying filters:', filters);
                // Manejo especial para el campo 'type'
                if (filters.type && typeof filters.type === 'string') {
                    const typeCode = getTypeCode(filters.type);
                    if (!typeCode) {
                        throw new Error(`Tipo de sinapsis inválido: ${filters.type}`);
                    }
                    filters.type = typeCode;
                }
                query = query.where(filters);
            }

            query = query.sort({"creationDate": -1, "_id": 1 });
            if(page !== undefined && page != 0){
                query = query.skip(limit*page);
            }
            
            console.log('🚀 Executing query...');
            const result = await query.limit(limit).exec();
            console.log('✅ Query executed, found sasasdasd', result.length, 'synapses');
            return result;
        } catch ( err ) {
            console.error('❌ Error in getAll:', err);
            return err;
        }
    }

    /**
     * @description Get synapses by type
     * @param type {string|number} Type of synapse to filter (can be name or code)
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByType ( type , page ) {
        try {
            // Convertir nombre de tipo a código si es necesario
            let typeCode = type;
            if (typeof type === 'string') {
                typeCode = getTypeCode(type);
                if (!typeCode) {
                    throw new Error(`Tipo de sinapsis inválido: ${type}`);
                }
            }

            const query = Synapse.aggregate()
                .match({ type: typeCode })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get synapses by source (source neuron)
     * @param source {number} ID of the source neuron
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getBySource ( source , page ) {
        try {
            const query = Synapse.aggregate()
                .match({ source: source })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get synapses by target (target neuron)
     * @param target {number} ID of the target neuron
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByTarget ( target , page ) {
        try {
            const query = Synapse.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ target: target })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get synapses between two specific neurons
     * @param source {number} ID of the source neuron
     * @param target {number} ID of the target neuron
     * @returns {Promise<Array>}
     */
    getByNeurons ( source , target ) {
        try {
            const query = Synapse.aggregate()
                .match({ 
                    source: source,
                    target: target 
                })
                .sort({"creationDate": -1, "_id": 1 });

            return query.exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get all synapses for a specific neuron (both incoming and outgoing)
     * @param neuronId {number} ID of the neuron
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByNeuronId ( neuronId , page ) {
        try {
            const query = Synapse.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ 
                    $or: [
                        { source: neuronId },
                        { target: neuronId }
                    ]
                })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get synapses by dimensionId
     * @param dimensionId {number} Dimension ID to filter
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByDimensionId ( dimensionId , page ) {
        try {
            const query = Synapse.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ dimensionId: dimensionId })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }

    /**
     * @description Get synapses by dimensionId and type
     * @param dimensionId {number} Dimension ID to filter
     * @param type {string|number} Type of synapse to filter
     * @param page {number} Page number for pagination
     * @returns {Promise<Array>}
     */
    getByDimensionIdAndType ( dimensionId, type, page ) {
        try {
            // Convertir nombre de tipo a código si es necesario
            let typeCode = type;
            if (typeof type === 'string') {
                typeCode = getTypeCode(type);
                if (!typeCode) {
                    throw new Error(`Tipo de sinapsis inválido: ${type}`);
                }
            }

            const query = Synapse.aggregate()
                .addFields({
                    nOrder: {$ifNull : [ "$order" , 100 ] },
                })
                .match({ 
                    dimensionId: dimensionId,
                    type: typeCode 
                })
                .sort({"creationDate": -1, "_id": 1 });

            if(page !== undefined && page != 0){
                query.skip(limit*page);
            }

            return query.limit(limit).exec();
        } catch ( err ) {
            return err;
        }
    }
}

module.exports = SynapsesService; 