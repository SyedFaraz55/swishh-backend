require("dotenv").config();
const express = require("express");
const { DefectMenu } = require("../Schema/DefectMenuSchema");
const { OTP } = require("../Schema/Otp");
const { ValidateUser, User } = require("../Schema/UserSchema");
const router = express.Router();
const Razorpay = require("razorpay");
const { Category } = require("../Schema/Category");
const accountSid = process.env.SSID;
const authToken = process.env.AUTH_TOKEN;
const s3 = require("../s3");
const { uploadFile } = require("../s3");
const axios = require("axios");
const client = require("twilio")(accountSid, authToken);
const multer = require("multer");
const { Product } = require("../Schema/ProductSchema");
const { Promotions } = require("../Schema/Promotions");
const shortid = require("shortid");
const { Order } = require("../Schema/OrderSchema");
const upload = multer({ dest: "uploads/" });
var razor = new Razorpay({
  key_id: "rzp_test_qxsRuZfigMmu3O",
  key_secret: "GyT6kJjJfDSt4b318RN56JTP",
});
router.post("/all", async (req, res) => {
  const users = await User.findOne({ user: req.body.user });
  console.log(users);
  if (users) {
    return res.status(200).json(users);
  } else {
    return res.json([]);
  }
});

router.post("/add-user", (req, res) => {
  const { error } = ValidateUser(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = new User(req.body);
    user.save();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error });
  }
});

router.post("/upload-file", async (req, res) => {
  console.log(req.files);
});

router.get("/menu/:text", async (req, res) => {
  console.log(req.params.text);
  try {
    const rec = new DefectMenu({ text: req.params.text });
    rec.save();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error });
  }
});

router.get("/menuget", async (req, res) => {
  const all = await DefectMenu.find();
  console.log(all);
  return res.status(200).json({ data: all });
});

router.put("/update", async (req, res) => {
  const record = await User.findById(req.body.id);

  if (!record)
    return res.status(200).json({ ok: true, message: "no user found" });

  try {
    const updated_rec = await User.findByIdAndUpdate(req.body.id, req.body);
    console.log(updated_rec);
    return res
      .status(200)
      .json({ ok: true, message: "Record Updated Successfully" });
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    console.log(result);
    return res.status(200).json({ ok: true, message: "User deleted" });
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.post("/send-otp", async (req, res) => {
  await OTP.deleteOne({ mobile: req.body.mobile });
  const NEW_OTP = Math.floor(1000 + Math.random() * 9000);
  try {
    const newOtp = new OTP({ mobile: req.body.mobile, otp: NEW_OTP });
    await newOtp.save();

    client.messages
      .create({
        body: `Your OTP is ${NEW_OTP}`,
        from: "+15512102808",
        to: req.body.mobile,
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

router.post("/verify-otp", async (req, res) => {
  const result = await OTP.findOne({ mobile: req.body.mobile });
  if (!result) return res.status(400).json({ ok: false });
  console.log(req.body);

  if (result?.otp == req.body.otp) {
    await OTP.deleteOne({ mobile: req.body.mobile });
    return res.status(200).json({ ok: true, message: "OTP Verified" });
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
    console.log(result, "result");
    return res.json({ ok: true, ...result, order, user,cartTotal:amount });
  } catch (err) {
    console.log(err);
  }
});

router.post("/create-order", async (req, res) => {
  console.log(req.body);
  try {
    const payload = await new Order({ ...req.body, active: true });
    payload.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ ok: false });
  }
});

router.post("/get-orders", async (req, res) => {
  const orders = await Order.find({ user: req.body.mobile });
  return res.status(200).json(orders);
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
  console.log(req.files);
  try {
    const s = await uploadFile(req.file);
    return res.send({ url: s.Location });
  } catch (err) {
    return res.send(err);
  }
});

router.post("/add-product", async (req, res) => {
  console.log(req.body);

  try {
    const products = new Product(req.body);
    await products.save();

    return res
      .status(200)
      .json({ ok: true, message: "Product Created Successfull" });
  } catch (error) {
    return res
      .status(400)
      .json({ ok: false, message: "Failed to add product" });
  }
});

router.get("/get-categories", async (req, res) => {
  const results = await Category.find({});
  return res
    .status(200)
    .json({ ok: true, data: results.length > 0 ? results : [] });
});

router.get("/get-products", async (req, res) => {
  const results = await Product.find({});
  return res
    .status(200)
    .json({ ok: true, data: results.length > 0 ? results : [] });
});

module.exports = router;
