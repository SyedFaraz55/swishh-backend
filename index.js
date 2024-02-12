require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const movies = require("./routers/movies");
const users = require("./routers/users");
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const { Category } = require("./Schema/Category");
const { io, server,app } = require("./socket");
const { Vendor } = require("./Schema/VendorSchema");
const haversine = require("haversine");
const { Track } = require("./Schema/trackOrder");
const { Order } = require("./Schema/OrderSchema");
const PORT = process.env.PORT || 5000;
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// Set up a connection event
io.on('connection', (socket) => {

  // Handle order placement event
  socket.on('placeOrder', (order) => {

    // Simulate order processing (replace with your processing logic)
    setTimeout(() => {
      const processedOrder = {
        orderId: order.orderId,
        status: 'completed',
        message: 'Order processed successfully.',
      };
      
      // Send the processed order back to the client
      io.emit('orderProcessed', processedOrder);
    }, 2000);
  });

  // Handle disconnection event
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });


socket.on("process-order",async(data) => {
  let order = JSON.parse(data);
  const vendors = await Vendor.find({active:true});

  const vendorsWithlat_long = vendors.map(vendor => {
    return {
      ...vendor,
      lat_long:{
        latitude:Number(vendor.latitude),
        longitude:Number(vendor.longitude)
      }
    }
  });


  const withDistance2 = vendorsWithlat_long.map(distance => {
    const _distance = getDistanceFromLatLonInKm(order.data.location.latitude, order.data.location.longitude,distance.lat_long.latitude,distance.lat_long.longitude)
    return{
      ...distance,
      distance: _distance.toPrecision(2)
     }  
  })

  const final = withDistance2.reduce((shop,closest)=> {
    return (shop.distance < closest.distance ? shop : closest)
  },withDistance2[0]) ;


  const orderAssinged = new Track({
    orderId:order.data.id,
    user:order.data.user,
    assigne:final,
    nearbyVendors:withDistance2,
    extra:JSON.parse(data)
  });

   orderAssinged.save().then(()=> {
    io.emit("orderProcessed",JSON.stringify(orderAssinged))
   })



})  

socket.on("order-rejected",async(data)=> {
  if(!data) return
console.log("hittin logci>>>>>.")
  let parsed = JSON.parse(data)
console.log(parsed.orderId,'order id>>> from reeecte')
  const order =  await Track.findOne({orderId:parsed.orderId})
  const vendors = parsed.nearbyVendors;
  const avail_vendors = vendors.filter(v => (v.mobile != parsed.assigne.mobile));

  const final = avail_vendors.reduce((shop,closest)=> {
    return (shop.distance < closest.distance ? shop : closest)
  },avail_vendors[0]) ;

 parsed.assigne = final;


  try {
     await Track.updateOne({orderId:parsed.orderId},{
      $set:{
        assigne:final,
        nearbyVendors:avail_vendors
      }
    })
    io.emit("orderProcessed",JSON.stringify(parsed))
  }catch(err) {
    console.log(err.toString())
  }
   



})

socket.on("order-accepted",async(data)=> {
  if(!data) return

  let parsed = JSON.parse(data);
  console.log(parsed,'parsed..')
  await Track.deleteOne({orderId:parsed.orderId});

  try {
     await Order.updateOne({id:parsed.orderId},{
      $set:{
        assigne:parsed.assigne.mobile,
        order_status:"accepted"
      }
    })
  }catch(err) {
    console.log(err.toString())
  }

})

});




//Serves all the request which includes /images in the url from Images folder
app.use("/images", express.static(__dirname + "/uploads"));

app.use(morgan("tiny"));
app.use(cors());
app.use(bodyParser());

app.use((err, req, res, next) => {
  if (err) return res.status(500).send({ error: "Something failed!" });
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected"))
  .catch((err) => console.log(err.toString()));

app.use("/api/movies", movies);
app.use("/api/users",  users);

app.get("/menu", async (req, res) => {
  const rec = new DefectMenu(req.params.text);
  rec.save();
  return res.status(200).json({ ok: true });
});

app.get('/emit',()=>   io.emit('orderProcessed', "1224"));

server.listen(PORT, () => console.log(`@server running at port ${PORT}`));
