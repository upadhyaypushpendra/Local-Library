const Book = require("./../models/book.model");
const Author = require("./../models/author.model");
const Genre = require("./../models/genre.model");
const BookInstance = require("./../models/bookinstance.model");
const async = require("async");
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (callback) => {
        Book.countDocuments({}, callback);
      },
      book_instance_count: (callback) => {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: (callback) => {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count: (callback) => {
        Author.countDocuments({}, callback);
      },
      genre_count: (callback) => {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books.
exports.book_list = function (req, res, next) {
  Book.find({}, "title author")
    .populate("author")
    .exec((error, list_books) => {
      if (error) {
        return next(error);
      } else {
        res.render("book_list", { title: "Book List", book_list: list_books });
      }
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res) {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    book_instances: (callback) => {
      BookInstance.find({'book': req.params.id}).exec(callback);
    },
  }, (err, results) => {
    if (err) next(err);
    if (results.book == null) {
      let err = new Error('Book not found.')
      err.status = 404;
      return next(err);
    }
    // Successful , so render
    res.render('book_detail', {title: "Book Detail", book: results.book, book_instances: results.book_instances} );
  });

};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  async.parallel({
      authors : function (callback) {
          Author.find(callback);
      },
      genres : function (callback) {
          Genre.find(callback);
      },
  },function(err,results){
      if(err) {return next(err);}
      res.render('book_form',{title:'Add Book', authors : results.authors, genres : results.genres });
  });
};

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === 'undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    // Validate fields
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    // Sanitize fields (using wildcard)
    sanitizeBody('*').escape(),
    sanitizeBody('genre.*').escape(),


    // Process request after validation and sanitization
    (req, res, next)=>{

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Book Object with escaped and trimmed date.
        let book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            });

        if(!errors.isEmpty()) {
        async.parallel({
            authors: function(callback) {
                Author.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }

            // Mark our selected genres as checked.
            for (let i = 0; i < results.genres.length; i++) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    results.genres[i].checked='true';
                }
            }
            res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
        });

    } else {
            book.save(function (err){
                if(err) { return next(err);}
                // Successful - redirect to new book record
                res.redirect(book.url);
            });
    }
    },
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res, next) {
    async.parallel({
        book: (callback) => {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        book_instances: (callback) => {
            BookInstance.find({'book': req.params.id}).exec(callback);
        },
    }, (err, results) => {
        if (err) next(err);
        if (results.book == null) {
            res.redirect('/catalog/books');
        }
        res.render('book_delete', {title: "Book Delete", book: results.book, book_instances: results.book_instances} );
    });

};

// Handle book delete on POST.
exports.book_delete_post = function (req, res, next) {
    async.parallel({
        book : function (callback) {
            Book.findById(req.body.bookid).exec(callback);
        },
        book_instances : function (callback) {
            BookInstance.find({'book':req.body.bookid}).exec(callback);
        }
    },function (err,results) {
        if(err) { return next(err);}
        // Success
        if(results.book_instances.length > 0 ){
            // Book has book instances
            res.render('book_delete',{ title : 'Book Delete', book : results.book, book_instances : results.book_instances });
            return ;
        } else {
            // Book has no book instances. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.bookid, function deleteBook() {
               if(err) {return next(err);}
               // Success - redirect to books list
                res.redirect('/catalog/books')
            });
        }
    });
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
    });
};

// Handle book update on POST.
exports.book_update_post = [
    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    // Sanitize fields.
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        let book = new Book(
            { title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
                _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebook.url);
            });
        }
    }
];