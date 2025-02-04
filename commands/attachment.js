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
        const reply = `You posted an image with the name: ${attachment.name}`;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('File that you sended')
            .setDescription(reply)
            .setTimestamp()
            .addAttachmentOption(attachment)
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() });

        await user.send({ embeds: [embed] });
        await interaction.reply({ content: 'I have sent you a DM with the details!', ephemeral: true });
    },
};
