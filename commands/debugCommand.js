const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');
const { admins } = require('./discordCommands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dcomm')
		.setDescription('Execute a shell command'),

	async execute(interaction) {
		const userID = interaction.user.id;

		if (!admins.includes(userID)) {
			return interaction.reply({
				content: `You don't have permission to use this command.`,
				ephemeral: true,
			});
		}

		const command = 'pm2 log develop-priest --lines 1000 --nostream';

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

			//Log the stdout and stderr for debugging
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
			const output = stdout;
			const last= output.slice(-1999);

			const debugEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Command Output')
				.setDescription(`\`\`\`${last}\`\`\``) // Slice to last 1984 characters
				.setTimestamp();

			interaction.followUp({	
				embeds: [debugEmbed],
				ephermal: true,
			});
		});
	},
};
