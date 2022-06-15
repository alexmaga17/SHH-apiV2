const jwt = require("jsonwebtoken"); //JWT tokens creation (sign()) 
const bcrypt = require("bcryptjs"); //password encryption

const db = require("../models/index.js");
const Post = db.posts;
const Category = db.categories;
const User = db.users;

//Create a new post
exports.create = async (req, res) => {
    console.log('AQUIIIIIII');
    // create a document (instance of model Post)
    const post = new Post({
        category: await Category.findOne({category:req.body.category}),
        user: await User.findOne({_id:req.loggedUserId}),
        small_description: req.body.small_description,
        big_description: req.body.big_description,
        faq: req.body.faq,
        post_photo: req.body.post_photo,
    });

    try {
        await post.save(); // save Tutorial in the database
        console.log(post)
        res.status(201).json({ success: true, msg: "New post created.", URL: `/posts/${post._id}` });
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
                success: false, msg: err.message || "Ocorreu um erro ao criar este post"
            });
    }

};

// Receber todos os posts
exports.findAll = async (req, res) => {
    const id = req.query.id;

    let condition = id ? { id: new RegExp(id, 'i') } : {};

    try {
        let data = await Post
            .find(condition)
            .exec();

            console.log(data)
        res.status(200).json({success: true, posts: data});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the posts."
        });

    }
};

//Encontrar post por ID
exports.findByID = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID)
            .exec();
        if (post === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any post with ID ${req.params.postID}.`
        });
        // on success, send the tutorial data
        res.json({ success: true, post: post });
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving that post"
        });

    }
};

exports.findByCategory = async (req, res) => {
    try {
        const post = await Post.find({"category.category" :req.params.category})
        .exec();
        // no data returned means there is no tutorial in DB with that given ID 
        if (post === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any post with category ${req.params.category}.`
            });
        // on success, send the tutorial data
        res.json({ success: true, posts: post });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving post with category ${req.params.category}.`
        });
    }
};
//Apagar um post
exports.delete = async (req, res) => {
    try{
        const post = await Post.findById(req.params.postID)
        .exec();
        //console.log(post)
        if (post === null){
            return res.status(404).json({
                success: false, msg: `Cannot find any post with ID ${req.params.postID}.`
        });
        }else if(req.loggedUserType == "admin" || req.loggedUsername == post.username){
            await Post.deleteOne({_id:req.params.postID})
            .exec();
            res.status(200).json({success: true, msg: `Post with ID ${req.params.postID} succesfully removed.`});
        }else{
            console.log(post.username, req.loggedUsername);
            return res.status(403).json({success: false, msg: "Requires ADMIN role or be the post creator"});
        }
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while deleting post."
        });

    }
};

exports.createComment = async (req, res) => {
    const comment = {
        user:await User.findOne({_id:req.loggedUserId}).select('firstname lastname username photo'),
        comment:req.body.comment
    };
    try {
            const post = await Post.findOneAndUpdate(
                {_id:req.params.postID},
                {$push: {comments:comment}}
            )
        // on success, send the post data
        res.json({ success: true, post: post });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving post with ID ${req.params.postID}.` 
        });
    }
};

exports.like = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID); 

        if (post === null){
            return res.status(404).json({
                success: false, msg: `Cannot find any post with ID ${req.params.postID}.`
            });
               
        }else if(post.gamification.likes.includes(req.loggedUsername)){
            post.gamification.likes = post.gamification.likes.filter((like) => like !== req.loggedUsername);
            post.save();
            return res.status(200).json({
                success: true, msg: `Deleted like on post with ID ${req.params.postID}.`
            });
        }
        else{
            const like = req.loggedUsername;
            post.gamification.likes.push(like);
            post.save();
            console.log(like);
            res.json({ success: true, post: post });
        }

    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving post with ID ${req.params.postID}.` 
        });
    }
};

exports.giveReview = async (req, res) => {
    const review = {
        user:await User.findOne({username:req.loggedUsername}).select('username'),
        stars:req.body.stars
    };
    try {
            const post = await Post.findOneAndUpdate(
                {_id:req.params.postID},
                {$push: {"gamification.reviews":review}}
            )
        // on success, send the post data
        res.json({ success: true, post: post });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving post with ID ${req.params.postID}.` 
        });
    }
};