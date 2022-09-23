const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  image: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
});


const Category = mongoose.model("category", CategorySchema);
exports.Category= Category;
