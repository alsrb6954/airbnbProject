var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  bookEmail: {type: String, required: true, trim: true},
  hostEmail: {type: String, required: true, trim: true},
  name: {type: String, required: true, trim: true},
  title:{type: String, required: true},
  rate:{type: Number, default: 0},
  address: {type: String, required: true},
  reservation:{type: String, required: true},
  fromDate:{type: Date},
  toDate:{type: Date},
  personner:{type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


var Book = mongoose.model('Book', schema);

module.exports = Book;
