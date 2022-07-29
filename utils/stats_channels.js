const config = require("./config");
const db = require("./db");

const channelsExist = (guild) => {
    let channelNames = ["*** CTFTIME STATS ***", "GLOBAL", "AU", "RATING", "TARGET"];
    return guild.id in config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"] && config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][guild.id].length === channelNames.length;
}

const updateChannels = async (guild) => {
    const ids = config["RUNTIME_CONFIG"]["STATS_CHANNELS_IDS"][guild.id];
    const team = await db.getTeam();
    const aim = await db.getAim();

    // Ignore title which is index 0
    let channelNames = ["*** CTFTIME STATS ***", "GLOBAL", "AU", "RATING", "TARGET"];
    let data = ["", team["worldwide_place"], team["country_place"], parseFloat(team["rating_points"]).toFixed(2), parseFloat(aim["rating_points"]).toFixed(2)];
    for (let i = 1; i < ids.length; i++) {
        let tempChannelName = `${channelNames[i]}: ${data[i]}`
        await guild.channels.edit(ids[i], { name: tempChannelName });
    }
}

module.exports = {
    updateChannels,
    channelsExist
}
