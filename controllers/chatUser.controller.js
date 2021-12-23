const ChatUser = require("./../models/chatUser.model");
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require("async");

//Display list of all chatUsers
exports.chatUser_list = (request, response,next) => {
  res.setHeader('content-type', 'application/json');
  ChatUser.find().populate('chatUser').sort([['family_name','ascending']]).exec((err,list_chatUsers)=>{
    if(err) return next(err);
    // Successful so render
    response.status(200).send(list_chatUsers);
  });
};

//Display detail page for a specific chatUser
exports.chatUser_get = (req, res, next) => {
  res.setHeader('content-type', 'application/json');
  async.parallel({
	chatUser: function(callback){
		ChatUser.findById(req.params.id).exec(callback);
	}
	},function(err,results){
		if(err){
			let error = new Error('ChatUser not found.');
			error.status = 404;
      res.status(404).send(error);
		}
		// Successful, so render
		res.status(200).send({ chatUser: results.chatUser } );
	});
};

// Handler chatUser create on POST
exports.chatUser_create = [

	// Validate fields
	body('name').isLength({min:1,max:200}).trim().withMessage('Name must be specified.'),
	body('phone').isLength({min:1,max:20}).trim().withMessage('Phone must be specified.'),
  body('about').isLength({max:500}).trim().optional({checkFalsy: true}),

	// sanitize fields
	sanitizeBody('name').escape(),
	sanitizeBody('phone').escape(),
	sanitizeBody('about').escape(),

	//Process  request after validation and sanitization
	(req, res, next)=>{
  res.setHeader('content-type', 'application/json');
	const errors = validationResult(req);
	if(!errors.isEmpty()){
    res.status(200).json({ value: chatUser, error: errors.array() });
	} else {
		//Data from form is valid

		//Create an ChatUser Object
		let chatUser = new ChatUser(
			{
				name : req.body.name,
				phone : req.body.phone,
				about : req.body.about,
			});
		chatUser.save(function (err){
			if(err) return next(err);
			// Successful - redirect to new ChatUser record.
			res.status(200).send(chatUser);
		});
	}
	},
];

//Handle chatUser delete on POST
exports.chatUser_delete = (req, res, next) => {

	async.parallel({
		chatUser: function(callback) {
			ChatUser.findById(req.body.chatUserid).exec(callback)
		},
	}, function(err, results) {
		if (err) return next(err);
		// Success
    // Delete chatUser.
    ChatUser.findByIdAndRemove(req.body.chatUserid, function deleteChatUser(err) {
      if (err) return next(err);
      // Success - go to chatUser list
      res.status(200).json({});
    })
	});
};

//Handle chatUser update on POST
exports.chatUser_update = [
	// Validate fields
	body('name').isLength({min:1,max:200}).trim().withMessage('Name must be specified.'),
	body('phone').isLength({min:1,max:20}).trim().withMessage('Phone must be specified.'),
  body('about').isLength({max:500}).trim().optional({checkFalsy: true}),

	// sanitize fields
	sanitizeBody('name').escape(),
	sanitizeBody('phone').escape(),
	sanitizeBody('about').escape(),


	// Process request after validation and sanitization
	(req, res, next)=>{
		const errors = validationResult(req);
		if(!errors.isEmpty()){
      res.status(200).json({ value: chatUser, error: errors.array() });
		} else {
			//Data from form is valid
			//Create an ChatUser Object
			let chatUser = new ChatUser(
				{
          name : req.body.name,
          phone : req.body.phone,
          about : req.body.about,
          updated_at: Date.now(),
          _id : req.params.id
				});
			ChatUser.findByIdAndUpdate(req.params.id,chatUser,{},function (err,updatedChatUser) {
				if(err) { return next(err); }
				// Successful updated
        res.status(200).json(chatUser);
			});
		}
	}
];
