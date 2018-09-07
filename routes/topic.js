var express = require('express');
var router = express.Router();
require('./../util/util');

var User = require('./../models/user');
var Topic = require('./../models/topic');
// 添加留言
router.post("/addTopic",function (req,res,next) {
  var userName = req.body.userName;
  var topic = req.body.topic;
  var r1 = Math.floor(Math.random()*10);
  var sysDate = new Date().Format('yyyyMMddhhmmss');
  var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
  var Id = r1 + sysDate;
  var topices = {
    userName:userName,
    topic:topic,
    date:createDate,
    Id:Id,
    zan:0
  };
  new Topic(topices).save(function (err,doc) {
    if(err){
      return res.json({
        status:"1",
        msg:err.message
      })
    }
    res.json({
      status:"0",
      msg:'ok',
      result:{
        userName:doc.userName,
      }
    })
  })
});
// 获取topic列表
router.get("/topicList",function (req,res,next) {

  let sort = req.param("sort");
  let topicModel = '';
  topicModel = Topic.find({});
  topicModel.sort({'zan':sort});
  topicModel.exec(function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:{
          list:doc,
          count:doc.length
        }
      })
    }
  })
});
// 点赞
router.post("/Zan",function (req,res,next) {
  var Id = req.body.Id;
  var zan = parseInt(req.body.zan);
  Topic.update({"Id":Id},{
    "zan":zan
  },function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
});
module.exports = router;
