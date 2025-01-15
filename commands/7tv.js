const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle } = require('discord.js');
const axios = require('axios');

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

                $('div.emote-card').each((i, element) => {
                    const emoteName = $(element).find('div.emote-name').text();
                    const emoteId = $(element).attr('data-id');
                    const emoteUrl = `https://7tv.app/emotes/${emoteId}`;
                    emotes.push({ name: emoteName, url: emoteUrl });
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

        const emoteFields = emotes.slice(0, 10).map(emote => ({
            name: emote.name,
            value: `[Link](${emote.url})`,
            inline: true,
        }));

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`7tv Emotes - ${type.charAt(0).toUpperCase() + type.slice(1)}`)
            .addFields(emoteFields)
            .setTimestamp()
            .setFooter({ text: `Type: ${type}` });

        await interaction.editReply({ embeds: [embed] });
    },
};
