const express = require("express");
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser.middleware')
const MessageController = require('../controllers/message.controller')

router.get('/', verifyUser, MessageController.getMessages)

module.exports = router;