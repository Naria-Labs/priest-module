const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
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
                content: `You can't use this command because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
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
            const sentMessage = await user.send({ embeds: [messageToUser] });

            await interaction.reply({ content: 'Message sent successfully! Waiting for reply...', ephemeral: true });

            const filter = response => response.author.id === userID;
            const collector = user.dmChannel.createMessageCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async response => {
                console.log(`Collected message: ${response.content}`);
                const replyMessage = new EmbedBuilder()
                    .setColor(0x003253)
                    .setTitle(`You got a reply from ${response.author.tag}`)
                    .addFields(
                        { name: 'Reply', value: response.content, inline: true },
                    )
                    .setTimestamp();

                await userThatSent.send({ embeds: [replyMessage] });
                await response.reply({ content: `Your message is "${response.content}" and it has been sent!`, ephemeral: true });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    user.send('You did not reply in time.');
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: `Failed to send the message. Error: ${error.message}`, ephemeral: true });
        }
    },
};
