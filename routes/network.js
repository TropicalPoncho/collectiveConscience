const express = require('express');
const asyncify = require('express-asyncify');
var createError = require('http-errors');
 
const app = express();
const router = asyncify(express.Router());
 

const NeuronsService = require('../services/neuronsService');
const NeuronsServiceInstance = new NeuronsService();

// GET Network
router.get('/', async (req, res, next) => {
	NeuronsServiceInstance.getAll(req.query.page).then(result => {
		console.log(result);
		res.render("network", {
			neurons: result,
			fromId: req.query.fromId
		});
	}).catch(err => {
		console.log(err)
		next(createError(500));
	});
});


//When i reach the page, create a synapse
/**
 * TODO:
 * - Check if synapse already created by cookies
 * - v2 Check with google account
 * - v3 Mejorar con socket
 
router.get('/invitation', function(req, res, next) {
  let fromId = req.query.fromId;
  if(!fromId) return next(createError(404));
  createSynapse(req, res);
});
*/

module.exports = router;
