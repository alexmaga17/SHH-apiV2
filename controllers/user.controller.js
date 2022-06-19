//const jwt = require("jsonwebtoken"); //JWT tokens creation (sign()) 
const bcrypt = require("bcryptjs"); //password encryption
const jwt = require("jsonwebtoken"); 

const config = require("../config/db.config.js");
const db = require("../models");
const User = db.users;

//Create a new user
exports.create = async (req, res) => {
    // create a document (instance of model Tutorial)
    const user = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        number: req.body.number,
        course: req.body.course,
        course_year: req.body.course_year,
        birthdate: req.body.birthdate,
        email: req.body.email,
        photo: req.body.photo,
        password:bcrypt.hashSync(req.body.password,10),
        confirmPassword:bcrypt.hashSync(req.body.confirmPassword,10),
        user_type: req.body.user_type,
    });
    try {
        if( await User.findOne({email:req.body.email}) || await User.findOne({username:req.body.username}) ){
            return res.status(403).json({success: false, msg: "Utilizador já a ser utilizado"})
        }else if(req.body.password.length < 8 || req.body.password.length > 16){
            return res.status(403).json({success: false, msg: "Palavra passe muito curta/comprida"})
        }else if(req.body.number.length != 8){
            return res.status(403).json({success: false, msg: "Número de aluno não suportado!"})
        }else{
            await user.save();
            res.status(201).json({ success: true, msg: "New user created.", URL: `/users/${user._id}` });
        }
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
                success: false, msg: err.message || "Ocorreu um erro ao criar este utilizador"
            });
    }

};

// Receber todos os utilizadores
exports.findAll = async (req, res) => {
      try {
        // if(req.loggedUserType != "admin")
        // return res.status(403).json({
        //     success: false, msg: "Requires ADMIN role"
        // });
        let users = await User.find({})
        .exec();
        res.status(200).json({success: true, users: users});
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the users."
        });

    }
};

//Encontrar users por ID
exports.findByID = async (req, res) => {
    try {
        const user = await User.findById(req.params.userID)
            .exec();
        // no data returned means there is no tutorial in DB with that given ID 
        if (user === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any user with ID ${req.params.userID}.`
            });
        // on success, send the tutorial data
        res.json({ success: true, user: user });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving user with ID ${req.params.userID}.`
        });
    }
};

// Encontrar utilizadores que são administradores
exports.findAdmins = async (req, res) => {
    try {
        let data = await User
            .find({ user_type: 'admin' })
            .exec(); 
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving admin users."
        });

    }
};

// Atualizar informação de algum utilizador
exports.update = async (req, res) => {
    try{
        const user = await User.findById(req.params.userID).exec();
        if(req.params.userID != req.loggedUserId){
            return res.status(404).json({
                success: false, msg: `Cannot update other users.`
            });
        }else{
            if(!req.body.password)
            return res.status(404).json({
                success: false, msg: `You have to provide a new password!`
            });
            else{
                Object.assign(user, bcrypt.hashSync(req.body.password,10));
                user.save();
                res.send({data:user});
            }
        }
    }catch(err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while updating user."
        });

    }
};

// Apagar um utilizador
exports.delete = async (req, res) => {
    try{
        if(req.loggedUserType != "admin")
        return res.status(403).json({success: false, msg: "Requires ADMIN role"});

        const user =  await User.findById(req.params.userID)
        .exec();
        if (user === null){
            return res.status(404).json({
                success: false, msg: `Cannot find any user with ID ${req.params.userID}.`
            });
        
        }else{
            await User.deleteOne({_id:req.params.userID}).exec();
            res.status(200).json({success: true, msg: `User with ID ${req.params.userID} succesfully removed.`});
        }
    }
    catch (err) {
        res.status(500).json({
            message:
                err.message || "Some error occurred while deleting post."
        });

    }
};

exports.login = async (req, res) => {
    try{
        if (!req.body || !req.body.email || !req.body.password)
            return res.status(400).json({ success: false, msg: "Must provide username and password." });
        
        const user = await User
        .findOne({ email: req.body.email})
        .exec();
        console.log(user);

        if (!user) return res.status(404).json({ success: false, msg: "User not found." });   
        
        const check = bcrypt.compareSync( req.body.password, user.password );
        if (!check) return res.status(401).json({ success:false, accessToken:null, msg:"Invalid credentials!" });

        const token = jwt.sign({ id: user.id, username:user.username, user_type: user.user_type },
            config.SECRET, { expiresIn: '24h' // 24 hours
        });
        console.log("---------------------------");
        console.log('logged in');
        console.log("---------------------------");
        return res.status(200).json({ success: true, accessToken: token, user:user });
            

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
                success: false, msg: err.message || "Some error occurred while loggin in."
            });
    }
};

exports.sendMessage = async (req, res) => {

    const user1 = await User.findById(req.loggedUserId);
    const user2 = await User.findById(req.params.userID);

    const chat_exists  = user1.chats.some((chat) => chat.user._id.toString() == req.params.userID.toString());
    console.log(chat_exists);

    try {

        if(chat_exists == true){
            const senderChat = user1.chats.find((chat) => chat.user._id.toString() == req.params.userID.toString());

            senderChat.messages.push({
                type:'sent',
                message:req.body.message,
                time: new Date()
            });


            const receiverChat = user2.chats.find((chat) => chat.user._id.toString() == req.loggedUserId.toString());

            receiverChat.messages.push({
                type:'received',
                message:req.body.message,
                time: new Date()
            });

            await user1.save();
            await user2.save();

        }else if(chat_exists == false){

            let messageReceive = await User.findOneAndUpdate({_id:req.params.userID},
                {$push:{ chats: {
                    user:user1,
                    messages: {type:'received',
                        message:req.body.message,
                        time: new Date()
                    },
            }}});

            let messageSend = await User.findOneAndUpdate({_id:req.loggedUserId},
                {$push:{ chats: {
                    user:user2,
                    messages: {type:'sent',
                        message:req.body.message,
                        time: new Date()
                    },
            }}});
        }             
       // on success, send the post data
        res.json({ success: true, message: user1 });
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving user with ID ${req.params.userID}.` 
        });
    }
}


