var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room');
    Opinion = require('../models/Opinion');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  res.render('reviews/index');
});


module.exports = router;