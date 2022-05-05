const discord = require("discord.js")
const moment = require("moment");
const config = require("../../utils/config");
const logger = require("../../utils/logger");
const ctftime = require("../../utils/ctftime_api")

const updateEmbed = async(msg, teamId) => {
    const teamData = await ctftime.getTeamData(teamId);

    // Create embed 
    const teamEmbed = new discord.MessageEmbed()
        .setColor('#ff0000')
        .setURL(`https://ctftime.org/team/${teamId}`)
        .setTitle(teamData.primary_alias || "N/A")
        .setThumbnail(teamData.logo || "N/A")
        .addFields({ name: 'Country', value: teamData.country || "N/A" }, { name: 'Worldwide Place', value: teamData.rating["2022"].rating_place.toString() || "N/A" }, { name: 'Country Place', value: teamData.rating["2022"].country_place.toString() || "N/A" }, { name: 'Last updated', value: moment().format("MMM Do YY hh:mm A Z") || "N/A" })

    // Grab the message with the stored id
    try {
        let message = await msg.channel.messages.fetch(config.RUNTIME_CONFIG["TEAM_PROFILE_INTERVAL"]);
        await message.edit({ embeds: [teamEmbed] });
    } catch (e) {
        let tempMsg = await msg.channel.send({ embeds: [teamEmbed] });
        config.RUNTIME_CONFIG["TEAM_PROFILE_INTERVAL"] = tempMsg.id;
    }

    logger.info("COMMAND", "Team Embed has been updated");
}

module.exports = {
    name: "setupTeamEmbed",
    description: "Start the interval to continually update the ctftime rank embed in the current text channel",
    admin: true,
    usage: `${config.PREFIX}setupTeamEmbed <team_id>`,
    async execute(msg, args) {
        if (config.RUNTIME_CONFIG["TEAM_PROFILE_INTERVAL"]) {
            msg.reply({ content: "Interval is already running" })
            return
        }

        if (args.length != 1) {
            msg.reply({ content: "A team id is required as an argument" })
            return
        }


        // Ensure team id exists
        let initialTeamData = await ctftime.getTeamData(args[0]);

        if (!initialTeamData) {
            msg.reply({ content: "Team id doesn't exist" })
            return
        }

        await updateEmbed(msg, args[0])
        logger.info("COMMAND", "Starting the interval for team rating message");

        // Setup CTF team rank interval
        setInterval(async() => {
                await updateEmbed(msg, args[0])

            }, 24 * 60 * 60 * 1000) // Update every day

        msg.delete()
    },
};