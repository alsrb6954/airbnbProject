var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room'); 
    Book = require('../models/Book');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  if (req.session.user) {
  } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
  }
  User.findById(req.session.user, function(err, user) {
    if (err) {
      return next(err);
    }
    Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    res.render('books/index', {user: user , room: room});
  });
  });
  
});

router.get('/:id/managementBook', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    Room.find({email: user.email},function(err,rooms) {
      if (err) {
        return next(err);
      }
    res.render('books/managementBook', {rooms : rooms});
    });
  });
});

router.get('/:id/managementHost', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    Room.find({email: user.email},function(err,rooms) {
      if (err) {
        return next(err);
      }
    res.render('books/managementHost', {rooms : rooms});
    });
  });
});

router.post('/:id', function(req, res, next) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    if (err) {
      return next(err);
    }
    var newBook = new Book({
      bookEmail: req.body.bookEmail,
      hostEmail: req.body.hostEmail,
      name: req.body.name,
      title: room.title,
      city: room.city,
      fromDate: req.body.fromDate,
      toDate: req.body.fromDate,
      personner: req.body.personner,
    });
    room.reservation = "예약진행중";
    room.save(function(err) {
      if (err) {
        return next(err);
      }
    }),
    newBook.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '숙소 예약 신청을 했습니다.');
        res.redirect('/rooms/lists');
      }
    });
  });
});

module.exports = router;