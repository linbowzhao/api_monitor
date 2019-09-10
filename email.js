const nodemailer = require('nodemailer');

const params = {
  host: 'smtp.aliyun.com',
  port: 465,
  sercure: true,
  auth: {
    user: 'api_monitor@aliyun.com',
    pass: 'Aliyun376288'
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
