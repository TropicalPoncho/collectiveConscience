const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defino los tipos de neuronas con códigos numéricos
const neuronType = {
	1: "artist",
	2: "entity",
	3: "artwork",
	4: "concept"
}

//Defino el schema:
const neuronSchema = new Schema({
	id: Number,
	dimensionId: Number,
	name: String,
	imgPath: String,
	type: String,
	order: Number,
	graphVal: Number,
	nickName: String,
	neuronType:  { 
		type: Number, 
		enum: Object.keys(neuronType).map(Number),
		default: 1
	},
	userId: Number,
	comentario: String,
	creationDate: {type: Date, default: Date.now()}
});

//Exporto el modelo:
module.exports = mongoose.model('neurons', neuronSchema);