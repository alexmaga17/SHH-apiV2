const db = require("../models/index.js");
const Category = db.categories;

//Create a new post
exports.create = async (req, res) => {
    // create a document (instance of model Post)
    const category = new Category({
        id_category: req.body.id_category,
        category: req.body.category,
        color_category: req.body.color_category,
        second_color_category: req.body.second_color_category,
        video_category: req.body.video_category,
        header: req.body.header,

    });

    try {
        await category.save(); // save Tutorial in the database
        console.log(category)
        res.status(201).json({ success: true, msg: "New category created.", URL: `/categories/${category.id_category}` });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            let errors = [];
            Object.keys(err.errors).forEach((key) => {
                errors.push(err.errors[key].message);
            });
            return res.status(400).json({ success: false, msgs: errors });
        }
        else
            res.status(500).json({
                success: false, msg: err.message || "Ocorreu um erro ao criar esta categoria"
            });
    }

};

// Receber todos as categorias
exports.findAll = async (req, res) => {
    const id = req.query.id;

    let condition = id ? { id: new RegExp(id, 'i') } : {};

    try {
        let data = await Category
            .find(condition)
            .exec();
        res.status(200).json({success: true, categories: data});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the categories."
        });

    }
};

//Encontrar categoria por nome
exports.findName = async (req, res) => {
    try {
        let data = await Category
            .find({ category: req.params.category})
            .exec(); 
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving that category"
        });

    }
};

//Atualizar informação de categoria
exports.update = async (req, res) => {
    res.status(200).json({success: true, msg:'SUCESSO'});
};

//Apagar uma categoria
exports.delete = async (req, res) => {
    res.status(200).json({success: true, msg:'SUCESSO'});
};