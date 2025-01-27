const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');

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

        const messageToUser = new EmbedBuilder()
            .setColor(0x003253)
            .setTitle(`You got a new mail from ${userThatSent.tag}`)
            .addFields(
                { name: 'Message', value: message, inline: true },
            )
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reply')
                    .setLabel('Reply')
                    .setStyle('PRIMARY')
            );

        try {
            const user = await interaction.client.users.fetch(userID);
            const dmChannel = await user.createDM();
            await dmChannel.send({ embeds: [messageToUser], components: [buttons] });

            await interaction.reply({ content: 'Message sent successfully! Waiting for reply...', ephemeral: true });

            const filter = i => i.customId === 'reply' && i.user.id === userID;
            const collector = dmChannel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'reply') {
                    await i.reply({ content: 'Please type your reply:', ephemeral: true });

                    const messageFilter = response => response.author.id === userID;
                    const messageCollector = dmChannel.createMessageCollector({ filter: messageFilter, max: 1, time: 60000 });

                    messageCollector.on('collect', async response => {
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

                    messageCollector.on('end', collected => {
                        if (collected.size === 0) {
                            dmChannel.send('You did not reply in time.');
                        }
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    dmChannel.send('You did not click the reply button in time.');
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: `Failed to send the message. Error: ${error.message}`, ephemeral: true });
        }
    },
};


