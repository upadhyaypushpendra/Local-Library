const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } , toObject : {virtuals:true} };
const Genre = new Schema({
        name : {type:String, required : true, minlength : 3 , maxlength : 100}
    },opts);

// virtual for GenreModel's URL

Genre.virtual('url').get(function(){
    return '/catalog/genre/' + this._id;
});

//export module
module.exports = mongoose.model('Genre',Genre);
