const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dcomm')
		.setDescription('Execute a shell command'),

	async execute(interaction) {
		const command = 'pm2 log develop-priest --lines 1000';

		// Log the current working directory
		const currentDir = process.cwd();
		console.log(`Current working directory: ${currentDir}`);

		// Reply with the current working directory for debugging
		await interaction.reply(`Executing command: \`${command}\` in directory: \`${currentDir}\``);

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return interaction.followUp(`Error: ${error.message}`);
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return interaction.followUp(`Stderr: ${stderr}`);
			}

			// Save the output and get the last 1984 characters
			const output = stdout;
			const last1984Chars = output.slice(-154);

			const basedEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Command Output')
				.setDescription(`\`\`\`${last1984Chars}\`\`\``) // Slice to last 1984 characters
				.setTimestamp();

			interaction.followUp({ embeds: [basedEmbed] });
		});
	},
};
