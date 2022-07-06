var express = require('express');
var createError = require('http-errors');
var router = express.Router();

const mongoose = require('mongoose');
const Synapse = require('../models/synapses');

/* GET network home page. */
router.get('/', function(req, res, next) {
  //TODO: Get the network as is
  res.render('network', { title: 'Network' });
});

/* GET My Network by id */
router.get('/synapse/:id', function(req, res, next) {
  //TODO: Get the network as is
  res.render('network', { title: 'Network' });
});

router.get('/synapse', function(req, res, next) {
  let fromId = req.query.fromId;
  if(!fromId){
    createError(404);
  }
  CreateSynapse();
  res.render('network', { title: 'Network' });
});

function CreateSynapse(req){
  const synapse = new Synapse({
		fromId: req.query.fromId
	}, (err, msg) => {
		if(err){
			console.log("ERROR", err, msg);
		}
	});

	synapse.save().then(data => {
		console.log('New Synapse');
		res.render("network",{
			data: synapse
		});
	}).catch((err) => { // Try catch para atrapar posibles errores
		console.log('Error!', err);
		res.send('Error en server!');
	});
}

module.exports = router;
