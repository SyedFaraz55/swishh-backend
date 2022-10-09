const Joi = require("joi");
const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
    active:{type:Boolean},
  name: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  password: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  email: {
    type: String,
  },
  shopName: {
    type: String,
  },
  location: {
    type: String,
  },
  registerId: {
    type: String,
  },
  mobile:{type:String}
});

const Vendor = mongoose.model("vendor.app.users", VendorSchema);
exports.Vendor = Vendor;
