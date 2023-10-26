const config = require("./Settings/config");
const fs = require("node:fs");
const { Client, Collection, Partials } = require("discord.js");
const client = new Client({
    intents: [3276799],
    partials: [Partials.User, Partials.Channel, Partials.GuildMember]
})
client.login(config.token);

client.commands = new Collection();
client.globalCommands = [];

const eventFiles = fs.readdirSync("./Events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./Events/${file}`);
    client.on(event.name, event.executor)
}

const commandFolders = fs.readdirSync('./Commands');
for (const folder of commandFolders) {
    const files = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const command = require(`./Commands/${folder}/${file}`);
        client.commands.set(command.name, command);
        client.globalCommands.push(command.command);
    }
}