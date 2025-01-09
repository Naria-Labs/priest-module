const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pvlist')
        .setDescription('Get yourself a private list only for yourself'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const messageDir = './messages';
        const messageFile = path.join(messageDir, `${userId}.json`);

        const addOrUpdateMessage = (messageContent) => {
            if (fs.existsSync(messageFile)) {
                fs.readFile(messageFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }

                    const messageData = JSON.parse(data);
                    messageData.message = messageContent;

                    fs.writeFile(messageFile, JSON.stringify(messageData, null, 4), (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    });
                });
            } else {
                fs.mkdir(messageDir, { recursive: true }, (err) => {
                    if (err) {
                        console.error('Error creating directory:', err);
                        return;
                    }

                    const messageData = { message: messageContent };

                    fs.writeFile(messageFile, JSON.stringify(messageData, null, 4), (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    });
                });
            }
        };

        const getMessage = () => {
            if (fs.existsSync(messageFile)) {
                const data = fs.readFileSync(messageFile, 'utf8');
                const messageData = JSON.parse(data);
                return messageData.message;
            }
            return null;
        };

        const deleteMessage = () => {
            if (fs.existsSync(messageFile)) {
                fs.unlinkSync(messageFile);
            }
        };

        const channel = interaction.channel;

        if (!channel) {
            console.error('Channel not found.');
            return;
        }

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('show').setLabel('Show').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('create').setLabel('Create').setStyle(ButtonStyle.Primary).setDisabled(true),
        new ButtonBuilder().setCustomId('update').setLabel('Update').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
        );

        await interaction.reply({ content: 'Choose an action:', components: [buttons], ephemeral: true });

        const collector = channel.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
                return;
            }

            switch (i.customId) {
                case 'create':
                    const existingMessage = getMessage();
                    if (existingMessage) {
                        await i.reply({ content: 'You already have a message saved. Do you want to update it instead?', ephemeral: true });
                        return;
                    }

                    await i.reply({ content: 'Send me the message you want to create:', ephemeral: true });

                    const createCollector = channel.createMessageCollector({
                        filter: (m) => m.author.id === userId,
                        max: 1,
                        time: 15000,
                    });

                    createCollector.on('collect', (m) => {
                        addOrUpdateMessage(m.content);
                        m.reply({ content: 'Message saved successfully!', ephemeral: true });
                    });

                    createCollector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            i.followUp({ content: 'Time expired. You did not send a message.', ephemeral: true });
                        }
                    });
                    break;

                case 'update':
                    await i.reply({ content: 'Send me the updated message:', ephemeral: true });

                    const updateCollector = channel.createMessageCollector({
                        filter: (m) => m.author.id === userId,
                        max: 1,
                        time: 15000,
                    });

                    updateCollector.on('collect', (m) => {
                        addOrUpdateMessage(m.content);
                        m.reply({ content: 'Message updated successfully!', ephemeral: true });
                    });

                    updateCollector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            i.followUp({ content: 'Time expired. You did not send an updated message.', ephemeral: true });
                        }
                    });
                    break;

                case 'delete':
                    deleteMessage();
                    await i.reply({ content: 'Message deleted successfully!', ephemeral: true });
                    break;

                case 'show':
                    const message = getMessage();
                    if (message) {
                        const content = message.length > 1984 ? `${message.substring(0, 1984)}...` : message;
                        await i.reply({ content: content, ephemeral: true });
                    } else {
                        await i.reply({ content: 'No message found.', ephemeral: true });
                    }
                    break;

                default:
                    await i.reply({ content: 'Invalid action.', ephemeral: true });
            }
        });

        collector.on('end', () => {
            interaction.editReply({ content: 'Interaction ended.', components: [] });
        });
    },
};
