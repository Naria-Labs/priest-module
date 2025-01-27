const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('smessage')
        .setDescription('Send a message to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Type a user you want to send a message')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Type a message you want to send to the user')
                .setRequired(true)),

    async execute(interaction) {
        const userMentioned = interaction.options.getUser('user');
        const userID = userMentioned.id;
        const message = interaction.options.getString('message');
        const userThatSent = interaction.user;

        if (!hasGoodRole(interaction.member)) {
            return interaction.reply({
                content: `<@${userID}>, you can't use this comannd ${userMentioned} because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
                ephemeral: true,
            });
        }

        const messageToUser = new EmbedBuilder()
            .setColor(0x003253)
            .setTitle(`You got a new mail from ${userThatSent.tag}`)
            .addFields(
                { name: 'Message', value: message, inline: true },
            )
            .setTimestamp();

        try {
            const user = await interaction.client.users.fetch(userID);
            await user.send({ embeds: [messageToUser] });
            await interaction.reply({ content: 'Message sent successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'Failed to send the message.', ephemeral: true });
        }
    },
};
