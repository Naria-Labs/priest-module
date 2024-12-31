const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dox')
        .setDescription('Dox yourself via Discord :3'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Defer response

        const initialEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Dox Yourself')
            .setDescription(
                `Click the button below to fetch your location data or use the [link](http://ip-api.com/json/) to view raw data directly.`
            );

        const button = new ButtonBuilder()
            .setCustomId('fetch_location') // Unique identifier for button interaction
            .setLabel('Fetch My Location')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.editReply({ embeds: [initialEmbed], components: [row] });

        //15 sec time
        const filter = (i) => i.customId === 'fetch_location' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000,
        });

        collector.on('collect', async (buttonInteraction) => {
            await buttonInteraction.deferUpdate(); // Acknowledge button interaction

            try {
                //IP
                const response = await axios.get('http://ip-api.com/json/');
                const { city, regionName, country, lat, lon, isp } = response.data;
                const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

                // Detailed embed with location data
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

                //Error embed
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Unable to fetch location data. Please try again later.');

                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                //Button begone after the time limit
                button.setDisabled(true);
                await interaction.editReply({ components: [row] });
            }
        });
    },
};
