const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('att')
        .setDescription('Get yourself a name of the food you posted')
        .addAttachmentOption((attachment) =>
            attachment
                .setName('image')
                .setDescription('The image of the food you want to know the name')
                .setRequired(true)
        ),
    async execute(interaction) {
        const attachment = interaction.options.getAttachment('image');
        const user = interaction.user;
        const reply = `You posted a file with the name: ${attachment.name}`;
        const typeAttachment = attachment.contentType;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('File that you sent')
            .setDescription(reply)
            .setTimestamp()
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() });

        if (typeAttachment && typeAttachment.startsWith('image')) {
            embed.setImage(attachment.url);
        } else {
            embed.addFields({ name: 'Note', value: 'The file you sent is not an image so I cant display it :c .' });
        }

        await user.send({ embeds: [embed] });
        await interaction.reply({ content: 'I have sent you a DM with the details!', ephemeral: true });
    },
};
