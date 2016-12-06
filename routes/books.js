var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room'); 
    Book = require('../models/Book');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  if (req.user) {
  } else {
      req.flash('danger', '로그인이 필요합니다.');
      return res.redirect('/signin');
  }
  User.findById(req.user, function(err, user) {
    if (err) {
      return next(err);
    }
    Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    if(room.reservation == "예약가능"){
      res.render('books/index', {user: user , room: room});
    } else{
      req.flash('danger', '이미 예약중입니다');
      res.redirect('back');
    }
    });
  });  
});

router.get('/:id/managementBook', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    Book.find({bookEmail: user.email},function(err,books) {
      if (err) {
        return next(err);
      }
    res.render('books/managementBook', {books: books});
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
    res.render('books/managementHost', {rooms: rooms});
    });
  });
});

router.get('/:id/show', function(req, res, next) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    Book.findOne({title: room.title},function(err, book) {
      if (err) {
        return next(err);
      }
      res.render('books/show', {book: book, room: room});
    });
  });
});

router.get('/:id/profile', function(req, res, next) {
  Book.findById(req.params.id, function(err, book) {
    if (err) {
      return next(err);
    }
    User.findOne({email: book.bookEmail},function(err, user){
      if (err) {
        return next(err);
      }
      res.render('users/show', {user: user});
    });
  });
});

router.put('/:id/accept', function(req,res,next){
  Room.findById({_id: req.params.id}, function(err, room){
     if (err) {
      return next(err);
    }
    Book.findOne({title: room.title}, function(err, book){
      room.reservation ="예약완료";
      book.reservation = room.reservation;
      room.save(function(err) {
        if (err) {
          return next(err);
        }
        book.save(function(err) {
          if (err) {
            return next(err);
          }      
            req.flash('success', '예약을 수락 했습니다');
            res.redirect('back');
        });
      });
    });
  });
});

router.put('/:id/refuse', function(req,res,next){
  Room.findById({_id: req.params.id}, function(err, room){
     if (err) {
      return next(err);
    }
    Book.findOneAndRemove({title: room.title}, function(err, book){
      room.reservation ="예약가능";
      book.reservation = room.reservation;
      room.save(function(err) {
        if (err) {
          return next(err);
        }
        book.save(function(err) {
          if (err) {
            return next(err);
          }
          req.flash('success', '예약을 거절 했습니다');
          res.redirect('back');
        });
      });
    });
  });
});

router.post('/:id', function(req, res, next) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    User.findOne({email: req.body.bookEmail}, function(err, user){
      if (err) {
        return next(err);
      }
      if(room.personner < req.body.personner){
        req.flash('danger', '최대 인원을 넘었습니다.');
        return res.redirect('back');
      }
      room.reservation = "예약진행중";
      room.save(function(err) {
        if (err) {
          return next(err);
        }
      });
      var newBook = new Book({
        bookEmail: req.body.bookEmail,
        hostEmail: req.body.hostEmail,
        name: req.body.name,
        title: room.title,
        reservation: room.reservation,
        address: user.address + user.address2,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        personner: req.body.personner,
      });
      
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
});

module.exports = router;