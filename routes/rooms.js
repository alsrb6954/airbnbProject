var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room');
var router = express.Router();

router.get('/lists/', function(req, res, next) {
  Room.find({}, function(err, rooms) {
    if (err) {
      return next(err);
    }
    res.render('rooms/index', {rooms: rooms});
  });
});
router.get('/new', function(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
});
router.get('/hosting', function(req, res, next) {
    if (req.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
    res.render('rooms/hosting');
});
router.get('/:id/new1', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        res.render('rooms/new1', {user: user});
    }); 
});
router.get('/:id/new2', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        res.render('rooms/new2', {user: user});
    }); 
});
router.get('/:id/new3', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        res.render('rooms/new3', {user: user});
    }); 
});
router.get('/:id/edit', function(req, res, next) {
    Room.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        res.render('rooms/edit', {user: user});
    }); 
});
router.get('/:id', function (req, res, next) {
    Room.findById(req.params.id, function (err, room) {
        if (err) {
            return next(err);
        }
        room.read += 1;
        room.save(function(err){
            if(err){
                return next(err);
            }    
        });
        res.render('rooms/show', { room: room });
    });
});
router.get('/:id/host', function (req, res, next) {
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            return next(err);
        }
        Room.findOne({email: book.hostEmail}, function (err, room){
          room.read += 1;
          room.save(function(err){
            if(err){
                return next(err);
            }    
        });
        res.render('rooms/show', { room: room });
        });
    });
});
router.post('/', function(req, res, next) {
  Room.findOne({title: req.body.title}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 방이름이 있습니다.');
      res.redirect('back');
    }
    var newRoom = new Room({
      email: req.body.email,
      personner: req.body.personner,
      postcode: req.body.postcode,
      address: req.body.address,
      address2: req.body.address2,
      rate: req.body.rate,
      title: req.body.title,
      content: req.body.content,
      content2: req.body.content2,
      roomsort: req.body.roomsort,
      reservation: "예약가능",
    });

    newRoom.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '방이 등록되었습니다.');
      res.redirect('/');
    });
  });
});

router.put('/:id', function(req, res, next) {
  Room.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    user.content = req.body.content;
    user.personner = req.body.personner;
    user.city = req.body.city;
    user.rate = req.body.rate;
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '숙소 정보가 변경되었습니다.');
      res.redirect('/rooms/lists');
    });
  });
});

router.delete('/:id', function(req, res, next) {
  Room.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '등록된 숙소가 삭제되었습니다.');
    res.redirect('/rooms/lists');
  });
});

module.exports = router;