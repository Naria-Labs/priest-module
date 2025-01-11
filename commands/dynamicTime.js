const { SlashCommandBuilder } = require('discord.js');
const timespeak = require('time-speak');

const optionsTime = [
    { name: 'Short Time', value: 't' },
    { name: 'Long Time', value: 'T' },
    { name: 'Short Date', value: 'd' },
    { name: 'Long Date', value: 'D' },
    { name: 'Long Date with Short Time', value: 'f' },
    { name: 'Long Date with Day of Week and Short Time', value: 'F' },
    { name: 'Relative', value: 'R' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dyntime')
        .setDescription('Get yourself a dynamic time to copy')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('time')
                .setDescription('Get a dynamic time string')
                .addStringOption((option) =>
                    option
                        .setName('time')
                        .setDescription('Set a time')
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('timechoice')
                        .setDescription('Choose the time format')
                        .addChoices(...optionsTime)
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const time = interaction.options.getString('time');
        const timechoice = interaction.options.getString('timechoice');
        const timeParsed = Date.parse(time);

        if (isNaN(timeParsed)) {
            await interaction.reply({ content: 'Invalid time format. Please provide a valid date and time.', ephemeral: true });
            return;
        }

        const unixTime = Math.floor(timeParsed / 1000);
        const reply = `The time is <t:${unixTime}:${timechoice}>`;

        await interaction.reply({ content: reply, ephemeral: true });
    },
};
