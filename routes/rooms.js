var express = require('express'),
    multer  = require('multer'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    upload = multer({ dest: 'tmp' }),
    User = require('../models/User');
    Room = require('../models/Room');
    Opinion = require('../models/Opinion');
    Review = require('../models/Review');
var router = express.Router();
var mimetypes = {
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png"
};

function needAuth(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    return res.redirect('/signin');
  }
}
function validateForm(form) {
  var title = form.title || "";
  var email = form.email || "";
  var content = form.content || "";
  var content2 = form.content2 || "";
  var city = form.city || "";
  var rate = form.rate || "";
  var roomsort = form.roomsort || "";
  var personner = form.personner || "";          
  var address = form.address || "";
  var address2 = form.address2 || "";
  var postcode = form.postcode || "";
  title = title.trim();
  email = email.trim();
  content = content.trim();
  content2 = content2.trim();
  city = city.trim();
  rate = rate.trim();
  roomsort = roomsort.trim();
  personner = personner.trim();
  address = address.trim();
  address2 = address2.trim();
  postcode = postcode.trim();

  if (!title) {
    return '제목을 입력해주세요.';
  }
  if (!email) {
    return '이메일을 입력해주세요.';
  }
  if (!content) {
    return '상세내용을 입력해주세요.';
  }
  if (!content2) {
    return '이용규칙을 입력해주세요.';
  }
  if (!city) {
    return '도시을 입력해주세요.';
  }
  if (!rate) {
    return '비용을 입력해주세요.';
  }
  if (!roomsort) {
    return '방종류을 입력해주세요.';
  }
  if (!personner) {
    return '인원수을 입력해주세요.';
  }            
  if (!address) {
    return '주소을 입력해주세요.';
  }
  if (!address2) {
    return '상세주소을 입력해주세요.';
  }  
  if (!postcode) {
    return '우편번호을 입력해주세요.';
  }  
  return null;
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
        Opinion.find({content_id: req.params.id}, function(err,opinions){
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
  if(!req.body.content){
    req.flash('danger', '댓글을 입력해주시기 바랍니다.'); 
    return res.redirect('back'); 
  }
  var newOpinion = new Opinion({
    name: req.user.name,
    email: req.user.email,
    content_id: req.params.id,
    room_id: req.params.id,
    content: req.body.content
  });
  newOpinion.save(function(err) {
    if (err) {
      return next(err);
    }
  });
  req.flash('success', '댓글이 등록되었습니다.'); 
  res.redirect('back');  
});
router.post('/search', function(req, res, next) {
    Room.find({city: req.body.search}, function(err, rooms){
        if (err) {
            return next(err);
        }
        res.render('rooms/index', {rooms: rooms});
    });
});
router.post('/', upload.array('photos'), function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  Room.findOne({title: req.body.title}, function(err, room) {
    if (err) {
      return next(err);
    }
    if (room) {
      req.flash('danger', '동일한 방이름이 있습니다.');
      return res.redirect('back');
    }
    var dest = path.join(__dirname, '../public/images/');
    var images = [];
    if (req.files && req.files.length > 0) {
      _.each(req.files, function(file) {
        var ext = mimetypes[file.mimetype];
        if (!ext) {
          return;
        }
        var filename = file.filename + "." + ext;
        fs.renameSync(file.path, dest + filename);
        images.push("/images/" + filename);
      });
    }
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
      images: images,
      reservation: "예약가능",
    });

    newRoom.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '방이 등록되었습니다.');
      res.redirect('/rooms/lists');
    });
  });
});

router.put('/:id', function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  Room.findById({_id: req.params.id}, function(err, room) {
    if (err) {
      return next(err);
    }
    room.content = req.body.content;
    room.content2 = req.body.content2;
    room.personner = req.body.personner;
    room.roomsort = req.body.roomsort;
    room.city = req.body.city;
    room.postcode = req.body.postcode;
    room.address = req.body.address;
    room.address2 = req.body.address2;
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
  Room.findById(req.params.id,function(err,room){
    if (err) {
      return next(err);
    }
    Book.findOneAndRemove({title: room.title},function(err){
      if (err) {
        return next(err);
      }
    });
    Opinion.remove({content_id: room._id}, function(err){
      if (err) {
        return next(err);
      }
    });
    Opinion.remove({room_id: room._id}, function(err){
      if (err) {
        return next(err);
      }
    });
    Review.remove({room_id: room._id}, function(err){
      if (err) {
        return next(err);
      }
    });
    Room.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '등록된 숙소가 삭제되었습니다.');
      res.redirect('back');
    });
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