const config = require("../../Settings/config");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType } = require("discord.js");
const { getData } = require("../../Settings/functions");
const moment = require("moment");
moment.locale("tr");

module.exports = {
    name: "eokul",
    command: new SlashCommandBuilder().setName("eokul").setDescription("E-Okul oyunu.")
    .addNumberOption(option => option.setName("tckn").setDescription("Sorgunalacak TCKN.").setRequired(true)),
    ownerOnly: false,
    async execute(client, int, embed) {

        let TCKN = int.options.getNumber("tckn");

        let veri = await getData(`${config.api.EOKUL}${TCKN}`);

        if (veri.success === false) return await int.followUp({ embeds: [embed.setDescription("Böyle bir TCKN bulunamadı.")], ephemeral: true });

        veri = veri.data;

        let row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('previous')
            .setLabel("◀")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('next')
            .setLabel("▶")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
            new ButtonBuilder()
            .setCustomId("sayfa")
            .setLabel("Sayfa")
            .setEmoji(config.emojiler.UPLOAD)
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId("hepsi")
            .setLabel("Hepsi")
            .setEmoji(config.emojiler.UPLOAD)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        )

        let vesika = new AttachmentBuilder(Buffer.from(veri.VESIKA, "base64"), { name: "vesika.png" })

        embed = embed
        .setTitle(`**${veri.ADI}** - **${veri.SOYADI}** Adlı kişinin E-Okul sonuçları.`)
        .setDescription(`TC: \`${veri.TC}\`\nADI & SOYADI: \`${veri.ADI} - ${veri.SOYADI}\`\nOKUL NO: \`${veri.OKULNO}\`\nDURUMU: \`${veri.DURUM}\`\nNÜFUS İL: \`${veri.NUFUSIL}\`\nNÜFUS İLCE: \`${veri.NUFUSILCE}\``)
        .setImage("attachment://vesika.png")
        await int.followUp({ embeds: [embed], components: [row], files:[vesika] }).then(async (msg) => {

            const collector = await msg.createMessageComponentCollector({ componentType: ComponentType.Button });

            collector.on("collect", async(i) => {

                if(i.user.id !== int.user.id) return await i.reply({ content: `Bu komutu sadece ${int.user} kullanabilir!`, ephemeral: true });

                if(i.customId === "sayfa") {

                    let content = `Sorgulanan TCKN: ${TCKN} - Toplam Kayıt: 1\nTarih: ${moment(Date.now()).format("LLLL")}\n\nTC: ${veri.TC}\nADI & SOYADI: ${veri.ADI} ${veri.SOYADI}\nOKUL NO: ${veri.OKULNO}\nDURUMU: ${veri.DURUM}\nNÜFUS İL: ${veri.NUFUSIL}\nNÜFUS İLCE: ${veri.NUFUSILCE}`
            
                    let atc = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: 'atahan.txt'});
                    await i.deferReply({ ephemeral:true })
                    await i.followUp({ files: [atc, vesika], ephemeral:true });

                }

            })

        })


    }
}