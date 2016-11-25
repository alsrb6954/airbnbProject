var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  email: {type: String, required: true, index: true, unique: true, trim: true},
  title:{type: String, required: true},
  content:{type: String, required: true},
  city:{type: String, required: true},
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
