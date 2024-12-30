const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('4chan')
        .setDescription('See the pictures from 4chan/b'),

    async execute(interaction) {
        const fetchImage = async () => {
            try {
                // Fetch the page content
                const response = await axios.get('https://boards.4chan.org/b/');
                const $ = cheerio.load(response.data);
                const images = [];

                // Extract image links
                $('img').each((i, element) => {
                    const imgSrc = $(element).attr('src');
                    if (imgSrc && imgSrc.startsWith('//i.4cdn.org')) {
                        images.push(`https:${imgSrc}`);
                    }
                });

                // Return a random image
                return images.length > 0 ? images[Math.floor(Math.random() * images.length)] : null;
            } catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        };

        const imageUrl = await fetchImage();
        if (!imageUrl) {
            await interaction.reply('Failed to fetch image from 4chan.');
            return;
        }

        // Create the refresh button
        const refreshButton = new ButtonBuilder()
            .setLabel('Refresh')
            .setStyle('PRIMARY') // Use ButtonStyle.Primary in Discord.js v14+
            .setCustomId('refresh')
            .setEmoji('🔄');

        const row = new ActionRowBuilder().addComponents(refreshButton);

        // Create and send the embed
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Random 4chan Image')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: `Source: 4chan` });

        await interaction.reply({ embeds: [embed], components: [row] });

        // Create a collector to handle button interaction
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (btnInt) => btnInt.customId === 'refresh' && btnInt.user.id === interaction.user.id,
            time: 60000, // 1 minute
        });

        collector.on('collect', async (buttonInteraction) => {
            const newImageUrl = await fetchImage();
            if (!newImageUrl) {
                await buttonInteraction.reply({ content: 'Failed to fetch image from 4chan.', ephemeral: true });
                return;
            }

            const newEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Random 4chan Image')
                .setImage(newImageUrl)
                .setTimestamp()
                .setFooter({ text: `Source: 4chan` });

            await buttonInteraction.update({ embeds: [newEmbed] });
        });

        collector.on('end', () => {
            refreshButton.setDisabled(true); // Disable the button when the collector ends
            interaction.editReply({ components: [row] });
        });
    },
};
