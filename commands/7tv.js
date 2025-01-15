const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7tv')
        .setDescription('Search for 7tv emotes')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of emotes to search for')
                .setRequired(true)
                .addChoices(
                    { name: 'Top', value: 'top' },
                    { name: 'Trending', value: 'trending' },
                    { name: 'New', value: 'new' }
                )
        ),

    async execute(interaction) {
        const type = interaction.options.getString('type');

        await interaction.deferReply();

        const fetchEmotes = async (type) => {
            try {
                let url;
                switch (type) {
                    case 'top':
                        url = 'https://7tv.app/emotes/top';
                        break;
                    case 'trending':
                        url = 'https://7tv.app/emotes/trending';
                        break;
                    case 'new':
                        url = 'https://7tv.app/emotes/new';
                        break;
                    default:
                        return null;
                }

                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                const emotes = [];

                $('div.emotes.svelte-j3jjv6.scrollable-on-desktop a').each((i, element) => {
                    if (i >= 10) return false; // Limit to 10 emotes
                    const emoteUrl = `https://7tv.app${$(element).attr('href')}`;
                    const emoteName = $(element).find('div.emote-name').text();
                    const emoteImage = $(element).find('img.svelte-1d7o56f').attr('src');
                    emotes.push({ name: emoteName, url: emoteUrl, image: emoteImage });
                });

                return emotes;
            } catch (error) {
                console.error('Error fetching emotes:', error);
                return null;
            }
        };

        const emotes = await fetchEmotes(type);

        if (!emotes || emotes.length === 0) {
            await interaction.editReply('No emotes found for the selected type.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`7tv Emotes - ${type.charAt(0).toUpperCase() + type.slice(1)}`)
            .setTimestamp()
            .setFooter({ text: `Type: ${type}` });

        emotes.forEach(emote => {
            embed.addFields({ name: emote.name, value: `[Link](${emote.url})`, inline: true });
        });

        embed.setImage(emotes[0].image);

        await interaction.editReply({ embeds: [embed] });
    },
};


