const Joi = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    minLength: 4,
    maxLength: 1024,
    required: true,
  },
  lastname: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  email: {
    type: String,
    minLength: 4,
    maxLength: 1024,
    required: true,
  },
  contact: {
    type: String,
    maxLength: 10,
    required: true,
  },
});

const ValidateUser = (payload) => {
  const schema = Joi.object({
    firstname: Joi.string().min(4).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    lastname: Joi.string().min(5).max(255),
    contact: Joi.string().required().max(10),
  });

  return schema.validate(payload);
};

const User = mongoose.model("test_users", UserSchema);
exports.User = User;
exports.ValidateUser = ValidateUser;
