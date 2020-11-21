const CommandPattern = require("../../models/Command.js");

const commandParams = {
    
    name: "gametuto",
    aliases: [],
    desc: "Affiche l'aide pour installer un jeu cracké.",
    enabled: true,
    dm: true,
    nsfw: false,
    memberPermission: [],
    botPermission: [],
    owner: false,
    cooldown: null

}

module.exports = class extends CommandPattern {

    constructor () {
        super(commandParams)
    }

    async run (msg, args, cmd, color) {

        msg.channel.send(new MessageEmbed()
            .setTitle('Tuto pour installer et jouer aux jeux PC')
            .setColor(color)
            .setDescription(`[Cliquez ici](https://igg-games.com/how-to-install-a-pc-game-and-update.html)`)
        );

    }

}