const { SlashCommandBuilder } = require('discord.js');
const { hasGoodRole, goodRoles } = require('./discordCommands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Server mute for set amount of time')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Find a user that you wanna mute')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('Time in minutes')
				.setRequired(true)
		),

	async execute(interaction) {
		const userMentioned = interaction.options.getMember('user');
		const time = interaction.options.getInteger('time');
		const userID = interaction.member.id;

		if (!hasGoodRole(interaction.member)) {
			return interaction.reply({
				content: `<@${userID}>, you can't server mute ${userMentioned} because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
				ephemeral: true,
			});
		}

		if (!userMentioned.voice.channel) {
			return interaction.reply({
				content: `${userMentioned} is not in a voice channel`,
				ephemeral: true
			});
		}

		const unixTime = Math.floor((Date.now() / 1000) + time * 60);

		try {
			await userMentioned.voice.setMute(true, 'You said some fucky wacky');
			await interaction.reply({
				content: `User ${userMentioned} has been server muted for saying a bad word \nCooldown time <t:${unixTime}:R>`,
				ephemeral: true
			});
		} catch (error) {
			console.error(error);
			await interaction.reply('There was an error trying to server mute the user');
		}

		setTimeout(async () => {
			try {
				await userMentioned.voice.setMute(false, 'You will get away from saying it. For now');
			} catch (error) {
				console.error('Error unmuting the user:', error);
			}
		}, time * 60000);
	},
};
