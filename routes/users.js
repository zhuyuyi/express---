var express = require('express');
var router = express.Router();
require('./../util/util');
var User = require('./../models/user');
var md5 = require('blueimp-md5');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// 登录
router.post('/login',function (req,res,next) {
  var param = {
    userName:req.body.userName,
    userPwd:md5(md5(req.body.userPwd))
  };
  User.findOne(param,function (err,doc) {
    if(err){
      return res.json({
        status:"1",
        msg:err.message
      });
    }
    if(!doc){
      return res.json({
        status:"2",
        msg:"用户不存在"
      })
    }
    // res.cookie("userId",doc.userId,{
    //   path:'/',
    //   maxAge:1000*60*60
    // });
    res.cookie("userName",doc.userName,{
      path:'/',
      maxAge:1000*60*60
    });
    res.json({
      status:"0",
      msg:"ok"
    })
  })
});
router.post("/register",function (req,res,next) {
  var param = {
    userName:req.body.userName
  };
  User.findOne(param,function (err,data) {
    if(err){
      return res.json({
        status:"1",
        msg:err.message
      });
    }
    if(data){
      if(data.userName == req.body.userName){
        return res.json({
          status:"2",
          msg:"用户名已存在"
        })
      }else {
        return;
      }
    }
      var body = req.body;
      body.userPwd = md5(md5(body.userPwd));
      new User(body).save(function (err,user) {
        if (err){
          return res.json({
            status:"1",
            msg:err.message
          })
        }
        res.json({
          status:"0",
          msg:'ok',
          result:{
            userName:user.userName
          }
        })
      })
  })
});
// 修改密码
router.post('/ChangePwd',function (req,res,next) {
  var param = {
    userName:req.body.userName,
    userPwd:md5(md5(req.body.userPwd))
  };
  var userName=req.body.userName;
  var userPwdNew = md5(md5(req.body.userPwdNew));
  User.findOne(param,function (err,doc) {
    if(err){
      return res.json({
        status:"1",
        msg:err.message
      });
    }
    if(!doc){
      return res.json({
        status:"2",
        msg:"用户名密码错误"
      })
    }
    User.updateOne({"userName":userName},{
      "userPwd":userPwdNew
    },function (err1,doc1) {
      if(err1){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        res.json({
          status:'0',
          msg:'',
          result:'suc'
        })
      }
    })
  });
});
// 登出接口
router.post("/logout",function (req,res,next) {
  res.cookie("userName","",{
    path:'/',
    maxAge:-1,
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});
// 判断是否是登录状态
router.get("/checkLogin",function (req,res,next) {
  if(req.cookies.userName){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName || ''
    })
  }else {
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    })
  }
});
// 获取购物车数量
// router.get("/getCartCount",function (req,res,next) {
//   if(req.cookies && req.cookies.userName){
//     var userName = req.cookies.userName;
//     User.findOne({userName:userName},function (err,doc) {
//       if(err){
//         res.json({
//           status:'1',
//           msg:err.message,
//           result:''
//         })
//       }else {
//         var cartList = doc.cartList;
//         let cartCount = 0;
//         cartList.map(function (item) {
//           cartCount += parseInt((item.productNum));
//         });
//         res.json({
//           status:"0",
//           msg:"",
//           result:cartCount
//         });
//       }
//     })
//   }
// });
// 用户购物车数据
router.get("/cartList",function (req,res,next) {
  var userName = req.cookies.userName;
  User.findOne({userName:userName},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.cartList
        })
      }
    }
  })
});
// 购物车删除
router.post("/cartDel",function (req,res,next) {
  var userName = req.cookies.userName;
  var productId = req.body.productId;
  User.update({userName:userName},{
    $pull:{
      'cartList':{
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
// 购物车修改
router.post("/cartEdit",function (req,res,next) {
  var userName = req.cookies.userName,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({"userName":userName,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
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
// 购物车按钮是否选中
router.post("/editCheckAll",function (req,res,next) {
  var userName = req.cookies.userName,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userName:userName},function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function (err1,docc) {
          if(err1){
            res.json({
              status:'1',
              msg:err1.message,
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
      }
    }
  });
});
// 查询用户地址接口
router.get("/addressList",function (req,res,next) {
  var userName = req.cookies.userName;
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
        result:doc.addressList
      })
    }
  })
});
// 设置默认地址
router.post("/setDefault",function (req,res,next) {
  var userName = req.cookies.userName;
  var addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      mgs:'addressId is null',
      result:''
    })
  }else {
    User.findOne({userName:userName},function (err,doc) {
      if(err){
        res.json({
          status:'1',
          mgs:err.message,
          result:''
        })
      }else {
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId == addressId){
            item.isDefault = true;
          }else {
            item.isDefault = false;
          }
        });
        doc.save(function (err1,doc1) {
          if(err1){
            res.json({
              status:'1',
              mgs:err1.message,
              result:''
            })
          }else {
            res.json({
              status:'0',
              mgs:'',
              result:''
            })
          }
        })
      }
    })
  }
});
// 删除地址
router.post("/delAddress",function (req,res,next) {
  var userName = req.cookies.userName,
       addressId = req.body.addressId;
  User.update({
    userName:userName
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
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
        result:''
      })
    }
  })
});
// 添加地址
router.post('/addAddress',function (req,res,next) {
  var userName = req.cookies.userName;
  var addres = {
    name:req.body.name,
    tel:req.body.tel,
    postCode:req.body.postCode,
    addressId:req.body.addressId,
    streetName:req.body.streetName
  };
  User.findOne({userName:userName},function (err,doc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      });
    }else {
      doc.addressList.push(addres);
      doc.save(function (err1,doc1) {
        if(err1) {
          res.json({
            status: "1",
            msg: err.message,
            result: ''
          });
        }else {
          res.json({
            status: "0",
            msg: "",
            result: 'suc'
          });
        }
      })
    }
  })
});
// 编辑地址
router.post('/addressEdit',function (req,res,next) {
  var userName = req.cookies.userName;
  var name=req.body.name,
      tel=req.body.tel,
      postCode=req.body.postCode,
      addressId=req.body.addressId,
      streetName=req.body.streetName;
  User.update({"userName":userName,"addressList.addressId":addressId},{
    "addressList.$.name":name,
    "addressList.$.tel":tel,
    "addressList.$.postCode":postCode,
    "addressList.$.streetName":streetName
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
        result:'success'
      })
    }
  })
});
// 生成订单
router.post("/payMent",function (req,res,next) {
  var userName = req.cookies.userName,
       orderTotal = req.body.orderTotal,
       addressId = req.body.addressId;
  User.findOne({userName:userName},function (err,doc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    }else {
      var address = '';var goodsList = [];
      doc.addressList.forEach((item)=>{
        if(addressId == item.addressId){
          address = item;
        }
      });
      doc.cartList.filter((item)=>{
        if(item.checked=='1'){
          goodsList.push(item);
        }
      });
      var platForm = '0912';  // 我生日
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platForm + r1 + sysDate + r2;

      var order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:doc.orderList.length,
        createDate:createDate
      };
      doc.orderList.push(order);
      doc.save(function (err1,doc1) {
        if(err){
          res.json({
            status:'1',
            msg:err1.message,
            result:''
          })
        }else {
          res.json({
            status:"0",
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      });
    }
  })
});
// 订单列表
router.get("/orderList",function (req,res,next) {
  var userName = req.cookies.userName;
  User.findOne({userName:userName},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.orderList
        })
      }
    }
  })
});
// 根据订单Id查订单信息
router.get("/orderDetail",function (req,res,next) {
  var userName = req.cookies.userName;
  var orderId = req.param("orderId");
  User.findOne({userName:userName},function (err,userInfo) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      var orderList = userInfo.orderList;
      var addressInfo = {};
      var goodsList = [];
      var createDate = '';
      if(orderList.length>0){
        var orderTotal = 0;
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
            addressInfo = item.addressInfo;
            goodsList = item.goodsList;
            createDate = item.createDate;
          }
        });
        if(orderTotal > 0){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal,
              addressInfo: addressInfo,
              goodsList:goodsList,
              createDate:createDate
            }
          })
        }else {
          res.json({
            status:'1000002',
            msg:'无此订单',
            result:''
          })
        }
      }else {
        res.json({
          status:'1000001',
          msg:'当前用户无订单',
          result:''
        })
      }
    }
  })
});
// 订单删除
router.post("/delOrder",function (req,res,next) {
  var userName = req.cookies.userName;
  var orderId = req.body.orderId;
  User.update({userName:userName},{
    $pull:{
      'orderList':{
        'orderId':orderId
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

module.exports = router;
