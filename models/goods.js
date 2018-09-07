var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var produtSchema = new Schema({
  "productId":{type:String},
  "productName":String,
  "salePrice":Number,
  "checked":String,
  "productNum":Number,
  "productImage":String,
  "productUrl":String,
  "porductImgBig":String
});

module.exports = mongoose.model('Good',produtSchema);// 会自动去数据库中查找表
