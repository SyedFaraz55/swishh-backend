const Joi = require("joi");
const mongoose = require("mongoose");

const DefectMenuSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  page: {
    type: Boolean,
  },
  informative: {
    type: Boolean,
  },
  title:{
    type:String,
  },
  titleText:{
    type:String,
  } ,
  target:{
    type:String,
  } ,
  question:{
    type:String,
  } ,
  description:{
    type:String,
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
