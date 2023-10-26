const config = require("../Settings/config");
const { ActivityType, REST, Routes } = require("discord.js");

module.exports = {
    name: "ready",
    async executor(client) {

        client.user?.setPresence({ activities: [{ name: "Made By Atahan#8888", type: ActivityType.Playing }], status: "dnd" });
        console.log(`${client.user.tag} ismi ile giriş yapıldı!`);

        try {

            const rest = new REST({ version: "10" }).setToken(client.token);

            await rest.put(Routes.applicationCommands(client.user.id), { body: client.globalCommands });
            console.log(`(*) ${client.globalCommands.length} komut yüklendi!`);

        } catch {
            console.log(`(*) Komutlar yüklenemedi!`);
        }

    }
}