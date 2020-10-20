const BookInstance = require("../models/bookinstance.model");
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book.model');
const async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .exec((err, list_bookinstances) => {
      if (err) return next(err);
      list_bookinstances.forEach((bookinstance,index)=>{
          bookinstance.set('url',`/catalog/bookinstance/${bookinstance['id']}`);
          //console.log(bookinstance);
      });
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res,next) {
  BookInstance.findById(req.params.id).populate('book').exec(function(err,bookInstance){
    if(err) {return next(err);}
    if(bookInstance == null){
      let err = new Error('Book copy not found.');
      err.status = 404;
      return next(err);
    }
    // Successful , so render
    res.render('bookinstance_detail',{title : 'Copy: '+bookInstance.book.title, bookInstance : bookInstance});
  });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res) {
    Book.find({},'title').exec(function (err,books) {
        if(err) { return next(err);}
        // Successful , so render
        res.render('book_instance_form',{title :'Create Book Instance', book_list : books });
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    //Validate fields
    body('book','Book must be specified').trim().isLength({ min:1 }),
    body('imprint','Imprint must be specified').trim().isLength({ min : 1}),
    body('due_back','Invalid date').optional({ checkFalsy : true }).isISO8601(),

    // Sanitize the fields
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    //Process request after validation and sanitization
    (req, res, next) => {

        // Extract validation errors
        let errors = validationResult(req);

        //Create a BookInstance object with escaped and trimmed data
        let bookInstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            }
        );
        if(!errors.isEmpty()){
            Book.find({},'title').exec(function (err,books){
                if(err) { return next(err);}

                // Successful, so render
                res.render('book_instance_form',{title : 'Create Book Instance', book_list : books, selected_book : bookInstance.book._id.toString(), errors : errors.array(), bookInstance : bookInstance });
            });
        } else {

            // Data from form is valid
            bookInstance.save(function (err) {
                if(err) { return next(err); }
                // Successful , so redirect
                res.redirect(bookInstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id).populate('book').exec(function (err,bookInstance) {
      if(err){ return next(err); }
      if(bookInstance === null){
          let err=new Error(`Book Instance with ID #{req.params.id} not found.`);
          err.status = 404;
          return next(err);
      } else {
          res.render('book_instance_delete',{title : 'Delete Book Instance',bookInstance : bookInstance});
      }
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res, next) {
  BookInstance.findByIdAndRemove(req.params.id,{},function (err) {
      if(err) { return next(err);}
      // Successful , redirect to book instance list page
      res.redirect('/catalog/bookinstances');
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
    async.parallel({
        bookInstance : function (callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback);
        },
        book_list : function (callback) {
            Book.find({},'_id title').exec(callback);
        }
    },function (err,results) {
        if(err){ return next(err); }
        if(results.bookInstance==null){
            let err = new Error(`No Book Instance found with ID : ${req.params.id}.`);
            err.status = 404;
            return  next(err);
        }
        if(results.book_list==null){
            let err = new Error('No Books found to create a book instance.');
            err.status = 404;
            return  next(err);
        }
        res.render('book_instance_form',{title : 'Update Book Instance', selected_book : results.bookInstance.book._id.toString(), book_list : results.book_list,  bookInstance : results.bookInstance});

    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    //Validate fields
    body('book','Book must be specified').trim().isLength({ min:1 }),
    body('imprint','Imprint must be specified').trim().isLength({ min : 1}),
    body('due_back','Invalid date').optional({ checkFalsy : true }).isISO8601(),

    // Sanitize the fields
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    //Process request after validation and sanitization
    (req, res, next) => {
        // Extract validation errors
        let errors = validationResult(req);

        //Create a BookInstance object with escaped and trimmed data
        let bookInstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id : req.params.id
            }
        );
        if(!errors.isEmpty()){
            Book.find({},'title').exec(function (err,books){
                if(err) { return next(err);}

                // Successful, so render
                res.render('book_instance_form',{title : 'Create Book Instance', book_list : books, selected_book : bookInstance.book._id.toString(), errors : errors.array(), bookInstance : bookInstance });
            });
        } else {
            // Data from form is valid
            BookInstance.findByIdAndUpdate(req.params.id,bookInstance,{},function (err,updatedBookInstance) {
                if(err) { return next(err); }
                // Successful , so redirect
                res.redirect(updatedBookInstance.url);
            });
        }
    }
];