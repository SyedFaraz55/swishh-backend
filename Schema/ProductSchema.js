const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String,  },
  image: { type: String,  },
  basePrice: { type: String,  },
  description: { type: String,  },
  discountPrice: { type: String, },
  category: { },
  stock: { type: String },
  variants:[{}]
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

const Product = mongoose.model("product.app", ProductSchema);
exports.Product = Product;
// exports.validate = validateUser;
