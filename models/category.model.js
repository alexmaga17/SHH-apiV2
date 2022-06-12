module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                category: {type: String, required: [true, "Categoria?"]},
                color_category: String,
                second_color_category: String,
                video_category: String,
                header: String
            },
            { timestamps: false }
        );
    // creates a new model Tutorial using the defined schema above
    const Category = mongoose.model("category", schema);
    return Category;
};