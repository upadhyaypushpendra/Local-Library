const Author = require("./../models/author.model");
const Book = require("./../models/book.model");
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require("async");

//Display list of all authors
exports.author_list = (request, response,next) => {
  Author.find().populate('author').sort([['family_name','ascending']]).exec((err,list_authors)=>{
    if(err) return next(err);
    // Successful so render
    response.render('author_list',{title:'Author List',author_list:list_authors});
  });
};

//Display detail page for a specific author
exports.author_detail = (req, res, next) => {
  async.parallel({
	author: function(callback){
		Author.findById(req.params.id).exec(callback);
	},
	authors_books: function(callback){
		Book.find({'author': req.params.id},'title summary').exec(callback);
	},
	},function(err,results){
		if(err){
			let error = new Error('Author not found.');
			error.status = 404;
			return next(error);
		}
		// Successful, so render
		res.render('author_detail',{title:'Author Detail',author: results.author ,authors_books: results.authors_books} );
	});
};

//Handle author create on GET
exports.author_create_get = (request, response) => {
  response.render('author_form',{title:'Create Author'});
};

// Handler author create on POST
exports.author_create_post = [

	// Validate fields
	body('first_name').isLength({min:1,max:100}).trim().withMessage('First name must be specified.'),
	body('family_name').isLength({min:1,max:100}).trim().withMessage('Family name must be specified.'),
	body('date_of_birth','Invalid date of birth').optional({checkFalsy:true}).isISO8601(),
	body('date_of_death','Invalid date of death').optional({checkFalsy:true}).isISO8601(),

	// sanitize fields
	sanitizeBody('first_name').escape(),
	sanitizeBody('family_name').escape(),
	sanitizeBody('date_of_birth').toDate(),
	sanitizeBody('date_of_death').toDate(),

	//Process  request after validation and sanitization
	(req, res, next)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.render('author_form',{title : 'Create Author', author : req.body, errors : errors.array() });
	} else {
		//Data from form is valid

		//Create an Author Object
		let author = new Author(
			{

				first_name : req.body.first_name,
				family_name : req.body.family_name,
				date_of_birth : req.body.date_of_birth,
				date_of_death : req.body.date_of_death
			});
		author.save(function (err){
			if(err) { return next(err);}
			// Successful - redirect to new Author record.
			res.redirect(author.url);
		});
	}
	},
];

//Handle author delete on GET
exports.author_delete_get = (req, res, next) => {
	async.parallel({
		author : function (callback) {
			Author.findById(req.params.id).exec(callback);
		},
		authors_books : function (callback) {
			Book.find({'author':req.params.id}).exec(callback);
		},
	},function (err, results) {
		if(err) {return next(err);}
		if(results.author === null){
			res.redirect('/catalog/authors');
		}
		// Successful, so render
		res.render('author_delete',{ title:'Delete Author', author: results.author, author_books: results.authors_books } );
	});
};

//Handle author delete on POST
exports.author_delete_post = (req, res, next) => {

	async.parallel({
		author: function(callback) {
			Author.findById(req.body.authorid).exec(callback)
		},
		authors_books: function(callback) {
			Book.find({ 'author': req.body.authorid }).exec(callback)
		},
	}, function(err, results) {
		if (err) { return next(err); }
		// Success
		if (results.authors_books.length > 0) {
			// Author has books. Render in same way as for GET route.
			res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
			return;
		}
		else {
			// Author has no books. Delete object and redirect to the list of authors.
			Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
				if (err) { return next(err); }
				// Success - go to author list
				res.redirect('/catalog/authors')
			})
		}
	});
};

//Handle author update on GET
exports.author_update_get = (req, res, next) => {
	async.parallel({
		author: function(callback){
			Author.findById(req.params.id).exec(callback);
		},
		authors_books: function(callback){
			Book.find({'author': req.params.id},'title summary').exec(callback);
		},
	},function(err,results){
		if(err){
			let error = new Error('Author not found.');
			error.status = 404;
			return next(error);
		}
		// Successful, so render
		res.render('author_form',{title:'Author Update',author: results.author ,authors_books: results.authors_books} );
	});
};

//Handle author update on POST
exports.author_update_post = [
	// Validate fields
	body('first_name').isLength({min:1,max:100}).trim().withMessage('First name must be specified(1-100).'),
	body('family_name').isLength({min:1,max:100}).trim().withMessage('Family name must be specified(1-100).'),
	body('date_of_birth','Invalid date of birth').optional({checkFalsy:true}).isISO8601(),
	body('date_of_death','Invalid date of death').optional({checkFalsy:true}).isISO8601(),

	// sanitize fields
	sanitizeBody('first_name').escape(),
	sanitizeBody('family_name').escape(),
	sanitizeBody('date_of_birth').toDate(),
	sanitizeBody('date_of_death').toDate(),

	// Process request after validation and sanitization
	(req, res, next)=>{
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			res.render('author_form',{title : 'Update Author', author : req.body, errors : errors.array() });
		} else {
			//Data from form is valid
			//Create an Author Object
			let author = new Author(
				{
					first_name : req.body.first_name,
					family_name : req.body.family_name,
					date_of_birth : req.body.date_of_birth,
					date_of_death : req.body.date_of_death,
					_id : req.params.id
				});
			Author.findByIdAndUpdate(req.params.id,author,{},function (err,updatedAuthor) {
				if(err) { return next(err); }
				// Successful redirect to Author detail page
				res.redirect(updatedAuthor.url);
			});
		}
	}
];
