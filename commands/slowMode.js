const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription('Enable slowmode for a channel that you write in')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('Set a number for how many seconds a user must wait between messages')
				.setRequired(true)),

	async execute(interaction) {
		const channel = interaction.channel;
		const number = interaction.options.getInteger('number');
		if (!hasGoodRole(interaction.member)) {
			return interaction.reply({
				content: `You can't set slowmode because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
				ephemeral: true,
			});
		}
		if (number === 0) {
			await channel.setRateLimitPerUser(0);
			await interaction.reply({
				content: `Slowmode has been disabled in ${channel}`,
				ephemeral: true,
			});
		} else {
			await channel.setRateLimitPerUser(number);
			await interaction.reply({
				content: `Slowmode has been set to ${number} seconds per user in ${channel}`,
				ephemeral: true,
			});
		}
	}
};
