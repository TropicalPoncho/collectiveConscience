const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defino los tipos de sinapsis con códigos numéricos
const synapseType = {
	1: "related",
	2: "produce",
	3: "autorOf",
	4: "componentOf"
}

//Defino el schema:
const synapseSchema = new Schema({
	source: {type: Number, required: true, ref: 'Neuron' },
	target: {type: Number, required: true, ref: 'Neuron' },
	dimensionId: { type: Number, required: true },
	type: { 
		type: Number, 
		required: true, 
		enum: Object.keys(synapseType).map(Number)
	},
	distance: { type: Number },
	weight: { type: Number },
	creationDate: {type: Date, default: Date.now }, // Corregido: Date.now sin ()
	order: { type: Number }
}, { 
	collection: 'sinapsis',
	clustered: true // Habilita Clustered Index en _id (MongoDB 5.3+)
});

// Índices recomendados basados en tus consultas:

// 1. Para getByType y getByTypeWithNeurons (filtro por type, orden por fecha)
synapseSchema.index({ type: 1, creationDate: -1, _id: 1 });

// 2. Para getBySource (filtro por source, orden por fecha)
synapseSchema.index({ source: 1, creationDate: -1, _id: 1 });

// 3. Para getByTarget (filtro por target, orden por fecha)
synapseSchema.index({ target: 1, creationDate: -1, _id: 1 });

// 4. Para getByDimensionId (filtro por dimensionId, orden por fecha)
synapseSchema.index({ dimensionId: 1, creationDate: -1, _id: 1 });

// 5. Para getByDimensionIdAndType (filtro compuesto)
synapseSchema.index({ dimensionId: 1, type: 1, creationDate: -1, _id: 1 });

//Exporto el modelo y los tipos para uso en la aplicación:
module.exports = {
	Synapse: mongoose.model('Synapse', synapseSchema),
	synapseType
};