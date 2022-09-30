const urlModel = require("../models/urlModel")
const shortId = require("shortid")
const validUrl = require("valid-url")
//const validation = require("validator")

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
        res.status(201).send({ status: true, message: "url successful created", data: obj })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "server issue" })
    }
}


const getUrl = async function (req, res) {
    try {
        let data = req.params.urlCode
        if (!data) {
            return res.status(400).send({ message: "urlCode must present" })
        }

        let redirect = await urlModel.findOne({ urlCode: data }).select({ longUrl: 1, _id: 0 })
        if (!redirect) {
            return res.status(404).send({ message: "longUrl not found" })
        }
        return res.status(302).redirect(redirect.longUrl)
    }
    catch (err) {
        return res.status(500).send({ status: false, message: "server issue" })
    }
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl