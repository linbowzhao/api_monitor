const mysql = require('mysql');
const conf = require('./conf/conf');

var connection = mysql.createConnection({
  host: conf.localhost,
  user: conf.mysqlUser,
  password: conf.mysqlPassword,
  port: conf.mysqlPort,
  database:'api_monitor'
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting:' + err.stack)
    return false
  }
  console.log('connected as id ' + connection.threadId);
})

let query = ( sql, values ) => {
  return new Promise(( resolve, reject ) => {
    connection.query(sql, values, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        let results = JSON.stringify(rows)
        results = JSON.parse(results)
        resolve(results)
      }
    })
  })
}

module.exports = {
  searchUsers: function (data) {
    var obj = {
      openId: data.	openId
    }
    return query(`SELECT * FROM user WHERE openId="${obj.openId}"`, obj)
  },
  addUser: function (data) {
    var obj = {
      nickName: data.nickName,
      openId: data.openId,
      gender: data.gender,
      province: data.	province,
      country: data.country,
      city: data.city,
      avatarUrl: data.avatarUrl
    }
    return query('INSERT INTO user SET ?', obj)
  },
  updateUser: function (data) {
    var obj = {
      nickName: data.nickName,
      openId: data.openId,
      gender: data.gender,
      province: data.	province,
      country: data.country,
      city: data.city,
      avatarUrl: data.avatarUrl,
      loginTime: data.loginTime
    }
    return query(`UPDATE user SET ? WHERE openId="${obj.openId}"`, obj)
  },
  addTask: function (data) {
    var obj = {
      hospitalId: data.hospitalId,
      departmentId: data.departmentId,
      phone: data.phone,
      email: data.email,
      targetDay: data.targetDay,
      openId: data.openId,
      allTimes: 1
    }
    return query('INSERT INTO task SET ?', obj)
  },
  getTasks: function () {
    return query(`SELECT * FROM task WHERE targetDay >= CURRENT_DATE AND targetDay <= DATE_ADD(CURRENT_DATE,INTERVAL 3 MONTH) AND currentTimes < allTimes`)
  },
  doneTask: function (obj) {
    return query(`UPDATE task SET ? WHERE taskId="${obj.taskId}"`, {currentTimes: obj.currentTimes+1})
  }
}
