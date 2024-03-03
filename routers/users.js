require("dotenv").config();
const express = require("express");
const { OTP } = require("../Schema/Otp");
const router = express.Router();
const Razorpay = require("razorpay");
const { Category } = require("../Schema/Category");
const accountSid = process.env.SSID;
const authToken = process.env.AUTH_TOKEN;
const s3 = require("../s3");
const { uploadFile } = require("../s3");
const axios = require("axios");
const client = require("twilio")(accountSid, authToken);
const { Product } = require("../Schema/ProductSchema");
const { Promotions } = require("../Schema/Promotions");
const shortid = require("shortid");
const { Order } = require("../Schema/OrderSchema");
const { Vendor } = require("../Schema/VendorSchema");
const multer = require("multer");
const { Inventory } = require("../Schema/Inventory");
const { User } = require("../Schema/User");
const { io, server } = require("../socket");
const upload = multer({ dest: "uploads/" });
var razor = new Razorpay({
  key_id: "rzp_test_qxsRuZfigMmu3O",
  key_secret: "GyT6kJjJfDSt4b318RN56JTP",
});

router.get("/get-all", async (req, res) => {
  const users = await User.find({});
  return res.status(200).json(users);
});

router.get("/health", async (req, res) => {
  return res
    .status(200)
    .json({ ok: true, message: "server is up and running..." });
});

router.post("/send-otp", async (req, res) => {
  await OTP.deleteOne({ mobile: req.body.mobile });
  const NEW_OTP = Math.floor(1000 + Math.random() * 9000);
  try {
    const newOtp = new OTP({ mobile: req.body.mobile, otp: NEW_OTP });
    await newOtp.save();
    // return res.status(200).json({ ok: true });
    client.messages
      .create({
        body: `Your OTP is ${NEW_OTP}`,
        from: process.env.MOBILE_NUMBER,
        to: `+91${req.body.mobile}`,
      })
      .then((message) => {
        if (message.sid) {
          return res.status(200).json({ ok: true });
        } else {
          return res.status(400).json({ ok: false });
        }
      });
  } catch (err) {
    return res.status(400).json({ ok: false, err });
  }
});

router.post("/update-location", async (req, res) => {
  try {
    const location = await User.updateOne(
      { mobile: req.body.mobile },
      {
        $set: {
          ...req.body,
        },
      },
    );
    if (location.modifiedCount > 0) {
      return res.status(200).json({ ok: true, location });
    } else {
      return res.status(200).json({ ok: false });
    }
  } catch (err) {
    return res.status(400).json({ ok: false, err });
  }
});

router.post("/user-otp", async (req, res) => {
  const result = await OTP.findOne({ mobile: req.body.mobile });
  console.log(result, "resul >>>");
  // result?.otp == req.body.otp
  if (true) {
    await OTP.deleteOne({ mobile: req.body.mobile });
    const user = new User(req.body);
    await user.save();
    return res.status(200).json({
      ok: true,
      message: "OTP Verified",
      mobile: req.body.mobile,
      user,
    });
  } else {
    return res.status(200).send({ ok: false, message: "Invalid OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  // const result = await Vendor.findOne({ mobile: req.body.mobile });
  const verifiedOTP = await OTP.findOne({ mobile: req.body.mobile });
  // if (!result)
  //   return res
  //     .status(400)
  //     .json({ ok: false, message: "Vendor Doesn't exits." });
      // verifiedOTP?.otp == req.body.otp
  if (true) {
    await OTP.deleteOne({ mobile: req.body.mobile });
    const isVendorRegistered = await Vendor.findOne({
      mobile: req.body.mobile,
    });
    return res.status(200).json({
      ok: true,
      message: "OTP Verified",
      isRegistered: isVendorRegistered?.isRegistered,
      mobile: req.body.mobile,
      data: result,
    });
  } else {
    return res.status(200).send({ ok: false, message: "Invalid OTP" });
  }
});

router.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

router.post("/razorpay", async (req, res) => {
  const { amount, user, order } = req.body;
  try {
    const result = await razor.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: shortid.generate(),
    });
    return res.json({ ok: true, ...result, order, user, cartTotal: amount });
  } catch (err) {
    console.log(err);
  }
});

io.on("process-order", () => {
  console.log("order processing...");
});

router.post("/create-order", async (req, res) => {
  try {
    const payload = await new Order({ ...req.body, active: true });
    payload.save();
    return res.status(200).json({ ok: true, data: payload });
  } catch (err) {
    return res.status(400).json({ ok: false });
  }
});

router.post("/get-orders", async (req, res) => {
  const orders = await Order.find({ user: req.body.mobile });
  return res.status(200).json(orders);
});

router.post("/getall-orders", async (req, res) => {
  const orders = await Order.find({});
  return res.status(200).json(orders);
});

router.get("/get-vendors", async (req, res) => {
  const vendors = await Vendor.find({});
  return res.status(200).json(vendors);
});

router.post("/add-category", async (req, res) => {
  console.log(req.body);
  try {
    const category = await new Category(req.body);
    category.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ ok: false });
  }
});

router.post("/add-promotions", async (req, res) => {
  try {
    const result = await new Promotions(req.body);
    result.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ ok: false });
  }
});

router.post("/s3url", upload.single("file"), async (req, res) => {
  console.log(req.file);
  try {
    const s = await uploadFile(req.file);
    return res.send({ url: s.Location });
  } catch (err) {
    return res.send(err);
  }
});

router.post(
  "/upload-action-files",
  upload.array("file", 2),
  async (req, res) => {
    console.log(req.files);
    let rest = [];
    for (let i = 0; i < req.files.length; i++) {
      try {
        const s = await uploadFile(req.files[i]);
        rest.push(s.Location);
      } catch (err) {
        return res.json({ ok: false });
      }
    }

    return res.json({ ok: true, data: rest });
  },
);

router.post("/add-product", async (req, res) => {
  console.log(req.body);

  try {
    const products = new Product(req.body);
    await products.save();

    return res
      .status(200)
      .json({ ok: true, message: "Product Created Successfull" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ ok: false, message: "Failed to add product" });
  }
});

router.post("/remove-product", async (req, res) => {
  const results = await Product.deleteOne({ _id: req.body.id });
  console.log(results);
  return res.status(200).json({ ok: true });
});

router.get("/get-categories", async (req, res) => {
  const results = await Category.find({});
  return res
    .status(200)
    .json({ ok: true, data: results.length > 0 ? results : [] });
});

router.post("/delete-menu", async (req, res) => {
  const result = await Category.deleteOne({ _id: req.body.id });
  console.log(result);
  if (result) return res.json({ ok: true });
});

router.get("/get-products", async (req, res) => {
  const results = await Product.find({});
  return res
    .status(200)
    .json({ ok: true, data: results.length > 0 ? results : [] });
});

router.post("/add-vendor", async (req, res) => {
  // const vdr = await Vendor.find({ mobile: req.body.mobile });
  // if (vdr)
  //   return res.send(200).json({ ok: false, message: "Vendor already exits" });

  console.log(req.body);
  try {
    const vendor = new Vendor({ ...req.body, isRegistered: true });
    vendor.save();
    return res
      .status(200)
      .json({ ok: true, message: "Vendor Created successfully." });
  } catch (err) {
    return res
      .status(400)
      .json({ ok: false, message: "Failed to create vendor." });
  }
});

router.post("/activate-vendor", async (req, res) => {
  const vendor = await Vendor.updateOne(
    { _id: req.body.id },
    {
      $set: {
        active: req.body.payload,
      },
    },
  );
  if (vendor.matchedCount > 0 || vendor.acknowledged) {
    return res.status(200).json({ ok: true, message: "Status Changed" });
  } else {
    return res
      .status(200)
      .json({ ok: false, message: "Failed to change status" });
  }
});

router.post("/add-promotion", async (req, res) => {
  try {
    const result = new Promotions(req.body);
    result.save();
    return res.status(200).json({ ok: true, message: "Promotion added" });
  } catch (err) {
    return res.status(200).json({ ok: false, message: "Something went wrong" });
  }
});

router.get("/promotions", async (req, res) => {
  try {
    const result = await Promotions.find({});
    return res
      .status(200)
      .json({ ok: true, message: "Promotion added", data: result });
  } catch (err) {
    return res.status(200).json({ ok: false, message: "Something went wrong" });
  }
});

router.post("/delete-promotion", async (req, res) => {
  const promo = await Promotions.deleteOne({ _id: req.body.id });

  if (promo.deletedCount > 0) {
    return res.status(200).json({ ok: true, message: "Promotion Deleted" });
  } else {
    return res
      .status(200)
      .json({ ok: false, message: "Failed to delete Promotion" });
  }
});

router.post("/delete-vendor", async (req, res) => {
  const vendor = await Vendor.deleteOne({ _id: req.body.id });

  if (vendor.deletedCount > 0) {
    return res.status(200).json({ ok: true, message: "Vendor Deleted" });
  } else {
    return res
      .status(200)
      .json({ ok: false, message: "Failed to delete vendor" });
  }
});

router.post("/vendor-action", async (req, res) => {
  const vendor = await Vendor.updateOne(
    { _id: req.body.id },
    {
      $set: {
        accepted: req.body.payload,
        active: req.body.payload ? true : false,
      },
    },
  );
  if (vendor.matchedCount > 0 || vendor.acknowledged) {
    return res.status(200).json({ ok: true, message: "Status Changed" });
  } else {
    return res
      .status(200)
      .json({ ok: false, message: "Failed to change status" });
  }
});

router.post("/login-vendor", async (req, res) => {
  await OTP.deleteMany({ mobile: req.body.mobile });
  const NEW_OTP = Math.floor(1000 + Math.random() * 9000);
  const newOtp = new OTP({ mobile: req.body.mobile, otp: NEW_OTP });
  await newOtp.save();
  return res
  .status(200)
  .json({ ok: true, message: `OTP sent to ${req.body.mobile}` }); 
  try {
    const newOtp = new OTP({ mobile: req.body.mobile, otp: NEW_OTP });
    await newOtp.save();
    client.messages
      .create({
        body: `Swishh - Your OTP is ${NEW_OTP}`,
        from: process.env.MOBILE_NUMBER,
        to: `+91${req.body.mobile}`,
      })
      .then((message) => {
        console.log(message);
        if (message.sid) {
          return res
            .status(200)
            .json({ ok: true, message: `OTP sent to ${req.body.mobile}` });
        } else {
          return res.status(400).json({ ok: false });
        }
      });
  } catch (err) {
    console.log(err);
    // return res.status(400).json({ ok: false, err });
  }
  // const result = await Vendor.findOne({ mobile: req.body.mobile });
  // if (result) {

  //     return res.status(200).send({ ok: false });
  // } else {
  //   return res.status(200).json({ ok: false });
  // }
});

//vendor

router.get("/profile/:id", async (req, res) => {
  const profile = await Vendor.findById({ _id: req.params.id });
  res.send(profile);
});

router.post("/profile/status", async (req, res) => {
  try {
    const record = await Vendor.updateOne(
      { _id: req.body.id },
      {
        $set: {
          active: req.body.status,
        },
      },
    );
    return res.json({ ok: true, message: "Status updated" });
  } catch (ex) {
    return res.json({ ok: false, message: "Failed to update status" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const inventoryData = req.body;
    const inventory = new Inventory(inventoryData);
    await inventory.save();
    res.status(201).json({ ok: true, message: "Product added to inventory" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to create inventory item" });
  }
});

router.get("/inventory/:id", async (req, res) => {
  try {
    const inventory = await Inventory.find({ vendorId: req.params.id })
      .populate("product")
      .exec();
    res.status(201).json({ ok: true, inventory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to load inventory " });
  }
});

// Delete an Inventory item
router.delete("/inventory/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const inventory = await Inventory.findByIdAndRemove({ _id: id });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json({ ok: true, message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete inventory item" });
  }
});

// vendors
router.get("/vendor-inventory/:id", async (req, res) => {
  const data = await Inventory.find({ vendor: req.params.id }).count();
  console.log(data);
  return res.json(data);
});

router.post("/vendor/order-status", async (req, res) => {
  const assigne = await Order.findOne({ _id: req.body.id });

  console.log(assigne);
  try {
    const stat = await Order.updateOne(
      { _id: req.body.id },
      {
        $set: {
          order_status: "completed",
          active: req.body.status,
        },
      },
    );
    if (stat.modifiedCount > 0) {
      await Vendor.updateOne(
        { mobile: assigne.assigne },
        {
          $inc: { orders_completed: 1, total_earnings: assigne.cartTotal },
        },
      );
      return res.json({
        ok: true,
        message: "order status updated successfully.",
      });
    }
  } catch (ex) {
    return res.json({ ok: false, message: "Failed to update order status." });
  }
});

router.get("/my-orders/:mobile", async (req, res) => {
  const data = await Order.find({ assigne: req.params.mobile });
  return res.json(data);
});

router.get("/vendor-info/:mobile", async (req, res) => {
  const data = await User.find({ mobile: req.params.mobile });
  console.log(data);
  return res.json(data);
});
// ADMIN
router.get("/stats", async (req, res) => {
  const vendors = await Vendor.find().count();
  const orders = await Order.find();
  const sum = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrder: { $sum: 1 },
        totalRevenue: { $sum: "$cartTotal" },
      },
    },
  ]);
  return res.status(200).json({ vendors, stats: sum[0], orders });
});

module.exports = router;
