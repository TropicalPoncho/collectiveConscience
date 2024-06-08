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
	nickName: String,
	nodeType: String,
	email: String,
	comentario: String,
	creationDate: {type: Date, default: Date.now()}
});

//Exporto el modelo:
module.exports = mongoose.model('neurons', neuronSchema);