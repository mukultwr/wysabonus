const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/signup");

router.get("/", (req, res) => {
  res.sendFile("signup.html", { root: "views" });
});

router.post("/api/signup", signup);

router.post("/api/login", login);

module.exports = router;
