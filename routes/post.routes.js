const express = require('express');
const postController = require("../controllers/post.controller");
const authController = require("../controllers/auth.controller");

// express router
let router = express.Router();


router.route('/')
    .get(postController.findAll)
    .post(authController.verifyToken, postController.create);

router.route('/:postID')
    .get(postController.findByID)
    .delete(authController.verifyToken, postController.delete);

router.route('/filter/:category') 
    .get(postController.findByCategory);    

router.route('/:postID/comments')
        //.get(postController.findCommentsByPost)  
        .put(authController.verifyToken, postController.createComment);

router.route('/:postID/likes') 
        .put(authController.verifyToken, postController.like);        
   
router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'POSTS: what???' });
})

module.exports = router;