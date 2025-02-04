const { SlashCommandBuilder, MessageEmbed } = require('discord.js');

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
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Attachment')
            .setDescription(reply)
            .setTimestamp()
            .setFooter(`Requested by ${user.tag}`, user.displayAvatarURL());

        await user.send({ embeds: [embed] });
        await interaction.reply({ content: 'I have sent you a DM with the details!', ephemeral: true });
    },
};
