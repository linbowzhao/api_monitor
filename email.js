const nodemailer = require('nodemailer');
const conf = require('./conf/conf');

const params = {
  host: conf.emailHost,
  port: conf.emailPort,
  sercure: true,
  auth: {
    user: conf.emailUser,
    pass: conf.emailPassword
  }
}


// 发送邮件
const transporter = nodemailer.createTransport(params)

module.exports = {
  sendEmail: function (email, title, content, callback) {
    // 邮件信息
    const mailOptions = {
      from: 'api_monitor@aliyun.com', // 发送邮箱
      to: email, // 接受邮箱
      subject: title,
      html: content
    };
    transporter.sendMail(mailOptions, callback)
  }
}
