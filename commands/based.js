const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('basedlvl')
		.setDescription('How based are you on the scale')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Set a user that you want to see amazing based lvl')),

	async execute(interaction) {
		//red>>blue>>purple>>green
		//base lvls
		//maybe every 25 %?
		const red = 0xff0000;
		const blue = 0x0000ff;
		const purple = 0x800080;
		const green = 0x008000;
		const userMentioned = interaction.options.getMember('user');
		const userID = userMentioned.id;
		const userString = parseInt(userID.toString().slice(-2), 10);
		const today = new Date().getDate();
        
		const ifBased = userString * today;
		const basedLvl = parseInt(ifBased.toString().slice(-2), 10);

		let basedColor;
		let text;

		if (basedLvl >= 0 && basedLvl <= 25) {
			basedColor = red;
			text = 'You are not based at all. Try maybe in the next incarnation.';
		} else if (basedLvl >= 26 && basedLvl <= 50) {
			basedColor = blue;
			text = 'You are based but not that much. Maybe try to appeal to the court of baseness.';
		} else if (basedLvl >= 51 && basedLvl <= 75) {
			basedColor = purple;
			text = 'You are closer to basedness. Keep it up, you are so close.';
		} else if (basedLvl >= 76 && basedLvl <= 100) {
			basedColor = green;
			text = 'Congratulations, you are so based that it\'s not possible to measure it.';
		}

		const basedEmbed = new EmbedBuilder()
			.setColor(basedColor)
			.setTitle('How based are you')
			.setDescription(`User ${userMentioned}, how based is that person?`)
			.addFields(
				{ name: 'Basedness level', value: `${text}`, inline: true },
			)
			.setTimestamp();

		await interaction.reply({ embeds: [basedEmbed] });
	},
};