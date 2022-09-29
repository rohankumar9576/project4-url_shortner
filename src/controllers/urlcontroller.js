const urlModel = require("../models/urlModel")
const shortId = require("shortid")
//const validUrl=require("valid-url")
const validation = require("validator")

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
    let data = req.body
    let longUrl = req.body.longUrl

    if (!isValid(data)) {
        return res.status(400).send({ status: false, message: "please enter data" })
    }

    if (!isValid(longUrl)) {
        return res.status(400).send({ status: false, message: "please enter url" })
    }
    let uniqueUrl = await urlModel.findOne({ longUrl: longUrl })
    if (uniqueUrl) {
        return res.status(400).send({ status: false, message: "Url already exists" })
    }
    if (!(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})?$/).test(longUrl)) {
        return res.status(400).send({ status: false, message: "invalid base url" })
    }

    let urlCode = shortId.generate().toLowerCase()
    let shortUrl = `https://localhost:3000/${urlCode}`

    data.urlCode = urlCode
    data.shortUrl = shortUrl

    savedData = await urlModel.create(data)
    res.status(201).send({ status: false, message: "url successful created", data: savedData })
}



//get url

const getUrl = async function (req, res) {
  try {
    const urlCode = req.params.urlCode
    if (!urlCode) return res.status(400).send({ status: false, message: 'Please provide UrlCode' })

    if (!shortid.isValid(urlCode)) return res.status(400).send({ status: false, message: 'Please provide valid UrlCode' })

    const checkUrlCode = await urlModel.findOne({ urlCode: urlCode })

    if (!checkUrlCode) return res.status(404).send({ status: false, message: 'UrlCode not found' })

    return res.status(302).redirect(checkUrlCode.longUrl)
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }

}



module.exports ={ createUrl,getUrl}