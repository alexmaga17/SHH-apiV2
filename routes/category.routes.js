const express = require('express');
const categoryController = require("../controllers/category.controller");

// express router
let router = express.Router();


router.route('/')
    .get(categoryController.findAll)
    .post(categoryController.create);

router.route('/:category')
    .get(categoryController.findName)
    .put(categoryController.update)
    .delete(categoryController.delete);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: ' CATEGORIES: what???' });
})

module.exports = router;