const express = require("express");
const router = express.Router();

//Require controller modules
const chatUser_controller = require("./../controllers/chatUser.controller");

//Required middlewares
const authentication = require("./../middleware/authentication");

/* ***chatUser ROUTES*** */

//POST request for creating a chatUser.
router.post("/signup", chatUser_controller.chatUser_create);

//POST signin chatUser
router.post("/signin", chatUser_controller.chatUser_signin);

//GET access tokens
router.get("/access", authentication.authenticateRefreshToken, chatUser_controller.chatUser_get_access_token);

//POST request to delete chatUser
router.delete("/:id", authenticate.authenticateAccessToken, chatUser_controller.chatUser_delete);

//GET request to update chatUser
router.put("/:id", authenticate.authenticateAccessToken, chatUser_controller.chatUser_update);

//GET request to get 1 chatUser
router.get("/:id", authenticate.authenticateAccessToken, chatUser_controller.chatUser_get);

//GET request to get all chatUsers
router.get("/", authenticate.authenticateAccessToken, chatUser_controller.chatUser_list);

// Export router
module.exports = router;
