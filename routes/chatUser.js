const express = require("express");
const router = express.Router();

//Require controller modules
const chatUser_controller = require("./../controllers/chatUser.controller");

/* ***chatUser ROUTES*** */

//POST request for creating a chatUser.
router.post("/chatUser/create", chatUser_controller.chatUser_create);

//POST request to delete chatUser
router.delete("/chatUser/:id", chatUser_controller.chatUser_delete);

//GET request to update chatUser
router.put("/chatUser/:id", chatUser_controller.chatUser_update);

//GET request to get 1 chatUser
router.get("/chatUser/:id", chatUser_controller.chatUser_get);

//GET request to get all chatUsers
router.get("/chatUser", chatUser_controller.chatUser_list);
