const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const child_process = require('child_process');
const sql = require('./mysql');
const WXBizDataCrypt = require('./WXBizDataCrypt')
let appId = 'wx5dc58610ae5f38e4'
let appSecret = 'd02f9554591b6bb41fc52fe27178bc1a'
let tokenStore = require('./session')
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function checkForm(data, arr) {
  for (let i = 0; i < arr.length; i++) {
    if(data[arr[i]] === undefined) return false
  }
  return true
}

// 添加task
app.get('/', function (req, res) {
  res.send({
    code: 0,
    msg: '成功'
  })
});

app.post('/api/add-monitor', function (req, res) {
  let must = ['token', 'hospitalId', 'departmentId', 'targetDay', 'phone']
  if (checkForm(req.body, must)) {
    let userInfo = tokenStore.get(req.body.token)
    if (!userInfo) {
      res.send({
        code: 3,
        msg: '登录过期'
      })
      return false
    }
    req.body.openId = userInfo.openId
    sql.addTask(req.body).then(function(){
      res.send({
        code: 0,
        msg: '添加成功'
      })
    }).catch(function () {
      res.send({
        code: 2,
        msg: '添加失败'
      })
    })
  } else {
    res.send({
      code: 1,
      msg: '参数错误'
    })
  }
});

app.post('/api/login', function (req, res) {
  let must = ['code', 'encryptedData', 'iv']
  if (!checkForm(req.body, must)) {
    res.send({
      code: 1,
      msg: '参数错误'
    })
    return false
  }
  // 查询openId
  request({
    url: 'https://api.weixin.qq.com/sns/jscode2session?appid='+appId+'&secret='+appSecret+'&js_code='+req.body.code+'&grant_type=authorization_code',
    method: 'get',
    json: true,
    headers: {
      'content-type': 'application/json'
    }
  }, function(error, response, body) {
    if (!error && response.statusCode == 200 && body.session_key) {
      let userInfo = new WXBizDataCrypt(appId, body.session_key).decryptData(req.body.encryptedData , req.body.iv)
      let token = tokenStore.set(userInfo)
      // 查看数据库中是否已经添加
      sql.searchUsers({openId:userInfo.openId}).then(function (res){
        userInfo.loginTime = new Date().toJSON()
        if (res.length === 0) {
          sql.addUser(userInfo).then(function (res) {
            console.log(res)
          }).catch(function (err) {
            console.log(err)
          })
        }else {
          console.log(res[0].loginTime)
          console.log(userInfo.loginTime)
          sql.updateUser(userInfo).then(function (res) {
            console.log(res)
          }).catch(function (err) {
            console.log(err)
          })
        }
      }).catch(function (err) {
        console.log(err)
      })
      res.send({
        code: 0,
        msg: '登录成功',
        data: {
          token: token
        }
      })
    }else {
      res.send({
        code: 1,
        msg: '登录失败',
      })
    }
  });
});

app.post('/api/check-login', function (req, res) {
  if (req.body.token) {
    let userInfo = tokenStore.get(req.body.token)
    if (userInfo) {
      res.send({
        code: 0,
        msg: '已登录'
      })
    }else {
      res.send({
        code: 2,
        msg: '登陆过期'
      })
    }
  }else {
    res.send({
      code: 1,
      msg: '参数错误'
    })
  }
});

var workerProcess = child_process.exec('node monitor.js ', function (error, stdout, stderr) {
  if (error) {
    console.log(error.stack);
    console.log('Error code: '+error.code);
    console.log('Signal received: '+error.signal);
  }
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
});
workerProcess.on('exit', function (code) {
  console.log('monitor.js已退出，退出码 '+code);
});

app.listen(3000);
