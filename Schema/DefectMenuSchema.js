const Joi = require("joi");
const mongoose = require("mongoose");

const DefectMenuSchema = new mongoose.Schema({
  text: {
    type: String,
    maxLength: 1024,
  }
});

// const ValidateUser = (payload) => {
//   const schema = Joi.object({
//     user: Joi.string().min(4).max(50).required(),
//     password: Joi.string().min(5).max(255).required(),
//     type: Joi.string()
//   });

//   return schema.validate(payload);
// };

const DefectMenu = mongoose.model("defectMenu", DefectMenuSchema);
exports.DefectMenu = DefectMenu;
// exports.ValidateUser = ValidateUser;
