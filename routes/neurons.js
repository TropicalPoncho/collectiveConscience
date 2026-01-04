const express = require('express');
const asyncify = require('express-asyncify');
const createError = require('http-errors');
 
const app = express();
app.disable("x-powered-by");
const router = asyncify(express.Router());

const NeuronsService = require('../services/neuronsService');
const NeuronsServiceInstance = new NeuronsService();
const { queryToFilters } = require('../utils/helpers');

//Create Neuron
router.post('/', function(req, res, next) {
	NeuronsServiceInstance.create(req.body).then(result => {
		console.log("Neuron Created", result);
		res.json(result);
	}).catch(err => {
		console.log(err);
		next(createError(500));
	});
});

router.get('/', function(req, res, next){
	const filters = queryToFilters(req.query);
	NeuronsServiceInstance.getAll(req.query.page, filters).then(result => {
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
                console.log(err);
                next(createError(500));
        });
});

/**
 * @route GET /neurons/dimensions
 * @desc Get all unique dimensionIds
 * @access Public
 */
router.get('/dimensions/list', function(req, res, next){
        NeuronsServiceInstance.getAllDimensionIds().then(result => {
                res.json(result);
        }).catch(err => {
                console.log(err);
                next(createError(500));
        });
});

module.exports = router;
