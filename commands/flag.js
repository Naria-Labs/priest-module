const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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
        const country = interaction.options.getString('country');

        await interaction.reply({ content: 'Fetching flag information...', ephemeral: true });

        try {
            // Fetch country info from REST Countries API
            const response = await axios.get(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
            const countryData = response.data[0];

            if (!countryData) {
                await interaction.editReply({ content: 'Country not found. Please try again.', ephemeral: true });
                return;
            }

            const countryName = countryData.name.common;
            const flagUrl = countryData.flags.png; // Get the flag PNG URL

            const embed = new EmbedBuilder()
                .setColor(0x003253)
                .setTitle(`Flag of ${countryName}`)
                .setImage(flagUrl)
                .setFooter({ text: `Requested by ${interaction.user.username}` });

            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Error fetching flag information:', error);
            await interaction.editReply({ content: 'An error occurred while fetching the flag. Please try again later.', ephemeral: true });
        }
    },
};
