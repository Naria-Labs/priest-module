const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { goodRoles, hasGoodRole } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mdelete')
        .setDescription('Deletes x amount of messages')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Set the amount of messages you want to delete')
                .setMinValue(1)
                .setRequired(true)
        ),

    async execute(interaction) {
        const number = interaction.options.getInteger('number');
        const user = interaction.options.getUser('user');
        const userMentioned = interaction.member;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        if (!hasGoodRole(userMentioned)) {
            return interaction.reply({
                content: `You can't delete messages because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
                ephemeral: true,
            }).catch(console.error);
        } else {
            await interaction.reply({ content: `Are you sure you want to delete ${number} messages ${userMentioned} ?`, components: [row], ephemeral: true })
                .catch(console.error);

            const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    let messages = await interaction.channel.messages.fetch({ limit: number });

                    if (user) {
                        messages = messages.filter(msg => msg.author.id === user.id);
                    }

                    await interaction.channel.bulkDelete(messages, true)
                        .then(deletedMessages => {
                            i.update({ content: `Successfully deleted ${deletedMessages.size} messages.`, components: [] });
                        })
                        .catch(error => {
                            console.error('Error deleting messages:', error);
                            i.update({ content: 'There was an error trying to delete messages in this channel.', components: [] });
                        });
                } else if (i.customId === 'cancel') {
                    i.update({ content: 'Message deletion canceled.', components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Message deletion timed out.', components: [] })
                        .catch(console.error);
                }
            });
        }
    },
};
