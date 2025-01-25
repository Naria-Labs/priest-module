const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');
const { ActivityType } = require('discord.js');

const botStatus = [
    { name: 'Online', value: 'online' },
    { name: 'Idle', value: 'idle' },
    { name: 'Do Not Disturb', value: 'dnd' },
    { name: 'Invisible', value: 'invisible' },
];

const botActivity = [
    { name: 'Playing', value: 'playing' },
    { name: 'Streaming', value: 'streaming' },
    { name: 'Listening', value: 'listening' },
    { name: 'Watching', value: 'watching' },
    { name: 'Competing', value: 'competing' },
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
                .addStringOption((option) =>
                    option
                        .setName('activity')
                        .setDescription('Set the bot activity')
                        .setRequired(false)
                        .addChoices(...botActivity)
                )
                .addStringOption((option) =>
                    option
                        .setName('details')
                        .setDescription('Details for the activity')
                        .setRequired(false)
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

        const activity = interaction.options.getString('activity');
        const details = interaction.options.getString('details');
        if (activity) {
            await interaction.client.user.setActivity(details ? details : '', { type: ActivityType[activity] });
        }

        await interaction.reply({
            content: 'Bot status has been set',
            ephemeral: true,
        });
    },
};
