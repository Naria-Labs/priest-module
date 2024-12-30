﻿const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('4chan')
        .setDescription('See the pictures from 4chan/b'),

    async execute(interaction) {
        await interaction.deferReply(); // Defer the interaction immediately

        const fetchImage = async () => {
            try {
                const response = await axios.get('https://boards.4chan.org/b/');
                const $ = cheerio.load(response.data);
                const images = [];

                $('img').each((i, element) => {
                    const imgSrc = $(element).attr('src');
                    if (imgSrc && imgSrc.startsWith('//i.4cdn.org')) {
                        images.push(`https:${imgSrc}`);
                    }
                });

                return images.length > 0 ? images[Math.floor(Math.random() * images.length)] : null;
            } catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        };

        const imageUrl = await fetchImage();
        const imageBig = imageUrl.replace('s.jpg', '.jpg');
        if (!imageBig) {
            await interaction.editReply('Failed to fetch image from 4chan.');
            return;
        }

        const refreshButton = new ButtonBuilder()
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('refresh')
            .setEmoji('🔄');

        const row = new ActionRowBuilder().addComponents(refreshButton);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Random 4chan Image')
            .setImage(imageBig)
            .setTimestamp()

            .setFooter({ text: `Source: 4chan #[Image](${imageBig})` });

        await interaction.editReply({ embeds: [embed], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000, // Collect interactions for 60 seconds
        });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'refresh') {
                await buttonInteraction.deferUpdate(); // Defer the interaction immediately

                const newImageUrl = await fetchImage();
                const newImageBig = newImageUrl.replace('s.jpg', '.jpg');
                if (!newImageBig) {
                    await buttonInteraction.followUp('Failed to fetch image from 4chan.');
                    return;
                }

                const newEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Random 4chan Image')
                    .setImage(newImageBig)
                    .setTimestamp()
                    .setFooter({ text: `Source: 4chan #[Image](${newImageBig})` });

                await buttonInteraction.editReply({ embeds: [newEmbed] });
            }
        });

        collector.on('end', async () => {
            refreshButton.setDisabled(true);
            await interaction.editReply({ components: [new ActionRowBuilder().addComponents(refreshButton)] });
        });
    },
};