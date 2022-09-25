const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
 active:{type:Boolean,required:true},
  id: { type: String, required: true },
  receipt: { type: String, required: true },
  order: { type: Array, required: true },
  user: { type: String, required: true },
  cartTotal:{type:String,required:true}
});

// const validateUser = (user) => {
//   const schema = Joi.object({
//     username: Joi.string().min(5).max(50).required(),
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(5).max(255).required(),
//     mobile:Joi.number().required()
//   });

//   return schema.validate(user);
// };

const Order = mongoose.model("order.app", OrderSchema);
exports.Order = Order;
// exports.validate = validateUser;
