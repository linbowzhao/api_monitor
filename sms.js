const Core = require('@alicloud/pop-core');

var client = new Core({
  accessKeyId: 'LTAI4Fu9NSpk48MVPPMxzb4y',
  accessKeySecret: 'hi8mWhtyr03MOV1L1SKsqxIp40JxOJ ',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

var params = {
  "RegionId": "default"
}

var requestOption = {
  method: 'POST'
};

client.request('SendSms', params, requestOption).then((result) => {
  console.log(JSON.stringify(result));
}, (ex) => {
  console.log(ex);
})

module.exports = {
  sendSms: function (phoneNumber, content, callback) {
    var smsType = 0; // Enum{0: 普通短信, 1: 营销短信}
    var ssender = qcloudsms.SmsSingleSender();
    ssender.send(smsType, 86, phoneNumber,
        content, '', '', callback);
  }
}
