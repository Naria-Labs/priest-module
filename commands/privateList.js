const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pvlist')
        .setDescription('Get yourself a private list only for yourself'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const messageDir = path.join(__dirname, 'messages');
        const messageFile = path.join(messageDir, `${userId}.json`);

        const addOrUpdateMessage = async (messageContent) => {
            try {
                await fs.mkdir(messageDir, { recursive: true });
                const messageData = { message: messageContent };
                await fs.writeFile(messageFile, JSON.stringify(messageData, null, 4));
            } catch (err) {
                console.error('Error writing file:', err);
            }
        };

        const getMessage = async () => {
            try {
                const data = await fs.readFile(messageFile, 'utf8');
                const messageData = JSON.parse(data);
                return messageData.message;
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error('Error reading file:', err);
                }
                return null;
            }
        };

        const deleteMessage = async () => {
            try {
                await fs.unlink(messageFile);
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error('Error deleting file:', err);
                }
            }
        };

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

        await interaction.reply({ content: 'Choose an action:', components: [buttons], ephemeral: true });

        const collector = channel.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
                return;
            }

            switch (i.customId) {
                case 'create':
                    const existingMessage = await getMessage();
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

                    createCollector.on('collect', async (m) => {
                        await addOrUpdateMessage(m.content);
                        await m.reply({ content: 'Message saved successfully!' });
                    });

                    createCollector.on('end', async (collected, reason) => {
                        if (reason === 'time') {
                            await i.followUp({ content: 'Time expired. You did not send a message.', ephemeral: true });
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

                    updateCollector.on('collect', async (m) => {
                        await addOrUpdateMessage(m.content);
                        await m.reply({ content: 'Message updated successfully!' });
                    });

                    updateCollector.on('end', async (collected, reason) => {
                        if (reason === 'time') {
                            await i.followUp({ content: 'Time expired. You did not send an updated message.', ephemeral: true });
                        }
                    });
                    break;

                case 'delete':
                    await deleteMessage();
                    await i.reply({ content: 'Message deleted successfully!', ephemeral: true });
                    break;

                case 'show':
                    const message = await getMessage();
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

        collector.on('end', async () => {
            await interaction.editReply({ content: 'Interaction ended.', components: [] });
        });
    },
};