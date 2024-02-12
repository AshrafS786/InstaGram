var express = require("express");
var router = express.Router();
const userModel = require("user-model");

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", function (req, res) {
  res.render("feed", { footer: true });
});

router.get("/profile", function (req, res) {
  res.render("profile", { footer: true });
});

router.get("/search", function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", function (req, res) {
  res.render("edit", { footer: true });
});

router.get("/upload", function (req, res) {
  res.render("upload", { footer: true });
});

router.post("/register", (req, res, next) => {
  var newUser = {
    //user data here
    //user data here
  };
  user
    .register(newUser, req.body.password)
    .then((result) => {
      passport.authenticate("local")(req, res, () => {
        //destination after user register
        res.redirect("/");
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

module.exports = router;
