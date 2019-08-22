const request = require('request');
const nodemailer  = require('nodemailer');

var data = {
    url: 'http://www.114yygh.com/dpt/week/calendar.htm',
    method: 'post',
    json: true,
    headers: {
        'content-type': 'application/json'
    },
    cookie: 'JSESSIONID=112FC534070861A5CC5C04A3085C78A4;SESSION_COOKIE=4cab1829cea36edbcez07f7e',
    query: {
        hospitalId: 129,
        departmentId: 200001196,
        departmentName: '',
        week: 1,
        isAjax: true,
        relType: 0,
        sdFirstId: 0,
        sdSecondId: 0,
    },
    condition: '(function () { for (let i in body.dutyCalendars){ if (body.dutyCalendars[i].dutyWeek === "六" && body.dutyCalendars[i].remainAvailableNumber > 0){return true} } })()',
    mailTitle: '114预约有票',
    mailContent: '114预约有票,快去抢',
    time: 3
}

const params = {
    host: 'smtp.aliyun.com',
    port: 465,
    sercure: true,
    auth: {
        user: 'api_monitor@aliyun.com',
        pass: 'Aliyun376288'
    }
}

// 邮件信息
const mailOptions = {
    from: 'api_monitor@aliyun.com', // 发送邮箱
    to: 'linbo.zhao@gaea.com', // 接受邮箱
    subject: data.mailTitle,
    html: data.mailContent
}

// 发送邮件
const transporter = nodemailer.createTransport(params)

var j = request.jar();
var cookie = request.cookie(data.cookie)
j.setCookie(cookie, 'http://www.114yygh.com');

setInterval(function (){
    request({
        url: data.url,
        jar: j,
        method: data.method,
        json: data.json,
        headers: data.headers,
        form: data.query
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            if (eval(data.condition)) {
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
            }
        }
    });
}, data.time*1000)
