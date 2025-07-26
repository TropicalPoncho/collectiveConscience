const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defino el schema:
const neuronSchema = new Schema({
	id: Number,
	dimensionId: Number,
	name: String,
	imgPath: String,
	order: Number,
	graphVal: Number,
	nickName: String,
	neuronType: String,
	userId: Number,
	comentario: String,
	creationDate: {type: Date, default: Date.now()}
});

//Exporto el modelo:
module.exports = mongoose.model('neurons', neuronSchema);