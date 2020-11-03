const CommandPattern = require("../../models/Command.js");
const channelReg = /^<#(\d+)>$/

const commandParams = {
    
    name: "updatechannel",
    aliases: [
        "channelupdate"
    ],
    desc: "Permet de gérer le channel de news.",
    enabled: true,
    dm: false,
    nsfw: false,
    memberPermission: ["ADMINISTRATOR"],
    botPermission: [],
    owner: false,
    cooldown: null

}

module.exports = class extends CommandPattern {

    constructor () {
        super(commandParams)
    }

    async run (msg, args, cmd, color) {

        let embed = this.getEmbed(msg, color)

        let m = await msg.channel.send(embed)
        await m.react('#⃣')
        await m.react('📢')
        await m.react('📂')

        let filter = (reaction, user) => user.id === msg.author.id && ["#⃣", "📢", "📂"].concat(config.categories.map(val => val.emote)).includes(reaction.emoji.name)

        let reac = m.createReactionCollector(filter, {time: 300000,errors:['time']})

        reac.on("collect", async(reaction) => {

            let emoji = reaction.emoji.name
            await reaction.users.remove(msg.author.id)

            if (emoji === "#⃣") await changeChannel(msg, m, color)
            else if (emoji === "📢") await changeNotifiedRole(msg, m, color)
            else if (emoji === "📂") await enableCategories(msg, m, color)
            else await changeCategory(msg, m, color, reac)

        })


    }

    async changeChannel (msg, m, color) {

        let askMessage = await msg.channel.send(new MessageEmbed()
            .setTitle('Veuillez mentionner le salon dans lequel arriveront les updates')
            .setColor(color)
            .setDescription('*Si vous ne désirez plus que le bot envoie les updates, entrez simplement `off`*')
        )

        let filter = me => me.author.id === msg.author.id && ( me.content.toLowerCase() === "off" || reg.test(me.content))
        let rep = await msg.channel.awaitMessages(filter, {max: 1, time: 60000})
        await askMessage.delete()
        if (!rep.first()) return
        await rep.first().delete()

        if (rep.first().content.toLowerCase() === "off") db.guild.set(`guilds.${msg.guild.id}.updateChannel`, false).write()
        else {

            db.guild.set(`guilds.${msg.guild.id}.updateChannel`, rep.first().content.slice(2, -1)).write()
            db.guild.set(`guilds.${msG.guild.id}.updateIgnoreNotifs`, []).write()

        }

    }




    getEmbed(msg, color) {

        //variables
        let guildObj = db.guild.get(`guilds.${msg.guild.id}`).value
        let channel = guildObj.updateChannel,
            role = guildObj.updateRole,
            categories = config.categories.map(cat => `\\${cat.emote} **${cat.fancyName}** : ${guildObj.updateIgnoreNotifs.includes(cat.name) ? "\\❌":"\\✅"}`)

        return new MessageEmbed()
            .setTitle("Etat actuel du système d'updates et de notifications du serveur " + msg.guild.name)
            .setDescription(`Les "updates" sont en réalité toutes les notifications que le bot peut envoyer sur votre serveur. Cela concerne les **nouvelles pages des différentes catégories**, les **nouveaux épisodes (animes/séries) ou chapitres (mangas)**, les **informations importantes**, les **problèmes sur le bot** ou encore les **nouveautés (nouvelles commandes et mises à jour par exemple)**. Il est donc très important et utile d'activer cette fonctionnalité.\n\n*Il vous faudra donc pour activer ce système séléctionner un salon d'update en cliquant sur la première réaction ci-dessou. Appuyez sur les réactions symbolisant les catégories pour changer leur état et décider de quelles catégories recevoir les updates. Enfin, appuyez sur la derniere réaction pour changer le rôle à mentionner lors d'updates (n'oubliez pas de rendre le rôle mentionnable dans les paramètres de votre serveur).*\n\n\u200b`)
            .addField('#⃣ Salon recevant les updates', "```" + channel ? msg.guild.channels.cache.get(channel).name : "Aucun" + "```\n\u200b")
            .addField("📢 Rôle mentionné lors d'une update", role ? `<@&${role}>` : "Aucun" + "\n\u200b")
            .addField("📂 Catégories concernées par les updates", categories.join("\r\n"))
            .setColor(color)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))

    }




}