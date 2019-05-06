var express = require('express');
var router = express.Router();
var URL = require('url');
var User = require('./user')
var fs = require('fs');
const path = require('path')
const kmeans = require('node-kmeans');
var db=require('../public/connect.js');
var accounts = []
var a_weight = []
// var web3 = require( '../../my-project/src/config')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/data",function (req,res) {
    var tagList = []
    tagList = req.param('tagList');
    var d_account = req.param('account')
    console.log("d_account:"+d_account)
    accounts.push(d_account)

    var UserPoint = computeUserPoint(tagList);
    var distance = computeDistance(UserPoint)
    console.log("UserPoint"+UserPoint)
    var weight = []
    var weightAll = 0
    for(var i=0;i<distance.length;i++){
        distance[i] = parseFloat(distance[i])
        var weightAll = distance[i] + weightAll
    }
    console.log("weightAll"+weightAll)
    // var flag
    // flag = distance.includes(0.70)
    // console.log("flag"+flag)
    if(distance.includes(0.000)===false){
        for(var i=0;i<distance.length;i++){
            var wei = 1/(distance[i]/weightAll)
            console.log("wei"+wei)
            weight.push((1/(distance[i]/weightAll)).toFixed(3))
        }
    } else {
        var weightAll =  weightAll + weightAll/5
        for(var i=0;i<distance.length;i++){
            distance[i] = distance[i] + weightAll/10
            weight.push((1/(distance[i]/weightAll)).toFixed(3))
        }
    }
    console.log("weight:"+weight)
    a_weight.push(weight)//五个权值作为一个数组打包进去
    console.log("a_weight"+a_weight)
    // KmeansCompute(accounts,a_weight)

    const filePath = path.resolve(__dirname,'../file/final.json')
    const data = JSON.parse(fs.readFileSync(filePath));//要获取的json文件
    for(var item in data){//用序号是不行的 真的是个大坑
        // console.log("score_pre:"+data[item].score);
        var randomNum = Math.random();
        randomNum  = randomNum*2
        data[item].score = parseFloat(data[item].score)*2 + parseFloat(0.8*weight[parseInt(data [item].tag)-1]) + randomNum
        // console.log("score:"+data[item].score);
    }
    data.sort(sortScore)
    console.log("data:"+typeof ( data))
    res.send({
        data:data,
        weight:weight
    })
})

router.post("/data2",async function (req,res){
    var tagList = []
    var id = []
    tagList = req.param('tagList');
    var d_account = req.param('account')
    console.log("d_account2:"+d_account)
    accounts.push(d_account)
    var UserPoint = computeUserPoint(tagList);
    var distance = computeDistance(UserPoint)
    console.log("UserPoint"+UserPoint)
    var weight = []
    var weightAll = 0
    for(var i=0;i<distance.length;i++){
        distance[i] = parseFloat(distance[i])
        var weightAll = distance[i] + weightAll
    }
    if(distance.includes(0.000)===false){
        for(var i=0;i<distance.length;i++){
            var wei = 1/(distance[i]/weightAll)
            // console.log("wei"+wei)
            weight.push((1/(distance[i]/weightAll)).toFixed(3))
        }
    } else {
        var weightAll =  weightAll + weightAll/5
        for(var i=0;i<distance.length;i++){
            distance[i] = distance[i] + weightAll/10
            weight.push((1/(distance[i]/weightAll)).toFixed(3))
        }
    }
    // console.log("weight:"+weight)
    a_weight.push(weight)//五个权值作为一个数组打包进去
    // console.log("a_weight"+a_weight)

    let accountClass = await KmeansCompute(accounts,a_weight)
    console.log("accountClass:"+accountClass)

    for(let i in accountClass){
        var account = ''
        account = account+'"'+accountClass[i]+'",';
        console.log("account"+i+": "+account)
    }
    // console.log("account"+account)
    db.query('select * from account where account in (account)', [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        for(let item in result){
            console.log("item:"+result[item].product_id)
            id.push(result[item].product_id)

        }
        var count = id.reduce(function(allElements, ele){
            if (ele in allElements) {
                allElements[ele]++;
            } else {
                allElements[ele] = 1;
            }
            return allElements;
        }, {});
        for(let item in count){
            console.log(item)
            console.log(count[item])
        }
        console.log("count:"+count)
        console.log(typeof ( count))
        //count.sort(sortNum)
        // console.log("count"+count)
        res.send({
            count:count
        })
        //console.log(result.RowDataPacket.product_id)
    });

})

router.post("/user_data",function (req,res) {
    var account = req.param('account');
    var id = parseInt(req.param('id'))
    var  addSql = 'INSERT INTO account(account,product_id) VALUES(?,?)';
    var  addSqlParams =[account, id];
    db.query(addSql,addSqlParams,function(result,fields){
        console.log('添加成功')
    })
})

function computeUserPoint(tagList){
    var UserPoint=[]
    var tagArray = []; //先声明一维
    var dimCount = [0,0,0,0,0]
    // for(var k=0;k<tagList.length;k++) { //一维长度为i,i为变量，可以根据实际情况改变
    //     tagArray[k] = [];
    console.log("tagList"+tagList);
    // }
    for(var i =0 ;i< tagList.length;i++){
        if(tagList[i] === "1"){
            tagArray.push([1,0,0,0,0])
            dimCount[0]++
        } else if(tagList[i] === "2"){
            tagArray.push([0,1,0,0,0])
            dimCount[1]++
        } else if(tagList[i] === "3"){
            tagArray.push([0,0,1,0,0])
            dimCount[2]++
        }  else if(tagList[i] === "4"){
            tagArray.push([0,0,0,1,0])
            dimCount[3]++
        } else if(tagList[i] === "5"){
            tagArray.push([0,0,0,0,1])
            dimCount[4]++
        }
        // console.log(tagArray)
    }
    var dataCount = tagArray.length;
    for(var j=0;j<5;j++){
        UserPoint[j] = parseFloat(dimCount[j])/parseFloat(dataCount)
        UserPoint[j] = UserPoint[j].toFixed(3)
    }
    return UserPoint
}
function computeDistance(UserPoint){
    var distance = []//此处计算欧式距离的平方，对推荐结果没有影响
    for(var i =0;i<5;i++){
        var dis = 0
        for(var j=0;j<5;j++){
            if(j===i){
                dis = dis + (UserPoint[j]- 1)*(UserPoint[j]- 1)
            } else {
                dis = dis + UserPoint[j]*UserPoint[j]
            }
        }
        dis = dis.toFixed(3)
        distance.push(dis)
        // console.log("dis:"+dis)
    }
    console.log("distance"+distance)
    // distance.sort()
    // console.log("distance"+distance)
    return distance
}
function sortScore(a,b){
    return b.score-a.score
}
function sortNum(a,b){
    return b-a
}
async function KmeansCompute(accounts,a_weight){//返回聚类为同一组的用户地址列表
    let vectors = []
    var account_add = []
    for(let item in a_weight){
        // console.log(a_weight[item]);
        vectors.push(a_weight[item])
    }
    // console.log("account:"+account);
    await kmeans.clusterize(vectors, {k: 2},(err,res)=>{
        if (err) {
            console.error(err);
        }
        else {
            console.log('%o',res);
            let final_accid = parseInt(accounts.length - 1)
            console.log("final_accid: "+final_accid)
            for(item in res){
                // console.log("item"+item)
                // console.log("res[item].clusterInd: "+res[item].clusterInd)
                if((res[item].clusterInd.indexOf(final_accid))> -1){
                    for(let i =0;i<res[item].clusterInd.length;i++){
                        // console.log("res[item].clusterInd.length："+res[item].clusterInd.length)
                        account_add.push(accounts[i])
                    }
                    // console.log("account_add :"+account_add)//得到的是很可能有重复账户的
                    break
                }
            }
            //console.log("account_add :"+account_add)//得到的是很可能有重复账户的
        }
    })
    return account_add
}
module.exports = router;
