const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('s')
        .setDescription('Send a message on the same channel')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Type a message you want to send')
                .setRequired(true)),

    async execute(interaction) {
        const message = interaction.options.getString('message');
        try {
            if (!hasGoodRole(interaction.member) || /<@&?\d+>/.test(message)) {
                return interaction.reply({
                    content: `You can't use this command because you don't have a required role: ${goodRoles.map(role => `<@&${role}>`).join(' or ')} to do that`,
                    ephemeral: true,
                });
            }

            await interaction.channel.send({
                content: `${message}`,
            });

            await interaction.reply({
                content: 'Message sent!',
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
};
