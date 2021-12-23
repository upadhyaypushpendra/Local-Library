const ChatUser = require("./../models/chatUser.model");
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require("async");
const { encrypt, decrypt } = require("./../utils/cryptoUtil");

// Display list of all chatUsers
exports.chatUser_list = (req, res, next) => {
  res.setHeader('content-type', 'application/json');
  ChatUser.find({}, 'phone name about').sort([['created_at','descending']]).exec((err,list_chatUsers)=>{
    if(err) {
      res.status(500).json(err);
      return;
    }
    // Successful so render
    res.status(200).json(list_chatUsers);
  });
};

//Get chatUser by Id
exports.chatUser_get = (req, res, next) => {
  res.setHeader('content-type', 'application/json');
  async.parallel({
	chatUser: function(callback){
		ChatUser.findById(req.params.id, 'phone name about').exec(callback);
	}
	},function(err,results){
		if(err){
			let error = new Error('ChatUser not found.');
			error.status = 404;
      res.status(404).json(error);
		}
		// Successful, so render
		res.status(200).json({ chatUser: results.chatUser } );
	});
};

// Handler chatUser create
exports.chatUser_create = [

	// Validate fields
  body('phone').isLength({min:1,max:20}).trim().withMessage('Phone must be specified.'),
  body('password').isLength({min:8,max:50}).trim().withMessage('Password must be 8 character long.'),
	body('name').isLength({min:1,max:200}).trim().withMessage('Name must be specified.'),
  body('about').isLength({max:500}).trim().optional({checkFalsy: true}),

	// sanitize fields
	sanitizeBody('phone').escape(),
	sanitizeBody('password').escape(),
	sanitizeBody('name').escape(),
	sanitizeBody('about').escape(),

	//Process  request after validation and sanitization
	(req, res, next)=>{
  res.setHeader('content-type', 'application/json');
	const errors = validationResult(req);
	if(!errors.isEmpty()){
    res.status(200).json({ value: chatUser, error: errors.array() });
	} else {
		//Data from form is valid

    const { phone, password, name, about } = req.body;
    
    const passwordHash = encrypt(password);
    
		//Create an ChatUser Object
		let chatUser = new ChatUser(
			{
				phone,
        password: passwordHash,
				name,
				about,
			});
		chatUser.save(function (err){
			if(err) return next(err);
			// Successful - redirect to new ChatUser record.
			res.status(200).send(chatUser);
		});
	}
	},
];

//Handle chatUser delete by id
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

//Handle chatUser update
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

// Handler chatUser update password
exports.chatUser_update_password = [

	// Validate fields
  body('oldPassword').isLength({min:8,max:50}).trim().withMessage('Password must be 8 character long.'),
  body('newPassword').isLength({min:8,max:50}).trim().withMessage('Password must be 8 character long.'),

	// sanitize fields
	sanitizeBody('oldPassword').escape(),
	sanitizeBody('newPassword').escape(),

	//Process  request after validation and sanitization
	async (req, res, next)=>{
  res.setHeader('content-type', 'application/json');
	const errors = validationResult(req);
	if(!errors.isEmpty()){
    res.status(200).json({ value: chatUser, error: errors.array() });
	} else {
		//Data from form is valid
    const chatUserId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    const chatUser = await ChatUser.findById(id, 'password').exec();
    
    if(!chatUser) {
      res.status(401).json({message: "User not found."});
      return;
    }
    
    // Decrypt current password
    const currentPassword = decrypt(chatUser.password);
    
    if(oldPassword !== currentPassword) {
      res.status(400).json({message: "Incorrect current password."});
      return;
    }
    
    const newPasswordHash = encrypt(newPassword);
    
		//Update an ChatUser pasword
    const chatUserToUpdate = new ChatUser({
      password: newPasswordHash,
      updated_at: Date.now(),
      _id : chatUserId
    });
    
    ChatUser.findByIdAndUpdate(chatUserId, chatUserToUpdate, {} ,function (err,updatedChatUser) {
      if(err) { return res.status(500).json(err); }
      // Successful updated
      res.status(200).json({message: "Password updated successfully.");
    });
	}
	},
];
    

// Handler chatUser update password
exports.chatUser_signin = [

	// Validate fields
  body('phone').isLength({min:8,max:20}).trim().withMessage('Phone must be specified.'),
  body('password').isLength({min:8,max:50}).trim().withMessage('Password must be 8 character long.'),

	// sanitize fields
	sanitizeBody('phone').escape(),
	sanitizeBody('password').escape(),

	//Process  request after validation and sanitization
	async (req, res, next)=>{
  res.setHeader('content-type', 'application/json');
	const errors = validationResult(req);
	if(!errors.isEmpty()){
    res.status(200).json({ value: chatUser, error: errors.array() });
	} else {
		//Data from form is valid
    const { phone, password } = req.body;
    
    const chatUser = await ChatUser.findOne({ phone }, 'id phone password name about').exec();
    
    if(!chatUser) {
      res.status(401).json({message: "User not found."});
      return;
    }
    
    // Decrypt current password
    const currentPassword = decrypt(chatUser.password);
    
    if(password !== currentPassword) {
      res.status(400).json({message: "Incorrect password."});
      return;
    }
    
    delete chatUser.password;
    
    res.status(200).json(chatUser);
	}
	},
];
