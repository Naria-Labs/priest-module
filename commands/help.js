const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all of the commands that are avaiable'),

    async execute(interaction) {
        const commands = interaction.client.commands;
        const helpEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Help')
            .setDescription('List of all commands');
        commands.forEach(command => {
            helpEmbed.addFields({
                name: command.data.name,
                value: command.data.description,
                inline: false,
            });
        });
        await interaction.reply({ embeds: [helpEmbed] });
       
    },
};
