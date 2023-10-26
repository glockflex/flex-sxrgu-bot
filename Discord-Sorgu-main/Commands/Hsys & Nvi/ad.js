const config = require("../../Settings/config");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType } = require("discord.js");
const { getData } = require("../../Settings/functions");
const moment = require("moment");
moment.locale("tr");

module.exports = {
    name: "ad-sorgu",
    command: new SlashCommandBuilder().setName("ad-sorgu").setDescription("Sadece ad ile sorgu.")
    .addStringOption(option => option.setName("ad").setDescription("Sorgulanan kişinin adı.").setRequired(true))
    .addStringOption(option => option.setName("soyad").setDescription("Sorgulanan kişinin soyadı.").setRequired(false))
    .addStringOption(option => option.setName("dt").setDescription("Sorgulanan kişinin doğum tarihi.").setRequired(false))
    .addStringOption(option => option.setName("nufusil").setDescription("Sorgulanan kişinin nüfus ili.").setRequired(false))
    .addStringOption(option => option.setName("nufusilce").setDescription("Sorgulanan kişinin nüfus ilçesi.").setRequired(false))
    .addStringOption(option => option.setName("annead").setDescription("Sorgulanan kişinin anneadi.").setRequired(false))
    .addNumberOption(option => option.setName("annetc").setDescription("Sorgulanan kişinin annea tc si.").setRequired(false))
    .addStringOption(option => option.setName("babaad").setDescription("Sorgulanan kişinin babaadi.").setRequired(false))
    .addNumberOption(option => option.setName("babatc").setDescription("Sorgulanan kişinin babatc si.").setRequired(false))
    .addStringOption(option => option.setName("uyruk").setDescription("Sorgulanan kişinin uyrugu.").setRequired(false))
    .addNumberOption(option => option.setName("tc").setDescription("Sorgulanan kişinin tc si örn ilk 3 hanesi vb.").setRequired(false)),
    ownerOnly: false,
    async execute(client, int, embed) {

        let ad = int.options.getString("ad");
        let soyad = int.options.getString("soyad");
        let dt = int.options.getString("dt");
        let nufusil = int.options.getString("nufusil");
        let nufusilce = int.options.getString("nufusilce");
        let annead = int.options.getString("annead");
        let annetc = int.options.getNumber("annetc");
        let babaad = int.options.getString("babaad");
        let babatc = int.options.getNumber("babatc");
        let uyruk = int.options.getString("uyruk");
        let tc = int.options.getNumber("tc");

        ad = ad.toLocaleUpperCase("TR");

        const conditions = [
            soyad && `soyad=${soyad}`,
            dt && `dt=${dt}`,
            nufusil && `il=${nufusil}`,
            nufusilce && `ilce=${nufusilce}`,
            annead && `annead=${annead}`,
            babaad && `babaad=${babaad}`,
            annetc && `annetc=${annetc}`,
            babatc && `babatc=${babatc}`,
            uyruk && `uyruk=${uyruk}`,
            tc && `tc=${tc}`,
        ].filter(Boolean);

        let veri = await getData(`${config.api.AD}${ad}${conditions.length > 0 ? "&" + conditions.join("&") : ""}`);

        if(veri.success === false) return await int.followUp({ embeds: [embed.setDescription("Böyle bir kişi bulunamadı!")] });

        veri = veri.data;

        let page = 0;
        let index = 10;

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
            .setTitle(`**${ad}** Adlı kişinin **${veri.length}** sonuç bulundu.`)
            .setDescription(`${slicedVeri.map((x, i) => `\`${i+1}.\` TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`)
            await int.followUp({ embeds: [embed], components: [row] }).then(async msg => {

                const collector = await msg.createMessageComponentCollector({ componentType: ComponentType.Button });

                collector.on("collect", async(i) => {

                    if(i.user.id !== int.user.id) return await i.reply({ content: `Bu komutu sadece ${int.user} kullanabilir!`, ephemeral: true });

                    if(i.customId === "previous") {

                        page--;

                        slicedVeri = veri.slice(page * index, (page + 1) * index)
                        let embeds = msg.embeds[0];
                        embeds.data.description = `${slicedVeri.map((x, i) => `\`${(i+1) + (page * index)}.\` TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`
                    
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
                        embeds.data.description = `${slicedVeri.map((x, i) => `\`${(i+1) + (page * index)}.\` TC: \`${x.TC}\` - \`${x.ADI} ${x.SOYADI}\` - DOĞUM TARİHİ: \`${x.DOGUMTARIHI}\` - ANA ADI: \`${x.ANNEADI}\` - BABA ADI: \`${x.BABAADI}\` - NÜFUS İL: \`${x.NUFUSIL}\` - NÜFUS İLÇE: \`${x.NUFUSILCE}\` - UYRUK: :flag_${x.UYRUK ? x.UYRUK.toLowerCase() : "tr"}:`).join("\n\n")}`
                    
                        row.components[0].setDisabled(page === 0);
                        row.components[1].setDisabled(page === maxPage - 1);
                        await i.update({ embeds: [embeds], components: [row]}).catch(async() => {
                        await int.editReply({ embeds: [embeds], components: [row]})
                    })

                    }

                    if(i.customId === "sayfa") {

                        let content = `Sorgulanan Kişi: ${ad} - Toplam Kayıt: ${slicedVeri.length}\nTarih: ${moment(Date.now()).format("LLLL")}\n\n${slicedVeri.map((x, i) => `TC: ${x.TC}\nADI & SOYADI: ${x.ADI} ${x.SOYADI}\nDOĞUM TARİHİ: ${x.DOGUMTARIHI}\nANA ADI: ${x.ANNEADI}\nBABA ADI: ${x.BABAADI}\nNÜFUS İL: ${x.NUFUSIL}\nNÜFUS İLÇE: ${x.NUFUSILCE}\nUYRUK: ${x.UYRUK ? x.UYRUK : "TR"}`).join("\n\n")}`
                
                        let atc = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: 'Atahan#8888.txt'});
                        await i.deferReply({ ephemeral:true })
                        await i.followUp({ files: [atc], ephemeral:true });

                    }

                    if(i.customId === "hepsi") {

                        let content = `Sorgulanan Kişi: ${ad} - Toplam Kayıt: ${veri.length}\nTarih: ${moment(Date.now()).format("LLLL")}\n\n${veri.map((x, i) => `TC: ${x.TC}\nADI & SOYADI: ${x.ADI} ${x.SOYADI}\nDOĞUM TARİHİ: ${x.DOGUMTARIHI}\nANA ADI: ${x.ANNEADI}\nBABA ADI: ${x.BABAADI}\nNÜFUS İL: ${x.NUFUSIL}\nNÜFUS İLÇE: ${x.NUFUSILCE}\nUYRUK: ${x.UYRUK ? x.UYRUK : "TR"}`).join("\n\n")}`
                
                        let atc = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: 'Atahan#8888.txt'});
                        await i.deferReply({ ephemeral:true })
                        await i.followUp({ files: [atc], ephemeral:true });

                    }

                })

            })

    }
}
