const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pvlist')
        .setDescription('Get yourself a private list only for yourself'),

    async execute(interaction) {
        const userId = interaction.user.id;

        const addOrUpdateMessage = (userId, messageContent) => {
            const messageFile = `./messages/${userId}.json`;

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
                            return;
                        }
                    });
                });
            } else {
                fs.mkdir('./messages', { recursive: true }, (err) => {
                    if (err) {
                        console.error('Error creating directory:', err);
                        return;
                    }

                    const messageData = { message: messageContent };

                    fs.writeFile(messageFile, JSON.stringify(messageData, null, 4), (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                            return;
                        }
                    });
                });
            }
        };

        const getMessage = (userId) => {
            const messageFile = `./messages/${userId}.json`;
            if (fs.existsSync(messageFile)) {
                const data = fs.readFileSync(messageFile, 'utf8');
                const messageData = JSON.parse(data);
                return messageData.message;
            }
            return null;
        };

        const deleteMessage = (userId) => {
            const messageFile = `./messages/${userId}.json`;
            if (fs.existsSync(messageFile)) {
                fs.unlinkSync(messageFile);
            }
        };

        const splitMessage = (message, { maxLength = 2000 } = {}) => {
            if (message.length <= maxLength) {
                return [message];
            }

            const chunks = [];
            let currentChunk = '';

            for (const line of message.split('\n')) {
                if (currentChunk.length + line.length + 1 > maxLength) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                currentChunk += (currentChunk.length ? '\n' : '') + line;
            }

            if (currentChunk) chunks.push(currentChunk);
            return chunks;
        };

        // Ensure the interaction has a valid channel
        const channel = interaction.guild ? interaction.channel : interaction.user.dmChannel;

        if (!channel) {
            console.error('Channel not found.');
            return;
        }

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('show').setLabel('Show').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('create').setLabel('Create').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('update').setLabel('Update').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
        );

        // Send the initial interaction response with buttons
        await interaction.reply({ content: 'Choose an action:', components: [buttons], ephemeral: true });

        const collector = channel.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
                return;
            }

            switch (i.customId) {
                case 'create':
                    await i.reply({ content: 'Send me the message you want to create (not implemented for DMs):', ephemeral: true });

                    const createCollector = channel.createMessageCollector({
                        filter: (m) => m.author.id === userId,
                        max: 1,
                        time: 15000,
                    });

                    createCollector.on('collect', (m) => {
                        addOrUpdateMessage(userId, m.content);
                        m.reply({ content: 'Message saved successfully!', ephemeral: true });
                    });
                    break;

                case 'update':
                    await i.reply({ content: 'Send me the updated message (not implemented for DMs):', ephemeral: true });

                    const updateCollector = channel.createMessageCollector({
                        filter: (m) => m.author.id === userId,
                        max: 1,
                        time: 15000,
                    });

                    updateCollector.on('collect', (m) => {
                        addOrUpdateMessage(userId, m.content);
                        m.reply({ content: 'Message updated successfully!', ephemeral: true });
                    });
                    break;

                case 'delete':
                    deleteMessage(userId);
                    await i.reply({ content: 'Message deleted successfully!', ephemeral: true });
                    break;

                case 'show':
                    const message = getMessage(userId);

                    if (message && message.trim()) {
                        const chunks = splitMessage(message, { maxLength: 1984 });
                        for (const chunk of chunks) {
                            await i.reply({
                                content: chunk,
                                ephemeral: true,
                            });
                        }
                    } else {
                        await i.reply({
                            content: 'No message found or the message is empty.',
                            ephemeral: true,
                        });
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
