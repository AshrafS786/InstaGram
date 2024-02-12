const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
 
mongoose.connect('mongodb://0.0.0.0/InstaGram')
 
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }],
  story: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }],
  messages: {
    type: Array,
    default: []
  },
  profilePicture: String,
  bio: String,
  password: String,
  email: String,
});
 
userSchema.plugin(plm)
 
module.exports = mongoose.model('user', userSchema)