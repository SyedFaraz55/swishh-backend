require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const movies = require("./routers/movies");
const users = require("./routers/users");
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const { Category } = require("./Schema/Category");
const PORT = process.env.PORT || 5000;
const app = express();

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
app.use("/api/users", users);

app.get("/menu", async (req, res) => {
  const rec = new DefectMenu(req.params.text);
  rec.save();
  return res.status(200).json({ ok: true });
});



app.listen(PORT, () => console.log(`@server running at port ${PORT}`));
