const config = require("../../utils/config")
const logger = require("../../utils/logger")
const ctftimeApi = require("../../utils/ctftime_api")

module.exports = {
    name: "event",
    description: "Create event with CTFTime info of event",
    admin: true,
    usage: `${config.PREFIX}event <id>`,
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

        // Get voice channel
        let channels = await message.guild.channels.fetch()
        let voiceChannel = channels.find(channel => channel.name === "Main CTF Room")

        if(!voiceChannel) {
            message.reply({ content: "'Main CTF Room' voice channel doesn't exist"})
            return
        }

        try {
            message.guild.scheduledEvents.create({
                name: curEvent.title,
                scheduledStartTime: curEvent.start,
                scheduledEndTime: curEvent.finish,
                privacyLevel: "GUILD_ONLY",
                entityType: "VOICE",
                description: curEvent.description + "\n\nCheck out the #ctf-schedule embed for more information!",
                channel: voiceChannel
            })
        } catch (e) {
            message.reply({ content: "Something went with creating the scheduled event"})
            logger.error("COMMAND", "Failed to create scheduled event", e)
        }

        // Create channel in active CTFs
        let parentCategory = channels.find(channel => channel.name === "Active CTFs")
        if(!parentCategory) {
            message.reply({content: "Active CTFs category doesn't exist"})
            return
        }

        message.guild.channels.create(curEvent.title, {parent: parentCategory})

        logger.info("COMMAND", "Scheduled event created")
        message.delete()
    },
};