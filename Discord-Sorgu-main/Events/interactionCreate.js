const config = require("../Settings/config");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    async executor(int) {

        let client = int.client;
        let embed = new EmbedBuilder()
        .setAuthor({ name: int.user.username, iconURL: int.user.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: "© Atahan#8888" })

        if (int.isChatInputCommand()) {

            await int.deferReply({ ephemeral: true });

            let member
            try { member = await client.guilds.fetch(config.guildID).then(async x => await x.members.fetch(int.user.id)) } catch { member = null }

            if(!member) return await int.followUp({ embeds: [embed.setDescription("Bu komutu sadece sunucuda bulunanlar kullanabilir!")] });
            if(!member.roles.cache.has(config.roller.SORGUCU)) return await int.followUp({ embeds: [embed.setDescription("Bu komutu sadece yetkililer kullanabilir!")] });

            let cmd = client.commands.get(int.commandName);
            if (!cmd) return await int.followUp({ embeds: [embed.setDescription("Bu komut bulunamadı!")] });

            if (cmd.ownerOnly && !config.owners.includes(int.user.id)) return await int.followUp({ embeds: [embed.setDescription("Bu komutu sadece bot sahipleri kullanabilir!")] });

            if(cmd) {
                cmd.execute(client, int, embed)
            }

        }

    }
}