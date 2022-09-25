const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
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


const Promotions = mongoose.model("promotions", PromotionSchema);
exports.Promotions= Promotions;
