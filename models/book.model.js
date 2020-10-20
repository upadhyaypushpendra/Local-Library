const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } , toObject : {virtuals:true} };

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
},opts);

//virtual for Book's URL
BookSchema.virtual('url').get(function() {
  return '/catalog/book/' + this._id;
});
//export model

module.exports = mongoose.model('Book', BookSchema);
