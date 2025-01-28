const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all of the commands that are available'),

    async execute(interaction) {
        const commands = Array.from(interaction.client.commands.values());
        const commandsPerPage = 10; // 2 rows with 5 commands each
        let currentPage = 0;

        const generateEmbed = (page) => {
            const start = page * commandsPerPage;
            const end = start + commandsPerPage;
            const currentCommands = commands.slice(start, end);

            const helpEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Help Information')
                .setDescription('List of all commands so far');

            currentCommands.forEach(command => {
                helpEmbed.addFields({
                    name: command.data.name,
                    value: command.data.description,
                    inline: true,
                });
            });

            return helpEmbed;
        };

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('⬅️')
                    .setStyle('Primary')
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️')
                    .setStyle('Primary')
                    .setDisabled(commands.length <= commandsPerPage)
            );

        const message = await interaction.reply({ embeds: [generateEmbed(currentPage)], components: [buttons], ephemeral: true });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage--;
            } else if (i.customId === 'next') {
                currentPage++;
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle('Primary')
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle('Primary')
                                .setDisabled((currentPage + 1) * commandsPerPage >= commands.length)
                        )
                ]
            });
        });

        collector.on('end', () => {
            message.edit({ components: [] });
        });
    },
};


