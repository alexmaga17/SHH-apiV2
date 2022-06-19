const express = require('express');
const userController = require("../controllers/user.controller.js");
const authController = require("../controllers/auth.controller.js");
const jwt = require("jsonwebtoken"); 

// express router
let router = express.Router();


router.route('/')
    .get(/*authController.verifyToken,*/ userController.findAll)
    .post(userController.create);

router.route('/login')
    .post(userController.login);    

router.route('/admins')
    .get(authController.verifyToken, userController.findAdmins);

router.route('/:userID') 
    .get(authController.verifyToken, userController.findByID)
    .patch(authController.verifyToken,userController.update)
    .delete(authController.verifyToken, userController.delete);    

router.route('/:userID/messages')
    .put(authController.verifyToken, userController.sendMessage);    

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'USERS: what???' });
})

module.exports = router;