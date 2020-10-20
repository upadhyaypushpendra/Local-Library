const Genre = require("../models/genre.model");
const Book = require("../models/book.model")
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require("async");

// Display list of all Genre.
exports.genre_list = function (req, res,next) {
  Genre.find().exec((err,list_genres)=>{
    if(err) return next(err);
    res.render('genre_list',{title:"Genre List",genre_list:list_genres});
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res,next)=> {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: (callback) => {
      Book.find({'genre': req.params.id}).exec(callback);
    },
  }, (err, results) => {
    if (err) next(err);
    if (results.genre == null) {
      let err = new Error('Genre not found.')
      err.status = 404;
      return next(err);
    }
    // Successful , so render
    res.render('genre_detail', {title: "Genre Detail", genre: results.genre, genre_books: results.genre_books});
  });
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form',{title : 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate that the name is not empty and length > 3 and length < 100
    body('name').trim().isLength({min:3,max:100}).withMessage('Name must be of length (3-100).'),

    // Sanitize (escape) the name field
    sanitizeBody('name').escape(),

    //Process request after validation and sanitization
    (req,res,next)=>{
      const errors = validationResult(req);
      let genre = new Genre({name : req.body.name});
      if(!errors.isEmpty()){
        res.render('genre_form',{title : 'Create Genre', genre : genre, errors : errors.array()});
        return;
      } else {
        // Data from form is valid
        // Check if genre with same name already exists
        Genre.findOne({'name' : req.body.name}).exec(function (err,found_genre){
          if(err) return next(err);
          if(found_genre){
            res.redirect(found_genre.url);
          } else {
            genre.save(function (err) {
              if(err) return next(err);
              res.redirect(genre.url);
            });
          }
        });
      }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: (callback) => {
      Book.find({'genre': req.params.id}).exec(callback);
    },
  }, (err, results) => {
    if (err) next(err);
    if (results.genre == null) {
      let err = new Error('Genre not found.')
      err.status = 404;
      return next(err);
    }
    // Successful , so render
    res.render('genre_delete', {title: "Genre Delete", genre: results.genre, genre_books: results.genre_books});
  });
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {

  async.parallel({
    genre : function(callback) {
      Genre.findById(req.body.genreid).exec(callback)
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.body.genreid }).exec(callback)
    },
  }, function(err, results) {
    if (err) { return next(err); }
    // Success
    if (results.genre_books.length > 0) {
      // Genre has books. Render in same way as for GET route.
      res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
      return;
    }
    else {
      // Genre has no books. Delete object and redirect to the list of genres.
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        if (err) { return next(err); }
        // Success - go to genre list
        res.redirect('/catalog/genres');
      })
    }
  });
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
      },
    genre_books : function (callback) {
      Book.find({ 'genre' : req.params.id }).exec(callback);
      },
  },function (err,results) {
    if(err){ return next(err);}
    // Success
    if(results.genre==null) {
      // No results
      let err=new Error("No Book found.");
      err.status = 404;
      return next(err);
    } else {
      // Found genre so,render
      res.render('genre_form',{ title: 'Update Genre', genre : results.genre, genre_books : results.genre_books });
    }
  });
};

// Handle Genre update on POST.
exports.genre_update_post =[
    //Validate fields
  body('name').trim().isLength({min:3,max:100}).withMessage('Name must be of length (3-100).'),

    // Sanitize fields
    sanitizeBody('name').escape(),

    // Process the validated and sanitized data
    (req, res, next) =>{
    // Collection errors
      let errors = validationResult(req);

      // Create Genre object
      let genre = new Genre(
          {
            name : req.body.name,
            _id : req.params.id
          }
      );
      if(!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all books of this genre
        async.parallel({
          genre_books : function (callback) {
            Book.find({ 'genre' : req.params.id }).exec(callback);
          },
        },function (err,results) {
          if(err){ return next(err);}
          // Successful, so render
            res.render('genre_form',{ title: 'Update Genre', genre : genre, genre_books : results.genre_books, errors: errors.array() });
        });
      } else {
        // No Errors update the genre
        Genre.findByIdAndUpdate(req.params.id,genre,{},function (err,updatedGenre) {
          if(err) { return next(err); }
          // Successful redirect to genre detail page
          res.redirect(updatedGenre.url);
        })
      }
    }
];
