require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const movies = require("./routers/movies");
const users = require("./routers/users");
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const fileUpload = require("express-fileupload");
const { DefectMenu } = require("./Schema/DefectMenuSchema");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(fileUpload());

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

app.get("/menu",async(req,res)=> {
    const rec = new DefectMenu(req.params.text);
    rec.save();
    return res.status(200).json({ ok: true });
  
})

app.listen(PORT, () => console.log(`@server running at port ${PORT}`));
