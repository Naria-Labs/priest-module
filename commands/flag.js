const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { countries } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flag')
        .setDescription('Get the flag image and name of a country')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('The name of the country')
                .setRequired(true)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cheating')
                .setDescription('Search of the tags that are in the image generator')
                .addStringOption(option =>
                    option.setName('tags')
                        .setDescription('cheating')
                        .addChoices(...Object.keys(countries).map(name => ({ name, value: name })))
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false);
        const country = subcommand === 'cheating' ? interaction.options.getString('tags') : interaction.options.getString('country');

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


