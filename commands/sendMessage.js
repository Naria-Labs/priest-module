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

        //Add buttons to the message to allow the user to reply to the message and send it to the user that sent the message
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reply')
                    .setLabel('Reply')
                    .setStyle('PRIMARY'),
                new ButtonBuilder()
                    .setCustomId('send')
                    .setLabel('Send')
                    .setStyle('PRIMARY'),
            );

        const messageToUser = new EmbedBuilder()
            .setColor(0x003253)
            .setTitle(`You got a new mail from ${userThatSent.tag}`)
            .addFields(
                { name: 'Message', value: message, inline: true },
            )
            .setTimestamp();

        try {
            const user = await interaction.client.users.fetch(userID);
            const sentMessage = await user.send({ embeds: [messageToUser], components: [buttons] });
            await interaction.reply({ content: 'Message sent successfully!', ephemeral: true });

            const filter = i => i.customId === 'reply' && i.user.id === userID;
            const collector = sentMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'reply') {
                    await i.reply({ content: 'Please type your reply:', ephemeral: true });

                    const filter = response => response.author.id === userID;
                    const replyCollector = i.channel.createMessageCollector({ filter, time: 60000 });

                    replyCollector.on('collect', async response => {
                        const replyMessage = new EmbedBuilder()
                            .setColor(0x003253)
                            .setTitle(`You got a reply from ${response.author.tag}`)
                            .addFields(
                                { name: 'Reply', value: response.content, inline: true },
                            )
                            .setTimestamp();

                        await userThatSent.send({ embeds: [replyMessage] });
                        await response.reply({ content: 'Your reply has been sent!', ephemeral: true });
                        replyCollector.stop();
                    });

                    replyCollector.on('end', collected => {
                        if (collected.size === 0) {
                            i.followUp({ content: 'You did not reply in time.', ephemeral: true });
                        }
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    sentMessage.edit({ components: [] });
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'Failed to send the message.', ephemeral: true });
        }
    },
};

