const config = require("../../utils/config");
const logger = require("../../utils/logger");
const db = require("../../utils/db");
const { Permissions } = require("discord.js");

module.exports = {
    name: "create-stats-channels",
    description: "Create stats channels",
    admin: true,
    usage: `${config.PREFIX}create-stats-channels`,
    async execute(msg, args, client) {
        let channelNames = ["*** CTFTIME STATS ***", "GLOBAL", "AU", "RATING", "TARGET"];
        // Check if STATS_CHANNEL_IDS has been initialised
        if (
            msg.guild.id in config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"] && config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][msg.guild.id].length === channelNames.length
        ) {
            msg.reply({ content: `Stats channels has already been created`, allowedMentions: { repliedUser: false } });
            return;
        } else {
            config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][msg.guild.id] = []
        }

        // Create channels and add them to runtime config
        try {
            logger.info("COMMAND", "Creating stats channels");
            const team = await db.getTeam();
            const aim = await db.getAim();
            let data = ["", team["worldwide_place"], team["country_place"], parseFloat(team["rating_points"]).toFixed(2), parseFloat(aim["rating_points"]).toFixed(2)];
            for (let i = 0; i < channelNames.length; i++) {
                let tempChannelName = channelNames[i];
                if (data[i] !== "") {
                    tempChannelName = `${channelNames[i]}: ${data[i]}`
                }

                const tempChannel = await msg.guild.channels.create(tempChannelName, { type: "GUILD_VOICE", permissionOverwrites: [{ id: msg.guild.roles.everyone.id, deny: [Permissions.FLAGS.CONNECT] }] });
                config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][msg.guild.id].push(tempChannel.id);
            }

            logger.info(
                "COMMAND",
                "Stats channels have been created"
            );
            msg.channel.send({ content: "Stats channels have been created" });
        } catch (err) {
            logger.error("COMMAND", "Failed to create stats channels", err);
            msg.channel.send({ content: "Failed to create stats channels. Check logs for more information" });
        }
    },
};
