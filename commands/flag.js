const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flag')
        .setDescription('Get the flag image and name of a country')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('The name of the country')
                .setRequired(true)
        ),

    async execute(interaction) {
        const country = interaction.options.getString('country').toLowerCase();

        await interaction.reply({ content: 'Fetching flag information...', ephemeral: true });

        try {
            const response = await axios.get('https://hampusborgos.github.io/country-flags/');
            const $ = cheerio.load(response.data);

            let flagFound = false;
            $('figure').each((index, element) => {
                const figcaption = $(element).find('figcaption').text().toLowerCase();
                const imgSrc = $(element).find('img').attr('src');

                if (figcaption.includes(country)) {
                    flagFound = true;
                    const embed = new EmbedBuilder()
                        .setColor(0x003253)
                        .setTitle('Country Flag')
                        .setDescription(`**Country:** ${figcaption}`)
                        .setImage(imgSrc);

                    interaction.editReply({ embeds: [embed], ephemeral: true });
                    return false; // Break the loop
                }
            });

            if (!flagFound) {
                interaction.editReply({ content: 'Country not found. Please try again with a different name.', ephemeral: true });
            }

        } catch (error) {
            console.error('Error fetching flag information:', error);
            interaction.editReply({ content: 'An error occurred while fetching the flag information. Please try again later.', ephemeral: true });
        }
    },
};
