const { SlashCommandBuilder, EmbedBuilder, MessageButton, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('4chan')
        .setDescription('See the pictures from 4chan/b'),

    async execute(interaction) {
        const fetchImage = async () => {
            try {
                //getting the page
                const response = await axios.get('https://boards.4chan.org/b/');
                const $ = cheerio.load(response.data);
                const images = [];
                //getting the image from i.4cdn.org
                $('img').each((i, element) => {
                    const imgSrc = $(element).attr('src');
                    if (imgSrc && imgSrc.startsWith('//i.4cdn.org')) {
                        images.push(`https:${imgSrc}`);
                    }
                });
                return images[Math.floor(Math.random() * images.length)];
            } catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        };
        //error handling
        const imageUrl = await fetchImage();
        if (!imageUrl) {
            await interaction.reply('Failed to fetch image from 4chan.');
            return;
        }

        const refreshButton = new MessageButton()
            .setLabel('Refresh')
            .setStyle('PRIMARY')
            .setCustomId('refresh')
            //hopefully this emoji works
            .setEmoji('🔄');

        const row = new ActionRowBuilder().addComponents(refreshButton);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Random 4chan Image')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: `Source: 4chan ${imageUrl}` });

        await interaction.reply({ embeds: [embed], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'refresh') {
                const newImageUrl = await fetchImage();
                if (!newImageUrl) {
                    await buttonInteraction.reply('Failed to fetch image from 4chan.');
                    return;
                }

                const newEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Random 4chan Image')
                    .setImage(newImageUrl)
                    .setTimestamp()
                    .setFooter({ text: `Source: 4chan ${imageUrl}` });

                await buttonInteraction.update({ embeds: [newEmbed] });
            }
        });

        collector.on('end', () => {
            refreshButton.setDisabled(true);
            interaction.editReply({ components: [row] });
        });
    },
};