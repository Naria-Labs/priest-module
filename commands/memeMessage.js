const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mgenrandom')
		.setDescription('Make your message more fun or cringe')
		.addStringOption(option =>
			option.setName('randomemote')
				.setDescription('random emote')),


	async execute(interaction) {
		const emote = interaction.options.getString('randomemote');
		const meme = ["🔥🔥🔥💯💯💯🗣️🗣️🗣️", "💀💀💀", "🔥🔥🔥", "🗣️🗣️🗣️🔥🔥🔥🔥🔥🔥", "🙏🙏😭😭", "💯💯💯", "☝️", "🙏🙏🗣🗣🗣🔊🔊🔊🔊🔊"];
		const number = meme.length;
		const random = Math.floor(Math.random() * meme.length);

		await interaction.reply(`${emote} ${meme[random]}`);
	},
};