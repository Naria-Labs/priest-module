const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { exec } = require('child_process');
const { admins } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dcomm')
        .setDescription('Execute a shell command and paginate the output'),

    async execute(interaction) {
        const userID = interaction.user.id;

        if (!admins.includes(userID)) {
            return interaction.reply({
                content: `You don't have permission to use this command.`,
                ephemeral: true,
            });
        }

        const command = 'pm2 log develop-priest --lines 100 --nostream';

        //Log the current working directory
        const currentDir = process.cwd();
        console.log(`Current working directory: ${currentDir}`);

        await interaction.reply(`Executing command: \`${command}\` in directory: \`${currentDir}\``);

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return interaction.followUp(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return interaction.followUp(`Stderr: ${stderr}`);
            }

            //Split the output into pages
            const lines = stdout.split('\n');
            const linesPerPage = 22;
            const totalPages = Math.ceil(lines.length / linesPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * linesPerPage;
                const end = start + linesPerPage;
                const pageLines = lines.slice(start, end).join('\n') || 'No content available.';

                return new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Command Output - Page ${page + 1}/${totalPages}`)
                    .setDescription(`\`\`\`${pageLines}\`\`\``)
                    .setTimestamp();
            };

            const buttons = () => new ActionRowBuilder()
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
                        .setDisabled(currentPage + 1 >= totalPages)
                );

            const message = await interaction.followUp({
                embeds: [generateEmbed(currentPage)],
                components: [buttons()],
                ephemeral: true,
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({
                filter,
                componentType: ComponentType.Button,
                time: 60000,
            });

            collector.on('collect', async i => {
                if (i.customId === 'previous') currentPage--;
                else if (i.customId === 'next') currentPage++;

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [buttons()],
                });
            });

            collector.on('end', () => {
                message.edit({ components: [] });
            });
        });
    },
};
