const { Client, Collection, Intents } = require("discord.js")
const logger = require("./utils/logger");
const config = require("./utils/config");
const roles = require("./utils/roles");
const statsChannels = require("./utils/stats_channels")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
const commands = require("./commands");

// Import utility/general/admin commands

for (const [folderName, folderCommands] of Object.entries(commands)) {
    for (const [name, command] of Object.entries(folderCommands)) {
        client.commands.set(name, command);
    }
}

client.on("ready", async () => {
    logger.info("STARTUP", `Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        activities: [{ name: `"${config.PREFIX}help" to get started!` }],
        status: "online",
    });

    let guilds = await client.guilds.fetch();

    for (let i = 0; i < guilds.size; i++) {
        let partialGuild = guilds.at(i);
        let guild = client.guilds.resolve(partialGuild.id)
        // Find existing admin role for each guild
        await roles.setExistingAdminRoleId(guild);
        // Find existing stat channels
        // Iterate through channels and see if it contains channel name (very hacky I know I will implement db later)
        let channels = await guild.channels.fetch();
        let channelNames = ["*** CTFTIME STATS ***", "GLOBAL", "AU", "RATING", "TARGET"];
        let statsChannels = [];
        let hasStatsChannels = true;
        for (let i = 0; i < channelNames.length; i++) {
            if (!channels.some(
                (channel) =>
                    channel.name.includes(channelNames[i])
            )) {
                hasStatsChannels = false;
                break;
            } else {
                statsChannels.push(channels.find(c => c.name.includes(channelNames[i])));
            }
        }

        if (hasStatsChannels) {
            config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][guild.id] = [];
            for (let i = 0; i < statsChannels.length; i++) {
                config.RUNTIME_CONFIG["STATS_CHANNELS_IDS"][guild.id].push(statsChannels[i].id);
            }
        }
    }

});

client.on("guildCreate", async (guild) => {
    logger.info("EVENT", `Joined a guild: "${guild.name}-${guild.id}"`);
    await roles.setExistingAdminRoleId(guild);
});

client.on("guildDelete", (guild) => {
    logger.info("EVENT", `Left a guild: "${guild.name}-${guild.id}"`);
    roles.deleteExistingAdminRoleId(guild);
});

client.on("messageCreate", async (msg) => {
    // Update stats channels when webhook has been hit
    if (msg.webhookId && msg.content.includes("Database updated") && statsChannels.channelsExist(msg.guild)) {
        statsChannels.updateChannels(msg.guild);
    }

    if (!msg.content.startsWith(config.PREFIX) || msg.author.bot) return;

    // Regex to split arguments with quotation marks and spaces - https://stackoverflow.com/a/18647776
    let myRegexp = /[^\s"]+|"([^"]*)"/gi;
    let args = [];

    do {
        //Each call to exec returns the next regex match as an array
        var match = myRegexp.exec(
            msg.content.slice(config.PREFIX.length).trim()
        );
        if (match != null) {
            //Index 1 in the array is the captured group if it exists
            //Index 0 is the matched text, which we use if no captured group exists
            args.push(match[1] ? match[1] : match[0]);
        }
    } while (match != null);

    // const args = msg.content.slice(config.PREFIX.length).trim().split(/ +/);
    const command = args.shift();

    if (!client.commands.has(command)) return;

    const commandObject = client.commands.get(command);

    // Admin command permission checks
    if (!roles.checkMemberIsAdmin(msg.guild, msg.member)) {
        if (config.RUNTIME_CONFIG["MAINTENANCE_STATUS"]) {
            // People who aren't admins can't run commands during maintenance
            msg.reply({ content: "Only admins can run commands during maintenance.", allowedMentions: { repliedUser: true } });
        } else if (commandObject.admin) {
            msg.reply({ content: `You must have the "${config.ADMIN_ROLE_NAME}" role to execute admin commands.`, allowedMentions: { repliedUser: true } });
            return;
        }
    }

    logger.info(
        "COMMAND",
        `"${command}" - executed by ${msg.author.username}#${msg.author.discriminator}`
    );

    try {
        commandObject.execute(msg, args, client);
    } catch (error) {
        logger.error("COMMAND", error.message, error);
        msg.reply({ content: "There was an error trying to execute that command! Please contact an admin", allowedMentions: { repliedUser: true } });
    }
});

client.login(config.BOT_TOKEN);