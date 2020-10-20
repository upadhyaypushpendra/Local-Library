const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } , toObject : {virtuals:true} };
const BookInstanceSchema = new Schema({
        book : {type:Schema.Types.ObjectId, ref:'Book',required:true},
        imprint : {type:String, required: true},
        status : {type:String, required:true,enum : ['Available','Maintenance','Loaned','Reserved'], default:'Maintenance'},
        due_back :{type : String, default: Date.now()}
    },opts);

// virtual for BookInstance's URL

BookInstanceSchema.virtual('url').get(function(){
    return '/catalog/bookinstance/'+this._id;
});
BookInstanceSchema.virtual('due_back_formatted').get(()=>{
    return moment(this.due_back).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('BookInstance',BookInstanceSchema);
