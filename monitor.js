const request = require('request');
const moment = require('moment');
const sql = require('./mysql');
const email = require('./email');
const tgTimeList = require('./json/tgTime');
const department = require('./json/department')
moment.locale('zh-cn');

let data = {
    url: 'http://www.114yygh.com/web/product/list',
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
    },
    cookie: '',
    query: {
        hospitalId: '129',
        departmentId: '200001196',
        week: 1
    }
}

let j = request.jar();
let cookie = request.cookie(data.cookie)
j.setCookie(cookie, 'http://www.114yygh.com');

setInterval(function (){
    // 查询余票请求
    function ajaxFoo(data){
        return new Promise(function(resolve, reject){
            request({
                url: data.url,
                method: data.method,
                json: true,
                headers: data.headers,
                body: data.query
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
                if (error && response.statusCode == 200) {
                    reject(error)
                }
            });
        })
    }
    // 查询数据库
    sql.getTasks().then(function(res){
        let taskObj = {}
        for (let i in res) {
            // 医院的停止挂号时间
            let tgTime = tgTimeList[res[i].hospitalId]
            let updateTime = new Date(moment().format('YYYY-MM-DD') + ' ' + tgTime) - new Date(moment().format('YYYY-MM-DD') + ' 00:00:00')
            let timeIndex = (new Date(res[i].targetDay) - new Date() + updateTime)/1000/60/60/24 - 1
            res[i].week = Math.ceil(timeIndex/7)
            let key = '' + res[i].hospitalId + res[i].departmentId + res[i].week
            if (res[i].week > 0) {
                if (taskObj[key]) {
                    taskObj[key].push(res[i])
                }else {
                    taskObj[key] = [res[i]]
                }
            }
        }
        for (let i in taskObj) {
            data.query.hospitalId = String(taskObj[i][0].hospitalId);
            data.query.departmentId = String(taskObj[i][0].departmentId);
            data.query.week = taskObj[i][0].week;
            console.log('ajax:' + i)
            let tt = new Date()
            ajaxFoo(data).then(function(res){
                console.log('ajaxSuccess:' + (new Date() - tt) )
                let targetTask = []
                for (let j in taskObj[i]) {
                    for (let k in res.data.calendars) {
                        let dateString = moment(taskObj[i][j].targetDay).format('YYYY-MM-DD')
                        if (dateString === res.data.calendars[k].dutyDate && res.data.calendars[k].remainAvailableNumberWeb > 0) {
                            targetTask.push(taskObj[i][j])
                        }
                    }
                }
                if(targetTask.length > 0) {
                    for (let i in targetTask) {
                        let hname = department[targetTask[i].hospitalId].name
                        let dname = ''
                        let dArr = department[targetTask[i].hospitalId].departments
                        for (let j in dArr) {
                            if(dArr[j].departments[targetTask[i].departmentId]) dname = dArr[j].departments[targetTask[i].departmentId]
                        }
                        email.sendEmail(targetTask[i].email,'114官网余票通知', '您预约的' + moment(targetTask[i].targetDay).format('YYYY-MM-DD') + hname + dname +  '现在有余票，请立即前往官网挂号，以免错失！',
                            function (err, info) {
                            console.log(targetTask)
                            if (err) {
                                console.log('err: ', err);
                            } else {
                                sql.doneTask(targetTask[i]).then(function(res){
                                    // console.log(res)
                                }).catch(function(res){console.log()})
                            }
                            })
                    }
                }
            }).catch(function(res){console.log(res)})
        }
    }).catch(function(res){
        console.log(res)
    })
}, 10*1000)
