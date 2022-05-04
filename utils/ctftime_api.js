const logger = require("./logger")
const requests = require("./requests")

const getEvent = async (id) => {
    if (!id) {
        throw new Error("id argument is required")
    }

    logger.info("API", `Retrieving event id: ${id}`)

    const responseData = await requests.get(`https://ctftime.org/api/v1/events/${id}/`)

    if (!responseData) {
        logger.error("API", `Failed to retrieve event id: ${id}`)
        return
    }
    return responseData
}

const getTeamData = async (id) => {
    if (!id) {
        throw new Error("id argument is required")
    }

    logger.info("API", `Retrieving team id: ${id}`)

    const responseData = await requests.get(`https://ctftime.org/api/v1/teams/${id}/`)

    if (!responseData) {
        logger.error("API", `Failed to retrieve team id: ${id}`)
        return
    }

    return responseData;
}

module.exports = {
    getEvent,
    getTeamData
}