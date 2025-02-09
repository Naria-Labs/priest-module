const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/test.db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Leaderboard of the top 5 players'),

	async execute(interaction) {
		const db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error(err.message);
				return interaction.reply({ content: 'An error occurred while connecting to the database.', ephemeral: true });
			}
			console.log('Connected to the test database.');
		});

		db.serialize(() => {
			db.all('SELECT discord_id_user, score FROM scores ORDER BY score DESC LIMIT 5', (err, rows) => {
				if (err) {
					console.error(err.message);
					return interaction.reply({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
				}

				// Construct leaderboard embed
				const leaderboardEmbed = new EmbedBuilder()
					.setColor(0x003253)
					.setTitle('Leaderboard')
					.setDescription('Top 5 players');

				rows.forEach((row, index) => {
					const position = ['1st', '2nd', '3rd', '4th', '5th'][index];
					leaderboardEmbed.addFields({
						name: position,
						value: `Name: <@${row.discord_id_user}> Score: ${row.score}`,
						inline: false,
					});
				});

				interaction.reply({ embeds: [leaderboardEmbed] });
			});
		});

		db.close((err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Close the database connection.');
		});
	},
};

