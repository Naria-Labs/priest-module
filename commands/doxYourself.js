const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dox')
        .setDescription('Dox yourself via Discord :3'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); 

        try {
            //Ip variables
            const response = await axios.get('http://ip-api.com/json/');
            const { city, regionName, country, lat, lon, isp } = response.data;
            const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

            //Geting the data
            const initialEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Dox Yourself')
                .setDescription(
                    `Click the [link](http://ip-api.com/json/) to view your raw location data or proceed below for a mapped view.`
                );

            await interaction.editReply({ embeds: [initialEmbed] });

            //Google maps link
            const locationEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Your Location Data')
                .addFields(
                    { name: 'City', value: city || 'Unknown', inline: true },
                    { name: 'Region', value: regionName || 'Unknown', inline: true },
                    { name: 'Country', value: country || 'Unknown', inline: true },
                    { name: 'ISP', value: isp || 'Unknown', inline: true },
                    { name: 'Latitude', value: `${lat}`, inline: true },
                    { name: 'Longitude', value: `${lon}`, inline: true }
                )
                .setDescription(`[View on Google Maps](${googleMapsLink})`)
                .setFooter({ text: 'Location data powered by Google, that knows everything about you.' });

            await interaction.followUp({ embeds: [locationEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching location data:', error);

            //Error
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Error')
                .setDescription('Unable to fetch location data. Please try again later.');

            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
