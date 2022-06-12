module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                username: {type: String, required: [true, "Nome de utilizador?"]},
                firstname: String,
                lastname: String,
                number: String,
                course: String,
                course_year: String,
                birthdate: String,
                email: {type: String, required: [true, "E-MAIL?"]},
                photo: String,
                password: {type: String, required: [true, "Palavra-passe?"]},
                confirmPassword: {type: String, required: [true, "Confirme a palavra passe"]},
                user_type: {type: String,
                    enum:{
                        values:['user','admin'],
                        message: '{VALUE} is not supported'
                    },
                    default: 'user'},
                messages:{
                    username:String,
                    content:String
                },
                degree:{
                    name:String,
                    details:String,
                },   
            },
            { timestamps: false }
        );
    // creates a new model Tutorial using the defined schema above
    const User = mongoose.model("user", schema);
    return User;
};