const Joi = require("joi");
const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  active: { type: Boolean ,default:false},
  name: {
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
  mobile: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  address: { type: String },
  lname:{type:String},
  gst: { type: String },
  aadhar: { type: String },
  pan: { type: String },
  panNumber: { type: String },
  bank: { type: String },
  ifsc: { type: String },
  accName: { type: String },
  branch: { type: String },
  accNo: { type: String },
  accepted:{type:Boolean,default:false},
  isRegistered:{
    type:Boolean,
    default:false
  },
});

const Vendor = mongoose.model("vendor.app.users", VendorSchema);
exports.Vendor = Vendor;
