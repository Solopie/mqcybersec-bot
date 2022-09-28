const Discord = require("discord.js");
const moment = require("moment")
const config = require("../../utils/config")
const logger = require("../../utils/logger")
const ctftimeApi = require("../../utils/ctftime_api")

module.exports = {
    name: "embed",
    description: "Create embed with CTFTime info of event",
    admin: true,
    usage: `${config.PREFIX}embed <id>`,
    async execute(message, args) {
        if (args.length != 1) {
            message.reply({ content: "You must provide an id for this command" })
            return
        }

        const curEvent = await ctftimeApi.getEvent(args[0])

        if (!curEvent) {
            message.reply({ content: "The event id provided was not found" })
            return
        }

        const eventEmbed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setTitle(curEvent.title)
            .setURL(curEvent.ctftime_url)
            .setDescription(curEvent.description)
            .setThumbnail(curEvent.logo)
            .addFields(
                { name: 'Format', value: curEvent.format },
                { name: 'Link', value: curEvent.url },
                { name: 'CTFTime URL', value: curEvent.ctftime_url },
                { name: 'Start', value: `<t:${moment(curEvent.start).unix()}>` },
                { name: 'Finish', value: `<t:${moment(curEvent.finish).unix()}>` },
            )

        logger.info("COMMAND", "Event embed sent")
        message.channel.send({ embeds: [eventEmbed] });
        message.delete()
    },
};