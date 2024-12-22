const { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pvlist')
		.setDescription('Get yourself a private list only for yourself'),

	async execute(interaction) {
		const userId = interaction.user.id;
		const messageFile = `./messages/${userId}.json`;

		const addOrUpdateMessage = (message) => {
			const messageData = { message };
			fs.mkdirSync('./messages', { recursive: true });
			fs.writeFileSync(messageFile, JSON.stringify(messageData, null, 4));
		};

		const getMessage = () => {
			if (fs.existsSync(messageFile)) {
				const data = fs.readFileSync(messageFile, 'utf8');
				const messageData = JSON.parse(data);
				return messageData.message;
			}
			return null;
		};

		const deleteMessage = () => {
			if (fs.existsSync(messageFile)) {
				fs.unlinkSync(messageFile);
			}
		};

		// Create buttons
		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('show').setLabel('Show').setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId('create').setLabel('Create').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('update').setLabel('Update').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
		);

		await interaction.reply({ content: 'Choose an action:', components: [buttons] });

		// Collect button interactions
		const collector = interaction.channel.createMessageComponentCollector({ time: 30000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== userId) {
				await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
				return;
			}

			switch (i.customId) {
				case 'create':
					await i.reply('Send me the message you want to create:');
					const createCollector = interaction.channel.createMessageCollector({ filter: m => m.author.id === userId, max: 1, time: 15000 });
					createCollector.on('collect', (m) => {
						addOrUpdateMessage(m.content);
						m.reply('Message saved successfully!');
					});
					break;

				case 'delete':
					deleteMessage();
					await i.reply('Message deleted successfully!');
					break;

				case 'update':
					await i.reply('Send me the updated message:');
					const updateCollector = interaction.channel.createMessageCollector({ filter: m => m.author.id === userId, max: 1, time: 15000 });
					updateCollector.on('collect', (m) => {
						addOrUpdateMessage(m.content);
						m.reply('Message updated successfully!');
					});
					break;

				case 'show':
					const message = getMessage();
					await i.reply(message ? `Your message: "${message}"` : 'No message found.');
					break;

				default:
					await i.reply('Invalid action.');
			}
		});

		collector.on('end', () => {
			interaction.editReply({ content: 'Interaction ended.', components: [] });
		});
	},
};
