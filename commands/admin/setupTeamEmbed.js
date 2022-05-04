const config = require("../../utils/config");
const logger = require("../../utils/logger");
const moment = require("moment");

module.exports = {
    name: "setupTeamEmbed",
    description: "Start the interval to continually update the ctftime rank embed in the current text channel",
    admin: true,
    usage: `${config.PREFIX}setupTeamEmbed <team_id>`,
    async execute(msg, args) {
        console.log("Hello?")
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

        logger.info("COMMAND", "Starting the interval for team rating message");

        // Setup CTF team rank interval
        setInterval(async () => {
            const teamData = await ctftime.getTeamData(args[0]);

            // I'm going to do this the lazy way

            // If there is already a message in the channel delete all the messages
            let messages = await msg.channel.messages.fetch();
            if (messages.length > 0) {
                for (let i = 0; i < messages.length; i++) {
                    // No need to await I don't care
                    messages.get(i).delete()
                }
            }

            // Create embed 
            const teamEmbed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(teamData.primary_alias)
                .setThumbnail(teamData.logo)
                .addFields(
                    { name: 'Country', value: teamData.country },
                    { name: 'Worldwide Place', value: teamData.rating["2022"].rating_place },
                    { name: 'Country Place', value: teamData.rating["2022"].country_place },
                    { name: 'Last updated', value: moment().format("MMM Do YY hh:mm A Z") }
                )

            msg.channel.send({ embeds: [teamEmbed] });

            logger.info("COMMAND", "Team Embed has been updated");


        }, 1 * 60 * 1000) // Update every 1 minute

        config.RUNTIME_CONFIG["TEAM_PROFILE_INTERVAL"] = true

        msg.delete()
    },
};

