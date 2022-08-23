const express = require("express");
const { ValidateUser, User } = require("../Schema/UserSchema");
const router = express.Router();

router.post("/all", async (req, res) => {
  const users = await User.findOne({user:"mohi"});
  if(users) {

  return res.status(200).json(users);
  } else {
    return res.json([])
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
    console.log(result)
    return res.status(200).json({ ok: true, message: "User deleted" });
  } catch (err) {
    return res.status(400).json(err);
  }
});

module.exports = router;
