const { SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');

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

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle('SECONDARY')
            );

        await interaction.reply({ content: `Are you sure you want to delete ${number} messages?`, components: [row], ephemeral: true });

        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                const messages = await interaction.channel.messages.fetch({ limit: number });

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
                interaction.editReply({ content: 'Message deletion timed out.', components: [] });
            }
        });
    },
};
