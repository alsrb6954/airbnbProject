var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  email: {type: String, required: true, trim: true},
  title:{type: String, unique: true, required: true},
  content:{type: String, required: true},
  content2:{type: String, required: true},
  address: {type: String, required: true},
  address2: {type: String, required: true},
  postcode: {type: String, required: true},
  roomsort:{type: String, required: true},
  rate:{type: Number, default: 0},
  personner:{type: Number, default: 0},
  reservation:{type: String, required: true},
  read:{type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


var Room = mongoose.model('Room', schema);

module.exports = Room;
