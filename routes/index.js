var express = require("express")
const passport = require("passport");
var router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local");
const multer  = require('multer')
const {v4: uuid} = require('uuid');
const path = require("path");

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const fn = uuid()+path.extname(file.originalname) 
    cb(null, fn)
  }
})

const upload = multer({ storage: storage })

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed", { footer: true });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({
    username: req.session.passport.user,
  });

  res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, function (req, res) {
  res.render("edit", { footer: true });
});

router.post("/upload/profilepic", isLoggedIn, upload.single('image'),async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profilepicture = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

router.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload", { footer: true });
});

router.post("/register", (req, res, next) => {
  var userDets = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(userDets, req.body.password).then(function (reg) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/feed");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  }),
  (req, res, next) => {}
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
