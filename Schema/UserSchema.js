const Joi = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  password: {
    type: String,
    minLength: 4,
    maxLength: 1024,
  },
  type: {
    type: String,
  },
});

const ValidateUser = (payload) => {
  const schema = Joi.object({
    user: Joi.string().min(4).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
    type: Joi.string()
  });

  return schema.validate(payload);
};

const User = mongoose.model("test_users", UserSchema);
exports.User = User;
exports.ValidateUser = ValidateUser;
