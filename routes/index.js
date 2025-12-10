var express = require('express');
var router = express.Router();

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tropical Poncho - Collective Conscience' });
}); */

/* router.get('/ar', function(req, res, next) {
  res.render('index', { title: 'Tropical Poncho - Collective Conscience', arActive: true });
}); */

router.get('/espora', function(req, res, next) {
  res.render('index', { title: 'Tropical Poncho - Espora', espora: true });
});


module.exports = router;
