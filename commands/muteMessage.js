const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Server mute for set ammount of time')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Find a user that you wanna mute')
				.setRequired(true)
				)
        .addIntegerOption(option1 =>
			option1.setName('time')
                .setDescription('Time in minutes')
				.setRequired(true)
				),

	async execute(interaction) {
		const userMentioned = interaction.options.getMember('user');
		const time = interaction.options.getInteger('time');
        const userID = interaction.member.id;
		const unixTime = Math.floor((Date.now() / 1000) + `${time}` * 60);
		const goodRoles = ['Perhaps admin', 'Full part admin', 'Moderator'];

		if (!userMentioned.voice.channel) {
			return interaction.reply({
				context: `${userMentioned} is not in a voice channel`,
				ephemeral: true
			});
		} 
		const goodRoles = ['632250692509237268', '632244499292225583', '632244879216345138'];
		const hasGoodRole = goodRoles.some(role => userMentioned.roles.cache.has(role));

		if (!hasGoodRole) {
			return interaction.reply({
				content: `<@${userID}>, you can't server mute ${userMentioned} because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
				ephemeral: true,
			});
		}

		try {
			await userMentioned.voice.setMute(true, 'You said some fucky wacky');
			await interaction.reply({
				content: `User ${userMentioned} has been server muted for saying a bad word \nCooldown time <t:${unixTime}:R>`,
				ephemeral: true
			});
		} catch (error) {
			console.error(error);
			await interaction.reply('There was an error trying to server muted the user');
		}

		setTimeout(()=> {
			userMentioned.voice.setMute(false, 'You will get away from saying it. For now');
		},
            `${time}` * 60000);

	},
};