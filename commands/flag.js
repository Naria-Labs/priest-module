const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const Canvas = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

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
            const figures = $('figure').toArray();

            for (const element of figures) {
                const figcaption = $(element).find('figcaption').text().toLowerCase();
                const imgSrc = $(element).find('img').attr('src');

                if (figcaption.includes(country)) {
                    flagFound = true;
                    const flagUrl = `https://hampusborgos.github.io/country-flags/${imgSrc}`;


                    const svgResponse = await axios.get(flagUrl, { responseType: 'text' });
                    const svgContent = svgResponse.data;
                    const canvas = Canvas.createCanvas(512, 340); 
                    const context = canvas.getContext('2d');
                    const flag = await Canvas.loadImage(flagUrl);
                    context.drawImage(flag, 0, 0, canvas.width, canvas.height);

                    // Save the PNG file temporarily
                    const filePath = path.join(__dirname, 'flag.png');
                    const buffer = canvas.toBuffer('image/png');
                    fs.writeFileSync(filePath, buffer);

                    const attachment = new AttachmentBuilder(filePath, { name: 'flag.png' });

                    const embed = new EmbedBuilder()
                        .setColor(0x003253)
                        .setTitle('Country Flag')
                        .setDescription(`**Country:** ${figcaption}`)
                        .setImage('attachment://flag.png');

                    await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: true });

                    // Filus deletus
                    fs.unlinkSync(filePath);
                    break;
                }
            }

            if (!flagFound) {
                await interaction.editReply({ content: 'Country not found. Please try again with a different name.', ephemeral: true });
            }

        } catch (error) {
            console.error('Error fetching flag information:', error);
            await interaction.editReply({ content: 'An error occurred while fetching the flag information. Please try again later.', ephemeral: true });
        }
    },
};

