const request = require('request-promise-native').defaults({jar: true});
const fs = require('fs');

var option = {
    method: 'post',
    json: true,
    headers: {
        'Content-Type': 'application/json',
        'Cookie': 'route=8766db4a97315579b198ac4b1de57d4e; Hm_lvt_be38740eb6ffe9e6e1cb0fc8404ac00f=1567150387,1567150573,1567151335,1567152753; JSESSIONID=99F8B381D7D617DC8106AF6464DE41AB; Hm_lpvt_be38740eb6ffe9e6e1cb0fc8404ac00f=1568098870',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; NX619J Build/PKQ1.180929.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044903 Mobile Safari/537.36 MMWEBID/9254 MicroMessenger/7.0.5.1440(0x27000536) Process/tools NetType/WIFI Language/zh_CN'
    }
}

var json0 = {}
var json1 = []
var json2 = {}
var json3 = {}

async function getPinyin() {
    await request({
        url: 'http://yyghwx.114yygh.com/hp/hospitalList.htm',
        method: option.method,
        json: option.json,
        headers: option.headers,
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var obj = {}
            for (var i = 0; i < body.data.length; i++) {
                obj[body.data[i].id] = {
                    pinyin1: body.data[i].pinyin1,
                    pinyin2: body.data[i].pinyin2
                }
            }
            json0 = obj
        }
    })
}

// 获取医院数据
async function getHospital(index) {
    await request({
        url: 'http://yyghwx.114yygh.com/hp/getHospital.htm',
        method: option.method,
        json: option.json,
        headers: option.headers,
        form: {
            fromIndex: index,
            longitude: 116.487274,
            latitude: 40.000534,
            countyId: 0,
            distanceFlag: 0
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var arr = []
            for (var i = 0; i < body.hospitalList.length; i++) {
                arr.push({
                    id: body.hospitalList[i].id,
                    name: body.hospitalList[i].name,
                    pinyin1: json0[body.hospitalList[i].id].pinyin1,
                    pinyin2: json0[body.hospitalList[i].id].pinyin2,
                    hospitalLevelName: body.hospitalList[i].hospitalLevelName,
                    fhTime: body.hospitalList[i].fhTime
                })
            }
            json1 = json1.concat(arr)
        }
    })
}

// 获取部门数据
async function getDepart(id) {
    await request({
        url: 'http://yyghwx.114yygh.com/hp/hospitalDepartment.htm',
        method: option.method,
        json: option.json,
        headers: option.headers,
        form: {
            hospitalId: id
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            // 处理数据，免得数据过多，生成文件过大
            var obj = {
                id: body.data.hospital.id,
                name: body.data.hospital.name,
                shortName: body.data.hospital.shortName,
                fhTime: body.data.hospital.fhTime,
                homeLink: body.data.hospital.homeLink,
                phone: body.data.hospital.phone,
                hospitalLevelName: body.data.hospital.hospitalLevelName
            }
            json3[body.data.hospital.id] = body.data.hospital.tgTime
            var departments = []
            for (var i = 0; i < body.data.departments.length; i++) {
                var obj2 = {}
                for (var j = 0; j < body.data.departments[i].departments.length; j++) {
                    obj2[body.data.departments[i].departments[j].id] = body.data.departments[i].departments[j].name
                }
                departments.push({
                    mapDepartmentGroupId: body.data.departments[i].mapDepartmentGroupId,
                    mapDepartmentGroupName: body.data.departments[i].mapDepartmentGroupName,
                    departments: obj2
                })
            }
            obj.departments = departments
            json2[id] = obj
        }
    })
}

// 数据异步拼接队列
async function ajaxLine() {
    await getPinyin()
    for (var i = 0; i < 16; i++) {
        await getHospital(i * 10)
    }
    for (var i = 0; i < json1.length; i++) {
        await getDepart(json1[i].id)
    }
}
ajaxLine().then(function () {
    fs.writeFile('json/hospital.js', 'module.exports = ' + JSON.stringify(json1),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log('写入hospital.js成功！')
    });
    fs.writeFile('json/department.js', 'module.exports = ' + JSON.stringify(json2),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log('写入department.js成功！')
    });
    fs.writeFile('json/tgTime.js', 'module.exports = ' + JSON.stringify(json3),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log('写入tgTime.js成功！')
    });
})
