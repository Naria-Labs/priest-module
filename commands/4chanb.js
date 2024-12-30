const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('4chan')
        .setDescription('See the pictures from 4chan/b'),

    async execute(interaction) {
        await interaction.deferReply(); //Iinteraction immediately

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
        if (!imageUrl) {
            await interaction.editReply('Failed to fetch image from 4chan.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Random 4chan Image')
            .setImage(imageUrl)
            .setTimestamp()
            .setFooter({ text: `Source: 4chan${image}` });

        await interaction.editReply({ embeds: [embed] });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 4000, //Collect interactions for 4 seconds
        });

        collector.on('end', async () => {
            refreshButton.setDisabled(true);
            await interaction.editReply({ components: [new ActionRowBuilder().addComponents(refreshButton)] });
        });
    },
};
