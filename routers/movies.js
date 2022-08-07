const express = require("express");
const router = express.Router();
const data = require("../data.json");

router.get("/", (req, res) => {
  return res.status(200).json(data);
});

router.get("/details/:name", (req, res) => {
  const { name } = req.params;
  const result = data?.find(
    (movie) => movie.name.trim().toLowerCase() == name.trim().toLowerCase()
  );

  return res.status(200).json(result);
});

module.exports = router;
