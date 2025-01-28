const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');
const { goodRoles, hasGoodRole } = require('./discordCommands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dcomm')
		.setDescription('Execute a shell command'),

	async execute(interaction) {
		const userMentioned = interaction.options.getUser('user');
		const userID = userMentioned.id;

		if (!hasGoodRole(interaction.member)) {
			return interaction.reply({
				content: `<@${userID}>, you can't use this command because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
				ephemeral: true,
			});
		}

		const command = 'pm2 log develop-priest --lines 1000 --nostream';

		try {
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

				// Log the stdout and stderr for debugging
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);

				// Save the output and get the last 1984 characters
				const output = stdout;
				const last1984Chars = output.slice(-1984);

				const basedEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Command Output')
					.setDescription(`\`\`\`${last1984Chars}\`\`\``) // Slice to last 1984 characters
					.setTimestamp();

				interaction.followUp({ embeds: [basedEmbed] });
			});
		} catch (error) {
			console.error(`Unexpected error: ${error}`);
			interaction.followUp(`Unexpected error: ${error.message}`);
		}
	},
};
