var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const storyModel = require("./story");
const localStrategy = require("passport-local");
const upload = require("./multer");
const utils = require("../utils/utils");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/story/:number", isLoggedIn, async function (req, res) {
  const storyuser = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("stories");

  const image = storyuser.stories[req.params.number];

  if (storyuser.stories.length > req.params.number) {
    res.render("story", {
      footer: false,
      storyuser: storyuser,
      storyimage: image,
      number: req.params.number,
    });
  } else {
    res.redirect("/feed");
  }
});

router.get("/story/:id/:number", isLoggedIn, async function (req, res) {
  const storyuser = await userModel
    .findOne({ _id: req.params.id })
    .populate("stories");

  const image = storyuser.stories[req.params.number];

  if (storyuser.stories.length > req.params.number) {
    res.render("story", {
      footer: false,
      storyuser: storyuser,
      storyimage: image,
      number: req.params.number,
    });
  } else {
    res.redirect("/feed");
  }
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");
  const stories = await storyModel
    .find({ user: { $ne: user._id } })
    .populate("user");

  var obj = {};
  const packs = stories.filter(function (story) {
    if (!obj[story.user._id]) {
      obj[story.user._id] = "asdfghj";
      return true;
    }
  });

  res.render("feed", { footer: true, posts, user, stories: packs, dater: utils.formatRelativeTime });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts")
    .populate("saved");
    console.log(user);

  res.render("profile", { footer: true, user: user });
});

router.get("/profile/:user", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.username === req.params.user) {
    res.redirect("/profile");
  }

  let userprofile = await userModel
    .findOne({ username: req.params.user })
    .populate("posts");

  res.render("userprofile", { footer: true, userprofile, user });
});

router.get("/follow/:id",isLoggedIn, async (req, res)=>{
  let followkarnewala = await userModel.findOne({username: req.session.passport.user})
  let followhonewala = await userModel.findOne({_id:req.params.id});

  if(followkarnewala.followings.indexOf(followhonewala !== -1)){
    let index = followkarnewala.followings.indexOf(followhonewala._id);
    followkarnewala.followings.splice(index,1);

    let index2 = followhonewala.followers.indexOf(followkarnewala._id);
    followhonewala.followers.splice(index2,1);
  }else{
    followhonewala.followers.push(followkarnewala._id)
    followkarnewala.followings.push(followhonewala._id);
  }
  await followhonewala.save()
  await followkarnewala.save();
  
  res.redirect('back')
})


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
  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    user.saved.splice(user.saved.indexOf(req.params.postid), 1);
  }

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

router.get("/search", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("search", { footer: true, user });
});


router.get("/search/:user", isLoggedIn, async function (req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);

  let users = await userModel.find({ username: { $regex: regex } });

  res.json(users);
});

router.get("/upload", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("upload", { footer: true, user });
});

router.get("/like/:postId", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({ _id: req.params.postId });
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});

router.post(
  "/post",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    if (req.body.type === "post") {
      const post = await postModel.create({
        caption: req.body.caption,
        image: req.file.filename,
        user: user._id,
      });
      user.posts.push(post._id);
    } else if (req.body.type === "story") {
      const story = await storyModel.create({
        image: req.file.filename,
        user: user._id,
      });
      user.stories.push(story._id);
    }
    await user.save();
    res.redirect("/feed");
  }
);


router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.picture = req.file.filename;
    await user.save();
    res.redirect("/edit");
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
