const axios = require("axios")
const logger = require("./logger")


const get = async (url, params = {}) => {
    logger.info("REQUESTS", `Request to: ${url}`)

    try {
        // User-agent required to not look like a bot
        const response = await axios.get(url, {
            params: params,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0" }
        })

        return response.data
    } catch (err) {
        logger.error("API", "404 Found or the request failed", err)
        // console.error(err)
    }
}

module.exports = {
    get
}
