const config = require("../../Settings/config");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType } = require("discord.js");
const { getData } = require("../../Settings/functions");
const moment = require("moment");
moment.locale("tr");

module.exports = {
    name: "sulale",
    command: new SlashCommandBuilder().setName("sulale").setDescription("Sülale oyunu")
    .addNumberOption(option => option.setName("tckn").setDescription("Sorgunalacak TCKN.").setRequired(true)),
    ownerOnly: false,
    async execute(client, int, embed) {

        let TCKN = int.options.getNumber("tckn");

        let veri = await getData(`${config.api.SULALE}${TCKN}`);

        if (veri.success === false) return await int.followUp({ embeds: [embed.setDescription("Böyle bir TCKN bulunamadı.")], ephemeral: true });

        veri = veri.data;
        
        let page = 0;
        let index = 10
        let maxPage = Math.ceil(veri.length / index)

        let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('previous')
            .setLabel("◀")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
            new ButtonBuilder()
            .setCustomId('next')
            .setLabel("▶")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(veri.length > index ? page === maxPage - 1 : true),
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
            .setDisabled(veri.length <= index)
        )
        
        let slicedVeri = veri.slice(page * index, (page + 1) * index)

        embed = embed
        .setTitle(`**${veri[0]?.SOYADI}** Sülalesinde **${veri.length}** sonuç bulundu.`)
        .setDescription(`${slicedVeri.map((x, i) => `\`${i+1}.\` YAKINLIK: \`${x.YAKINLIK}\` - TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - GSM: \`${x?.GSM}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`)
        await int.followUp({ embeds: [embed], components: [row] }).then(async (msg) => {

            const collector = await msg.createMessageComponentCollector({ componentType: ComponentType.Button });

            collector.on("collect", async(i) => {

                if(i.user.id !== int.user.id) return await i.reply({ content: `Bu komutu sadece ${int.user} kullanabilir!`, ephemeral: true });

                if(i.customId === "previous") {

                    page--;

                    slicedVeri = veri.slice(page * index, (page + 1) * index)
                    let embeds = msg.embeds[0];
                    embeds.data.description = `${slicedVeri.map((x, i) => `\`${(i+1) + (page * 10)}.\` YAKINLIK: \`${x.YAKINLIK}\` - TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - GSM: \`${x?.GSM}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`
                
                    row.components[0].setDisabled(page === 0);
                    row.components[1].setDisabled(page === maxPage - 1);
                    await i.update({ embeds: [embeds], components: [row]}).catch(async() => {
                    await int.editReply({ embeds: [embeds], components: [row]})
                })

                }

                if(i.customId === "next") {

                    page++;

                    slicedVeri = veri.slice(page * index, (page + 1) * index)
                    let embeds = msg.embeds[0];
                    embeds.data.description = `${slicedVeri.map((x, i) => `\`${(i+1) + (page * 10)}.\` YAKINLIK: \`${x.YAKINLIK}\` - TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - GSM: \`${x?.GSM}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`
                
                    row.components[0].setDisabled(page === 0);
                    row.components[1].setDisabled(page === maxPage - 1);
                    await i.update({ embeds: [embeds], components: [row]}).catch(async() => {
                    await int.editReply({ embeds: [embeds], components: [row]})
                })

                }

                if(i.customId === "sayfa") {

                    let content = `Sorgulanan TCKN: ${TCKN} - Toplam Kayıt: ${slicedVeri.length}\nTarih: ${moment(Date.now()).format("LLLL")}\n\n${slicedVeri.map((x, i) => `YAKINLIK: ${x.YAKINLIK}\nTC: ${x.TC}\nADI & SOYADI: ${x.ADI} ${x.SOYADI}\nDOĞUM TARİHİ: ${x.DOGUMTARIHI}\nGSM: ${x?.GSM}\nANA ADI: ${x.ANNEADI}\nBABA ADI: ${x.BABAADI}\nNÜFUS İL: ${x.NUFUSIL}\nNÜFUS İLÇE: ${x.NUFUSILCE}\nUYRUK: ${x.UYRUK ? x.UYRUK : "TR"}`).join("\n\n")}`
            
                    let atc = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: 'Atahan#8888.txt'});
                    await i.deferReply({ ephemeral:true })
                    await i.followUp({ files: [atc], ephemeral:true });

                }

                if(i.customId === "hepsi") {

                    let content = `Sorgulanan TCKN: ${TCKN} - Toplam Kayıt: ${veri.length}\nTarih: ${moment(Date.now()).format("LLLL")}\n\n${veri.map((x, i) => `YAKINLIK: ${x.YAKINLIK}\nTC: ${x.TC}\nADI & SOYADI: ${x.ADI} ${x.SOYADI}\nDOĞUM TARİHİ: ${x.DOGUMTARIHI}\nGSM: ${x?.GSM}\nANA ADI: ${x.ANNEADI}\nBABA ADI: ${x.BABAADI}\nNÜFUS İL: ${x.NUFUSIL}\nNÜFUS İLÇE: ${x.NUFUSILCE}\nUYRUK: ${x.UYRUK ? x.UYRUK : "TR"}`).join("\n\n")}`
            
                    let atc = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: 'Atahan#8888.txt'});
                    await i.deferReply({ ephemeral:true })
                    await i.followUp({ files: [atc], ephemeral:true });

                }

            })

        })

    }
}