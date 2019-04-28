var express = require('express');
var router = express.Router();
var URL = require('url');
var User = require('./user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/getUserInfo', function(req,res,next){
    var user = new User();
    var params = URL.parse(req.url,true).query;//获取URL参数，使用需要引入require('url');
    if(params.id == '1'){
        user.name = "ligh";
        user.age = "1";
        user.city = "北京市";
    }else{
        user.name = "SPTING";
        user.age = "1";
        user.city = "杭州市";
    }

    var response = {status:1,data:user};
    res.send(JSON.stringify(response));
})
router.get("/data",function (request,response) {
    var data = require('../file/jiadian.json');//要获取的json文件
    response.send(data);
})

function readJSONFromFile(successCb, errorCb) {
    const dir = 'files';
    const filename = path.join(__dirname, dir, 'jiadian.json');
    if (!fs.existsSync(path.join(__dirname, dir))){
        fs.mkdirSync(path.join(__dirname, dir));
    }
    fs.open(filename, 'r', function (err, fd) {
        if (err) {
            fs.writeFile(filename, '{}', function (err) {
                if (err) {
                    console.log(err);
                    errorCb(err);
                } else {
                    successCb({});  // return an empty json
                }
            });
        } else {
            // file exists, read JSON from this file
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                    errorCb(err);
                } else {
                    console.log(data);
            successCb(JSON.parse(data));
        }
        });
        }
    });
}
module.exports = router;
