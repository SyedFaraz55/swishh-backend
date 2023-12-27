const mongoose = require("mongoose");

const TrackOrder = new mongoose.Schema({
  orderId:String,
  user:String,
  assigne:{},
  nearbyVendors:[],
  accepted:{
    type:Boolean,
    default:false
  },
  transferredto:String,
  extra:{}
});


const Track = mongoose.model("trackorder", TrackOrder);
exports.Track= Track;
