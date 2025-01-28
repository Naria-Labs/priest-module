const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dcomm')
		.setDescription('Debug command for last 2k chars'),

	async execute(interaction) {
		exec('cd ../.. && cd naria-labs/rzulty-bot-priest && pm2 log develop-priest --lines 1000', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return interaction.reply(`Error: ${error.message}`);
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return interaction.reply(`Stderr: ${stderr}`);
			}

			const basedEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Log Output')
				.setDescription(`\`\`\`${stdout.slice(-1984)}\`\`\``) // Slice to last 1984 characters
				.setTimestamp();

			interaction.reply({ embeds: [basedEmbed] });
		});
	},
};
