const urlModel = require("../models/urlModel")
const shortId = require("shortid")
const validUrl = require("valid-url")
const redis = require('redis')
const { promisify } = require('util')
const axios= require('axios')

//=======================😎😎😎😎😎😎=========================================================================================================================
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


const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}
//====================== 😮😮😮😮😮😮😮😮😮==============================================================================================================

const createUrl = async function (req, res) {
    try {
        let data = req.body
        let longUrl = req.body.longUrl

        if (!Object.keys(data).length > 0) {
            return res.status(400).send({ status: false, message: "Please enter data" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Please enter URL this is mandatory" })
        }

        if (!validUrl.isWebUri(longUrl)) {
            return res.status(400).send({ status: false, message: "please enter valid url" })
        }

        let cachedData = await GET_ASYNC(`${longUrl}`)
        let strconvert = JSON.parse(cachedData)

        if (strconvert) {
            return res.status(200).send({ status: true, message: "url data from cache", data: strconvert })
        }
// ============================== 🙂🙂🙂🙂🙂🙂 ==========================================================================================================

        let objcts = {
            method: "get",
            url: longUrl
        }
      
        let urlFound = false;
        await axios(objcts)
            .then((res) => {
                if (res.status == 201 || res.status == 200) urlFound = true;
            })
            .catch((err) => { });
        if (!urlFound) {
            return res.status(400).send({ status: false, message: "Please provide valid LongUrl" })
        }
        
            let uniqueUrl = await urlModel.findOne({ longUrl: longUrl })
            if (uniqueUrl) {
                return res.status(400).send({ status: false, message: "Url already exists" })
            }
        
        let urlCode = shortId.generate().toLowerCase()
        let shortUrl = `https://localhost:3000/${urlCode}`
        data.urlCode = urlCode
        data.shortUrl = shortUrl

        savedData = await urlModel.create(data)
        
        let obj = { urlCode: savedData.urlCode, shortUrl: savedData.shortUrl, longUrl: savedData.longUrl }
        await SET_ASYNC(`${longUrl}`, JSON.stringify(obj))
        res.status(201).send({ status: true, message: "url successful created", data: obj })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//========================= 😯😯😯😯😯😯😯========================================================================================================================

const getUrl = async (req, res) => {
    try {
        let data = req.params.urlCode
        let cachedData = await GET_ASYNC(`${data}`)
        let convertedData = JSON.parse(cachedData)

        if (convertedData) {
            return res.status(302).redirect(convertedData.longUrl)
        }

        let checkUrlCode = await urlModel.findOne({ urlCode: data })
        if (!checkUrlCode) {
            return res.status(404).send({ status: false, message: "url not present" })
        }

        await SET_ASYNC(`${data}`, JSON.stringify(checkUrlCode))
        return res.status(302).redirect(checkUrlCode.longUrl)
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createUrl, getUrl }
