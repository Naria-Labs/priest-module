const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const { InteractionContextType } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

const groupDescriptions = {
	'sfw': 'SFW Images',
	'nsfw': 'NSFW Images',
}

const tagsOptionDescriptions = {
	'sfw': 'Search of the tags that are in the image generator (all are SFW)',
	'nsfw': 'Search of the tags that are in the image generator (all are NSFW)',
}

//for future reference when I would understand how to get the function out of the file 
const discordColors = [
	{ name: 'Default', value: '#000000' },
	{ name: 'Aqua', value: '#1ABC9C' },
	{ name: 'DarkAqua', value: '#11806A' },
	{ name: 'Green', value: '#57F287' },
	{ name: 'DarkGreen', value: '#1F8B4C' },
	{ name: 'Blue', value: '#3498DB' },
	{ name: 'DarkBlue', value: '#206694' },
	{ name: 'Purple', value: '#9B59B6' },
	{ name: 'DarkPurple', value: '#71368A' },
	{ name: 'LuminousVividPink', value: '#E91E63' },
	{ name: 'DarkVividPink', value: '#AD1457' },
	{ name: 'Gold', value: '#F1C40F' },
	{ name: 'DarkGold', value: '#C27C0E' },
	{ name: 'Orange', value: '#E67E22' },
	{ name: 'DarkOrange', value: '#A84300' },
	{ name: 'Red', value: '#ED4245' },
	{ name: 'DarkRed', value: '#992D22' },
	{ name: 'Grey', value: '#95A5A6' },
	{ name: 'DarkGrey', value: '#979C9F' },
	{ name: 'DarkerGrey', value: '#7F8C8D' },
	{ name: 'LightGrey', value: '#BCC0C0' },
	{ name: 'Navy', value: '#34495E' },
	{ name: 'DarkNavy', value: '#2C3E50' },
	{ name: 'Yellow', value: '#FFFF00' },
];


const tagsOptionChoices = {
	'sfw': [
		{ name: 'waifu', value: 'waifu' },
		{ name: 'neko', value: 'neko' },
		{ name: 'dance', value: 'dance' },
		{ name: 'wink', value: 'wink' },
		{ name: 'shinobu', value: 'shinobu' },
		{ name: 'megumin', value: 'megumin' },
		{ name: 'bully', value: 'bully' },
		{ name: 'cuddle', value: 'cuddle' },
		{ name: 'cry', value: 'cry' },
		{ name: 'awoo', value: 'awoo' },
		{ name: 'kiss', value: 'kiss' },
		{ name: 'lick', value: 'lick' },
		{ name: 'pat', value: 'pat' },
		{ name: 'smug', value: 'smug' },
		{ name: 'bonk', value: 'bonk' },
		{ name: 'yeet', value: 'yeet' },
		{ name: 'glomp', value: 'glomp' },
		{ name: 'slap', value: 'slap' },
	],
	'nsfw': [
		{ name: 'waifu', value: 'waifu' },
		{ name: 'neko', value: 'neko' },
		{ name: 'trap', value: 'trap' },
		{ name: 'bj', value: 'blowjob' },
	]
}

function makeSubgroup(name) {
return (group) => 
	group
		.setName(name)
		.setDescription(groupDescriptions[name])
		.addSubcommand((subcommand) =>
			subcommand
				.setName('tags')
				.setDescription('Search of the tags that are in the image generator')
				.addStringOption(option =>
					option.setName('tags')
						.setDescription(tagsOptionDescriptions[name])
						.addChoices(tagsOptionChoices[name])
				.setRequired(true)
			)
		)
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rimage') //everything with small letter
		.setDescription('Responds with a random waifu image')
		.addSubcommandGroup(makeSubgroup('nsfw'))
		.addSubcommandGroup(makeSubgroup('sfw')),

	async execute(interaction) {
        const horny = interaction.options.getSubcommandGroup();
		const tags = interaction.options.getString('tags');
		const response = await fetch(`https://api.waifu.pics/${horny}/${tags}`);
		const parseData = await response.json();
		const image = parseData.url;
		//take random color from the discordColors and get hex value
        const randomColor = discordColors[Math.floor(Math.random() * (discordColors.length - 1 ))].name;

		const Embed = new EmbedBuilder()
			.setColor(`${randomColor}`)
			.setTitle(`Random Image ${horny}`)
			.setImage(image)
			.setTimestamp()
			.setFooter({ text: `Powered api.waifu.pics || ${tags}`});

		await interaction.reply({ embeds: [Embed]});
	},
};