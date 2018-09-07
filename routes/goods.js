var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/zyy',{ useNewUrlParser: true } );
mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

// 商品列表
router.get('/list',function (req,res,next) {
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let priceLevel = req.param("priceLevel");
  let sort = req.param("sort");
  let id = req.param("id");
  let skip = (page - 1)*pageSize;
  let params = {};
  var priceGt = '',priceLte = '';
  if(priceLevel != 'all'){
    switch (priceLevel) {
      case '0':priceGt = 0;priceLte = 3000;break;
      case '1':priceGt = 3000;priceLte = 6000;break;
    }
    params = {
      salePrice: {
        $gt:priceGt,
        $lte:priceLte
      }
    }
  }
let goodsModel = '';
  // 这里被我写死了，每页只显示8条数据
if(pageSize == 8){
  goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
} else if(id != ''){
  goodsModel = Goods.find({"productId": id});
}
  goodsModel.exec(function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message
      });
    }else {
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      })
    }
  })
});
// 搜索商品接口
router.post("/searchGoods",function (req,res,next) {
  var productName = req.body.goodsName;
  Goods.find({"productName":{'$regex':".*"+productName+".*"}},function (err,doc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      if(doc){
        res.json({
          status:"0",
          msg:'',
          result:doc
        })
      }else {
        res.json({
          status:"10",
          msg:'',
          result:'查无此号'
        })
      }
    }
  })
});
// 加入购物车
router.post("/addCart",function (req,res,next) {
  var userName = req.body.userName;
  var productId = req.body.productId;
  var User = require('../models/user');
  User.findOne({userName:userName},function (err,userDoc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      console.log("userDoc:"+userDoc);
      if(userDoc){
        let goodsItem = '';
        userDoc.cartList.forEach(function (item) {
          if(item.productId == productId){
            goodsItem = item;
            item.productNum ++;
          }
        });
        if(goodsItem){
          userDoc.save(function (err2,doc2) {
            if(err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else {
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          })
        }else {
          Goods.findOne({productId:productId},function (err1,doc) {
            if(err1){
              res.json({
                status:"1",
                msg:err1.message
              })
            }else {
              if(doc){
                doc.productNum = 1;
                doc.checked = 1;
                userDoc.cartList.push(doc);
                userDoc.save(function (err2,doc2) {
                  if(err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else {
                    res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
});
// 我的关注列表渲染
router.get("/interestList",function (req,res,next) {
  var userName = req.cookies.userName;
  var User = require('../models/user');
  User.findOne({userName:userName},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        mgs:'',
        result:doc.interestList
      })
    }
  })
});
// 添加关注
router.post("/addInterest",function (req,res,next) {
  var productId = req.body.productId;
  var userName = req.body.userName;
  var User = require('../models/user');
  User.findOne({userName:userName},function (err,userdoc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      if(userdoc){
        let goodsItem = '';
        if(goodsItem){
          userDoc.save(function (err2,doc2) {
            if(err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else {
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          })
        }else {
          Goods.findOne({productId:productId},function (err1,doc) {
            if(err1){
              res.json({
                status:"1",
                msg:err1.message
              })
            }else {
              if(doc){
                doc.checked = 1;
                userdoc.interestList.push(doc);
                userdoc.save(function (err2,doc2) {
                  if(err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else {
                    res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
});
// 取消关注
router.post("/delInterest",function (req,res,next) {
  var productId = req.body.productId;
  var userName = req.body.userName;
  var User = require('../models/user');
  User.update({userName:userName},{
    $pull:{
      'interestList':{
        'productId':productId
      }
    }
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
  });
});
// 查询是否是关注状态
router.post("/checkInterest",function (req,res,next) {
  var productId = req.body.productId;
  var userName = req.body.userName;
  var User = require('../models/user');
  User.findOne({'userName':userName,'interestList.productId':productId},function (err,doc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:'suc'
        })
      }else {
        res.json({
          status:'20',
          msg:'',
          result:'err'
        })
      }
    }
  })
});


module.exports = router;
