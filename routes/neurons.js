const express = require('express');
const asyncify = require('express-asyncify');
var createError = require('http-errors');
 
const app = express();
const router = asyncify(express.Router());

const NeuronsService = require('../services/neuronsService');
const NeuronsServiceInstance = new NeuronsService();

//Create Neuron
router.post('/', function(req, res, next) {
	NeuronsServiceInstance.create(req.body).then(result => {
		console.log("Neuron Created" + result);
		res.json(result);
	}).catch(err => {
		console.log(err);
		next(createError(500));
	});
});

router.get('/', function(req, res, next){
	NeuronsServiceInstance.getAll(req.query.page).then(result => {
		res.json(result);
	}).catch(err => {
		console.log(err)
		next(createError(500));
	});
});

router.get('/:order', function(req, res, next){
        const order = req.params.order;
        NeuronsServiceInstance.getByOrder(order, req.query.page).then(result => {
                res.json(result);
        }).catch(err => {
                console.log(err)
                next(createError(500));
        });
});

module.exports = router;
