const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');

const botStatus = [
    { name: 'Online', value: 'online' },
    { name: 'Idle', value: 'idle' },
    { name: 'Do Not Disturb', value: 'dnd' },
    { name: 'Invisible', value: 'invisible' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bstat')
        .setDescription('Set the bot to the 4 possible statuses')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set')
                .setDescription('Set a bot to the 4 possible statuses (online, idle, dnd, invisible)')
                .addStringOption((option) =>
                    option
                        .setName('status')
                        .setDescription('Choose the bot status')
                        .setRequired(true)
                        .addChoices(...botStatus)
                )
        ),

    async execute(interaction) {
        if (!hasGoodRole(interaction.member)) {
            return interaction.reply({
                content: `You can't use this command because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
                ephemeral: true,
            });
        }

        const status = interaction.options.getString('status');
        await interaction.client.user.setStatus(status);

        await interaction.reply('Bot status has been set');
    },
};
