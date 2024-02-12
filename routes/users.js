const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
 
mongoose.connect('mongodb://0.0.0.0/InstaGram')
 
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }],
  posts: [],
  story: [],
  messages: [],
  bio: String,
  email: String,
  password: String,
  profilePicture: String,
});
 
userSchema.plugin(plm)
 
module.exports = mongoose.model('user', userSchema)