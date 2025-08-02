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
	source: {type: Number, required: true},
	target: {type: Number, required: true},
	networkId: { type: Number },
	dimensionId: { type: Number },
	type: { 
		type: Number, 
		enum: Object.keys(synapseType).map(Number),
		default: 1
	},
	distance: { type: Number },
	weight: { type: Number },
	creationDate: {type: Date, default: Date.now()}
}, { collection: 'sinapsis' });

//Exporto el modelo y los tipos para uso en la aplicación:
module.exports = {
	Synapse: mongoose.model('Synapse', synapseSchema),
	synapseType
};