var express = require('express'),
    User = require('../models/User');
    Room = require('../models/Room');
    Opinion = require('../models/Opinion');
    Review = require('../models/Review');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  Room.findById(req.params.id, function(err, room){  
    Review.find({room_id: room.id}, function(err, reviews){
      res.render('reviews/index',{reviews: reviews, room:room});
    });
  });
});

router.get('/:id/new', function(req, res, next) {
  if (req.user) {
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    return res.redirect('/signin');
  }
  Room.findById(req.params.id, function(err,room){
    User.findOne({email: req.user.email}, function(err,user){
      res.render('reviews/new',{user: user, room: room});
    });
  });
});
router.get('/:id/edit', function(req, res, next) {
  Review.findById(req.params.id, function(err,review){
    res.render('reviews/edit',{review: review});
  });
});
router.get('/:id/show',function(req,res,next){
  Review.findById(req.params.id, function(err, review){
    if (err) {
      return next(err);
    }
    Opinion.find({content_id: req.params.id}, function(err,opinions){
      review.read += 1;
      review.save(function(err){
              if(err){
                  return next(err);
              }    
          });
      res.render('reviews/show',{review:review, opinions:opinions});
    });
  });
});

router.get('/:id/profile', function(req, res, next) {
  if (req.user) {
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    return res.redirect('/signin');
  }
  Review.findById(req.params.id, function(err, review) {
    if (err) {
      return next(err);
    }
    User.findOne({email: review.email},function(err, user){
      if (err) {
        return next(err);
      }
      res.render('users/show', {user: user});
    });
  });
});
router.post('/:id/opinion', function(req, res, next) {
  if (req.user) {
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    return res.redirect('/signin');
  }
  Review.findById(req.params.id, function(err, review){
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
      content_id: req.params.id,
      content: req.body.content
    });
    newOpinion.save(function(err) {
      if (err) {
        return next(err);
      }
    });
    review.opinion += 1;
    review.save(function(err){
      if (err) {
        return next(err);
      }
    });
    req.flash('success', '댓글이 등록되었습니다.'); 
    res.redirect('back');  
  });
});

router.put('/:id', function(req, res, next) {
  Review.findById({_id: req.params.id}, function(err, review) {
    if (err) {
      return next(err);
    }
    if (review.password != req.body.password) {
      req.flash('danger', '비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    review.title = req.body.title;
    review.content = req.body.content;
    review.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '후기가 수정되었습니다.');
      res.redirect('/rooms/lists');
    });
  });
});

router.post('/:id', function(req, res, next) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      return next(err);
    }
    var newReview = new Review({
      name: req.user.name,
      email: req.body.email,
      title: req.body.title,
      room_id: req.params.id,
      content: req.body.content
    });
    newReview.password = req.body.password;

    newReview.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '후기를 등록했습니다');
        res.redirect('/rooms/lists');
      }
    });
  });
});

router.delete('/:id/opinion', function(req, res, next) {
  Opinion.findOne({_id: req.params.id}, function(err, opinion){
    Review.findOne({_id:opinion.content_id},function(err, review){
      review.opinion -= 1;
      review.save(function(err){
        if (err) {
          return next(err);
        }
      });
      Opinion.findOneAndRemove({_id: req.params.id}, function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', '댓글을 삭제했습니다.');
        res.redirect('back');
      });
    });
  });
});
module.exports = router;