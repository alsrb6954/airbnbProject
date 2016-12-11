var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room');
    Opinion = require('../models/Opinion');
    Book = require('../models/Book');
    Review = require('../models/Review');
var router = express.Router();

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  var address = form.address || "";
  var address2 = form.address2 || "";
  var postcode = form.postcode || "";
  name = name.trim();
  email = email.trim();
  address = address.trim();
  address2 = address2.trim();
  postcode = postcode.trim();

  if (!name) {
    return '이름을 입력해주세요.';
  }
  if (!email) {
    return '이메일을 입력해주세요.';
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
  if (!form.password && options.needPassword) {
    return '비밀번호를 입력해주세요.';
  }

  if (form.password !== form.password_confirmation) {
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 6글자 이상이어야 합니다.';
  }

  return null;
}

/* GET users listing. */
router.get('/:id/index', function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.authority == "on"){
        res.render('users/index', {users: users});
      } else {
        req.flash('danger', '관리자 권한이 없습니다');
        return res.redirect('back');
      }
    });
  });
});
router.get('/', function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/index', {users: users});
  });
});
router.get('/new', function(req, res, next) {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.put('/:id/auth/', function(req,res,next){
  User.findById({_id: req.params.id}, function(err, user){
     if (err) {
      return next(err);
    }
    user.authority = "on";
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '사용자 권한이 변경되었습니다.');
      res.redirect('back');
    });
  });
});


router.delete('/:id', function(req, res, next) {
  User.findById({_id: req.params.id}, function(err, user){
    if (err) {
      return next(err);
    }
    User.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      Room.remove({email:user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Book.remove({hostEmail: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Book.remove({bookEmail: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Opinion.remove({email: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Review.remove({email: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      req.flash('success', '사용자 계정이 삭제되었습니다.');
      res.redirect('/users');
    });
  });
});

router.delete('/show/:id', function(req, res, next) {
  User.findById({_id: req.params.id}, function(err, user){
    if (err) {
      return next(err);
    }
    User.remove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      Room.remove({email:user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Book.remove({hostEmail: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Book.remove({bookEmail: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Opinion.remove({email: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      Review.remove({email: user.email}, function(err){
        if (err) {
          return next(err);
        }
      });
      delete req.session.user;
      req.flash('success', '사용자 계정이 삭제되었습니다.');
      res.redirect('/');
    });
  });
});

router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});

router.put('/:id', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }
    if (!user.validatePassword(req.body.current_password)) {
      req.flash('danger', '현재 비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    user.name = req.body.name;
    user.email = req.body.email;
    address = req.body.address;
    address2 = req.body.address2;
    postcode = req.body.postcode;
    if (req.body.password) {
      user.password = user.generateHash(req.body.password);
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '사용자 정보가 변경되었습니다.');
      res.redirect('/');
    });
  });
});

router.post('/', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 이메일 주소가 이미 존재합니다.');
      return res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      address2: req.body.address2,
      postcode: req.body.postcode,
      authority: "off",
    });
    newUser.password = newUser.generateHash(req.body.password);

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '가입이 완료되었습니다. 로그인 해주세요.');
        res.redirect('/');
      }
    });
  });
});


module.exports = router;
