const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mmessage')
        .setDescription('Make your message more fun or cringe')
        .addStringOption(option =>
            option.setName('emote')
                .setDescription('text to emotes')),

    async execute(interaction) {
        const emote = interaction.options.getString('emote');
        const str = emote.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        const str1 = str.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
        const str2 = str1.replace(/[[:alnum:]]+/g, "");

        const textArray = str2.split('').map(char => {
            switch (char) {
                case ' ':
                    return '<:space:1315336436987203716>';
                case '1':
                    return ':one:';
                case '2':
                    return ':two:';
                case '3':
                    return ':three:';
                case '4':
                    return ':four:';
                case '5':
                    return ':five:';
                case '6':
                    return ':six:';
                case '7':
                    return ':seven:';
                case '8':
                    return ':eight:';
                case '9':
                    return ':nine:';
                case '0':
                    return ':zero:';
                default:
                    return `:regional_indicator_${char}:`;
            }
        });

        const chunkSize = 2000;
        const messages = [];
        let currentMessage = "";
        let currentLength = 0;

        textArray.forEach(emoji => {
            const emojiLength = emoji.length;

            if (currentLength + emojiLength > chunkSize) {
                if (currentMessage.endsWith('<:space:1315336436987203716>')) {
                    messages.push(currentMessage);
                    currentMessage = emoji;
                    currentLength = emojiLength;
                } else {
                    const lastSpaceIndex = currentMessage.lastIndexOf('<:space:1315336436987203716>');
                    if (lastSpaceIndex !== -1) {
                        const partToSend = currentMessage.slice(0, lastSpaceIndex + '<:space:1315336436987203716>'.length);
                        const leftover = currentMessage.slice(lastSpaceIndex + '<:space:1315336436987203716>'.length);

                        messages.push(partToSend);
                        currentMessage = leftover + emoji;
                        currentLength = leftover.length + emojiLength;
                    } else {
                        messages.push(currentMessage);
                        currentMessage = emoji;
                        currentLength = emojiLength;
                    }
                }
            } else {
                currentMessage += emoji;
                currentLength += emojiLength;
            }
        });

        if (currentMessage.length > 0) {
            messages.push(currentMessage);
        }

        await interaction.deferReply({ ephemeral: true });
        for (const message of messages) {
            await interaction.channel.send(message);
        }
    },
};
