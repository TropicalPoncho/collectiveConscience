var express = require('express');
var createError = require('http-errors');
var router = express.Router();

const Synapse = require('../models/synapses');
const Neuron = require('../models/neurons');

//config:
const limit = 30;

/* GET network home page. */
router.get('/', function(req, res, next) {
  renderNetwork();
});

router.get('/synapses', function(req, res, next) {
  renderNetwork(req, res);
});

//To mannually create a neuron
router.post('/neurons', function(req, res, next) {
	if(req.body.fromId){
		Neuron.countDocuments({_id: req.body.fromId}, function (err, count){ 
			if(count == 0){
				console.log('Error!', err);
				res.send('Error en server!');
			}
		});
	}
  	const neuron = new Neuron({
		name: req.body.name,
		fromId: req.body.fromId,
		graphVal: req.body.graphVal,
		imgPath: req.body.imgPath
	}, (err, msg) => {
		if(err){
			console.log("ERROR", err, msg);
		}
	});

	neuron.save().then(data => {
		console.log('Neurona creada');
		res.send(neuron._id);
	}).catch((err) => { // Try catch para atrapar posibles errores
		console.log('Error!', err);
		res.send('Error en server!');
	});
});

//When i reach the page, create a synapse
/**
 * TODO:
 * - Check if synapse already created by cookies
 * - v2 Check with google account
 * - v3 Mejorar con socket
 */
router.get('/invitation', function(req, res, next) {
  let fromId = req.query.fromId;
  if(!fromId) return next(createError(404));
  createSynapse(req, res);
});

function createSynapse(req, res){
	
  	const neuron = new Neuron({
		fromId: req.query.fromId
	}, (err, msg) => {
		if(err){
			console.log("ERROR", err, msg);
		}
	});

	neuron.save().then(data => {
		console.log('New Synapse ' + data.id);
    	renderNetwork(req, res);
	}).catch((err) => { // Try catch para atrapar posibles errores
		console.log('Error al crear synapsis!', err);
		res.send('Error en server!');
	});
}

function renderNetwork(req, res, lastSynapse = null){
  const query = Neuron.find();
  if(lastSynapse){ //if lastSynapse informed
    query.where('creationDate').lt(lastSynapse.creationDate); //Get the network from here
  }
  var page = req.query.page;
  if(page !== undefined){
    query.skip(limit*page);
  }
  query.limit(limit).exec(function (err,result) {
    res.render("network",{
      neurons: result
    });
  });
}

module.exports = router;
