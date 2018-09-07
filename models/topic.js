var mongoose = require('mongoose');

var userTopic = new mongoose.Schema({
  "userName":String,
  "topic":Array,
  "date":String,
  "zan":Number,
  "Id":String
});

module.exports = mongoose.model("Topic",userTopic);
