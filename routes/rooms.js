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
router.get('/:id/new', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        res.render('rooms/new', {user: user});
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

router.post('/', function(req, res, next) {
  Room.findOne({title: req.body.title}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 방이름이 있습니다.');
      res.redirect('back');
    }
    // if(req.body.rate != Number){
    //   req.flash('danger', '요금은 숫자로 입력해주시기 바랍니다.');
    //   res.redirect('back');
    // } else if(req.body.personner != Number){
    //   req.flash('danger', '최대 인원수를 숫자로 입력해주시기 바랍니다.');
    //   res.redirect('back');
    // }
    var newRoom = new Room({
      email: req.body.email,
      personner: req.body.personner,
      city: req.body.city,
      rate: req.body.rate,
      title: req.body.title,
      content: req.body.content,
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