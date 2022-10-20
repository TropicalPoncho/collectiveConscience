const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defino el schema:
const neuronSchema = new Schema({
	fromId: [{type: mongoose.ObjectId}],
	/* synapses: [
		{ id: {type: mongoose.ObjectId}, distance: Number}
	], */
	name: String,
	imgPath: String,
	IP: String ,
	graphVal: Number,
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
module.exports = mongoose.model('neurons', neuronSchema);