const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema({
  title1: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  title2: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
images:[]
});


const Action = mongoose.model("action", ActionSchema);
exports.Action= Action;
