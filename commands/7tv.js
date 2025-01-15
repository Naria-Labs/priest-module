const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
                        url = 'https://api.7tv.app/v2/emotes/global';
                        break;
                    case 'trending':
                        url = 'https://api.7tv.app/v2/emotes/trending';
                        break;
                    case 'new':
                        url = 'https://api.7tv.app/v2/emotes/recent';
                        break;
                    default:
                        return null;
                }

                const response = await axios.get(url);
                return response.data;
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
            value: `[Link](https://7tv.app/emotes/${emote.id})`,
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
