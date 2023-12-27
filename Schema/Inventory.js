const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"vendor.app.users"
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product.app",
  },
  variants:[
    
  ]
});


const Inventory = mongoose.model("inventory", InventorySchema);
exports.Inventory= Inventory;
