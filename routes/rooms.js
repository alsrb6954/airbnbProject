var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room');
    Opinion = require('../models/Opinion');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    return res.redirect('/signin');
  }
}

router.get('/lists/', function(req, res, next) {
  Room.find({}, function(err, rooms) {
    if (err) {
      return next(err);
    }
    res.render('rooms/index', {rooms: rooms});
  });
});
router.get('/hosting', needAuth, function(req, res, next) {
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
router.get('/:id/profile', function(req, res, next) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    User.findOne({email: room.email},function(err, user){
      if (err) {
        return next(err);
      }
      res.render('users/show', {user: user});
    });
  });
});
router.get('/:id/edit', function(req, res, next) {
    Room.findById(req.params.id, function(err, room) {
        if (err) {
            return next(err);
        }
        res.render('rooms/edit', {room: room});
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
        Opinion.find({title: room.title}, function(err,opinions){
            if(err){
                return next(err);
            }    
            res.render('rooms/show', { room: room, opinions: opinions }); 
          });
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
          Opinion.find({title: room.title}, function(err,opinions){
            if(err){
                return next(err);
            }    
            res.render('rooms/show', { room: room, opinions: opinions }); 
          });
        });
    });
});
router.post('/:id/opinion', needAuth, function(req, res, next) {
  Room.findById(req.params.id, function(err, room){
    if (err) {
      return next(err);
    }
    if(!req.body.content){
      req.flash('danger', '댓글을 입력해주시기 바랍니다.'); 
      return res.redirect('back'); 
    }
    var newOpinion = new Opinion({
      name: req.user.name,
      email: req.user.email,
      title: room.title,
      content: req.body.content
    });
    newOpinion.save(function(err) {
      if (err) {
        return next(err);
      }
    });
    Opinion.find({title: room.title}, function(err,opinions){
      if (err) {
        return next(err);
      }
      req.flash('success', '댓글이 등록되었습니다.'); 
      res.redirect('back');  
    });
  });
});
router.post('/search', function(req, res, next) {
    Room.find({city: req.body.search}, function(err, rooms){
        if (err) {
            return next(err);
        }
        res.render('rooms/index', {rooms: rooms});
    });
});
router.post('/', function(req, res, next) {
  Room.findOne({title: req.body.title}, function(err, room) {
    if (err) {
      return next(err);
    }
    if (room) {
      req.flash('danger', '동일한 방이름이 있습니다.');
      return res.redirect('back');
    }
    // if (req.body.rate == Number || req.body.personner == Number){
    //   req.flash('danger', '비용과 인원 수를 숫자로 입력해주시기 바랍니다.');
    //   return res.redirect('back');
    // }
    var newRoom = new Room({
      email: req.body.email,
      personner: req.body.personner,
      postcode: req.body.postcode,
      city: req.body.city,
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
  Room.findById({_id: req.params.id}, function(err, room) {
    if (err) {
      return next(err);
    }
    room.content = req.body.content;
    room.personner = req.body.personner;
    room.city = req.body.city;
    room.rate = req.body.rate;
    room.save(function(err) {
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
router.delete('/:id/opinion', function(req, res, next) {
  Opinion.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '댓글을 삭제했습니다.');
    res.redirect('back');
  });
});

module.exports = router;