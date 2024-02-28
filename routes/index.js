var express = require("express");
const passport = require("passport");
var router = express.Router();
const localStrategy = require("passport-local");
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn,async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find()
  .populate('user')

  res.render("feed", { footer: true, posts, user });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate('posts');

  res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/user/:username", isLoggedIn, async function (req, res) {
  var val = req.params.username;
  const users = await userModel.find({ username: new RegExp("^" + val, "i") });
  res.json(users);
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.get("/save/:postid", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  // const post = await postModel.findOne({ _id: req.params.postid });
  user.saved.push(req.params.postid); 
  await user.save();
  res.json(user);
});

router.post("/update", isLoggedIn, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    {
      username: req.session.passport.user,
    },
    {
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio,
    },
    { new: true }
  );

  req.logIn(user, function (err) {
    if (err) throw err;
    res.redirect("/profile");
  });
});

router.post(
  "/upload/profilepic",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profilepicture = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload", { footer: true });
});

router.get("/like/:postId", isLoggedIn,async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({_id: req.params.postId});
  if(post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  }
  else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});

router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      caption: req.body.caption,
      image: req.file.filename,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  }
);

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
