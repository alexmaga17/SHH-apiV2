module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                category: {},
                user: {},
                small_description: String,
                big_description: String,
                faq: String,
                post_photo: String,
                comments:Array,
                gamification:{
                    likes:Array,
                    reviews:Array
                },
            },
            { timestamps: false }
        );
    // creates a new model Tutorial using the defined schema above
    const Post = mongoose.model("post", schema);
    return Post;
};