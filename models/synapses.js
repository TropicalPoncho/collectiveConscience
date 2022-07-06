import { Schema as _Schema, model, SchemaTypes } from 'mongoose';
const Schema = _Schema;

//Defino el schema:
const synapseSchema = new Schema({
	fromId: {type: ObjectId, required: true},
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
export default model('synapses', synapseSchema);