const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } , toObject : {virtuals:true} };

const ChatUserSchema = new Schema({
  phone: { type: String, required: true, maxlength: 20 },
  password: { type: Object, required: true },
  name: { type: String, required: false, maxlength: 200 },
  about: { type: String, required: false, maxlength: 500 },
  created_at : { type: Date, default: Date.now },
  updated_at : { type: Date, default: Date.now },
},opts);

//Export model
module.exports = mongoose.model('ChatUser', ChatUserSchema);
