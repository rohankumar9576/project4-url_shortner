const urlModel = require("../models/urlModel")
const shortId = require("shortid")
const validUrl = require("valid-url")
//const validation = require("validator")
const redis=require('redis')
const {promisify}=require('util')


//Connect to redis
const redisClient = redis.createClient(
    14014,
    "redis-14014.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("0zVxX68pK4FHwC02G5aEorGCwz7P2KFC", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  
  
  //1. connect to the server
  //2. use the commands :
  
  //Connection setup for redis
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
  
  

const isValidRequestBody = (RequestBody) => {
    if (!Object.keys(RequestBody).length > 0) return false;
    return true;
};

const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

const createUrl = async function (req, res) {
    try {
        let data = req.body
        let longUrl = req.body.longUrl


        if (!isValid(data)) {
            return res.status(400).send({ status: false, message: "please enter data" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "please enter valid url" })
        }
    let cahcedUrleData = await GET_ASYNC(`${longUrl}`)
    let roshanBaby = JSON.parse(cahcedUrleData)
    if(roshanBaby)
    return res.status(400).send({msg: "Url already exists"})
    
        // let uniqueUrl = await urlModel.findOne({ longUrl: longUrl })
        // if (uniqueUrl) {
        //     return res.status(400).send({ status: false, message: "Url already exists" })
        // }
         
        let urlCode = shortId.generate().toLowerCase()
        let shortUrl = `https://localhost:3000/${urlCode}`
        data.urlCode = urlCode
        data.shortUrl = shortUrl

        savedData = await urlModel.create(data)
        await SET_ASYNC(`${longUrl}`, JSON.stringify(savedData))
        let obj = { urlCode: savedData.urlCode, shortUrl: savedData.shortUrl, longUrl: savedData.longUrl }
        res.status(201).send({ status: true, message: "url successful created", data: obj })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "server issue" })
    }
}


const getUrl = async (req,res)=>{
    try{
    let data = req.params.urlCode

    let cahcedUrleData = await GET_ASYNC(`${data}`)
    let roshan = JSON.parse(cahcedUrleData)
    // console.log(cahcedUrleData)

     if(roshan)
     return res.status(302).redirect(roshan.longUrl)
    
    if(!data)
    return res.status(400).send({status:false, msg: " please enter valid url"})
    if(!shortId.isValid(data))
    return res.status(400).send({status:false,msg: "urlcode invalid"})

    let checkUrlCode= await urlModel.findOne({urlCode:data})
    await SET_ASYNC(`${data}`, JSON.stringify(checkUrlCode))
    if(!checkUrlCode)
    return res.status(404).send({status:false , msg:"lol"})
    res.status(302).redirect(checkUrlCode.longUrl)

    }
    catch(err){
        res.status(500).send({status:false, msg:err.message})
    }
}





module.exports ={ createUrl,getUrl}
