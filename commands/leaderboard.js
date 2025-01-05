const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Leaderboard of the top 5 players'),

	async execute(interaction) {
		try {
			// Directory containing score files
			const scoreFile = './scores';
			const files = fs.readdirSync(scoreFile);

			// Parse scores
			const scores = files.map((file) => {
				try {
					const data = fs.readFileSync(`${scoreFile}/${file}`, 'utf-8');
					const scoreData = JSON.parse(data);
					return { id: file.replace('.json', ''), score: scoreData.score }; // Remove file extension for player ID
				} catch (err) {
					console.error(`Error reading/parsing file ${file}:`, err);
					return null;
				}
			}).filter(Boolean); // Remove null entries

			// Sort scores and get top 5
			const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);

			// Construct leaderboard embed
			const leaderboardEmbed = new EmbedBuilder()
				.setColor(0x003253)
				.setTitle('Leaderboard')
				.setDescription('Top 5 players');

			// Add players to embed
			sortedScores.forEach((player, index) => {
				const position = ['1st', '2nd', '3rd', '4th', '5th'][index];
				leaderboardEmbed.addFields({
					name: position,
					value: `Name: <@${player.id}> Score: ${player.score}`,
					inline: false,
				});
			});

			// Reply with the embed
			await interaction.reply({ embeds: [leaderboardEmbed] });
		} catch (error) {
			console.error('Error executing leaderboard command:', error);
			await interaction.reply({ content: 'An error occurred while generating the leaderboard.', ephemeral: true });
		}
	},
};
