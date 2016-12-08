var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true},
  title:{type: String, required: true},
  room_id:{type: String, required: true},
  password: {type: String},
  read: {type: Number, default: 0},
  opinion: {type: Number, default: 0},
  content:{type: String, required: true},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


var Review = mongoose.model('Review', schema);

module.exports = Review;
