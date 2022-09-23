const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  mobile: { type: String, require: true },
  otp: { type: String, require: true },
});

const OTP = new mongoose.model("otp", OTPSchema);
exports.OTP = OTP;
