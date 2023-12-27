const mongoose = require("mongoose");

const Users = new mongoose.Schema({
  name: {
    type: String,
  },
  mobile: {
    type: String,
  },
  location:{},
  address:{},
  lat_long:{}
});


const User = mongoose.model("users", Users);
exports.User= User;
