const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } , toObject : {virtuals:true} };

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth : { type: Date },
  date_of_death : { type: Date }
},opts);

//virtual for author's URL
AuthorSchema.virtual('url').get(function(){
  return '/catalog/author/' + this._id;
});

//virtual for author's full name
AuthorSchema.virtual('name').get(function(){
  let fullName = '';
  if (this.first_name) {
    fullName += this.first_name;
  }
  if (this.family_name) {
    fullName +=' '+this.family_name;
  }
  return fullName;
});

//virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function(){
  if(this.date_of_birth && this.date_of_death){
    return moment(this.date_of_birth).format('MMMM Do, YYYY')+' - '+moment(this.date_of_death).format('MMMM Do, YYYY');
  }else{
    if(this.date_of_birth) return moment(this.date_of_birth).format('MMMM Do, YYYY');
    if(this.date_of_death) return moment(this.date_of_death).format('MMMM Do, YYYY');
  }
  return '';
});
AuthorSchema.virtual('formatted_date_of_birth').get(function () {
  return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD'): '';
});
AuthorSchema.virtual('formatted_date_of_death').get(function () {
  return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
});
//Export model

module.exports = mongoose.model('Author', AuthorSchema);
