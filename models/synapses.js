const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defino el schema:
const synapseSchema = new Schema({
        fromId: {type: mongoose.ObjectId, required: true},
        toId: {type: mongoose.ObjectId, required: true},
	type: String,
	IP: String ,
	location: {
		latitud: String,
		longitud: String,
		normalX: Number,
		normalY: Number,
		normalZ: Number
	},
	creationDate: {type: Date, default: Date.now()}
});

//Exporto el modelo:
module.exports = mongoose.model('synapses', synapseSchema);