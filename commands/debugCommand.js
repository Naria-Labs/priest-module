const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dcomm')
		.setDescription('Debug command for last 2k chars'),

	async execute(interaction) {
		//Log the current working directory
		const currentDir = process.cwd();
		console.log(`Current working directory: ${currentDir}`);

		//Reply with the current working directory for debugging
		await interaction.reply(`Current working directory: ${currentDir}`);

		exec('cd ../.. && cd naria-labs/rzulty-bot-priest && pm2 log develop-priest --lines 1000', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return interaction.followUp(`Error: ${error.message}`);
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return interaction.followUp(`Stderr: ${stderr}`);
			}

			const basedEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Log Output')
				.setDescription(`\`\`\`${stdout.slice(-1984)}\`\`\``) // Slice to last 1984 characters
				.setTimestamp();

			interaction.followUp({ embeds: [basedEmbed] });
		});
	},
};
