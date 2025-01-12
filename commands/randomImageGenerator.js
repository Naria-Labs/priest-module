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


		const start = '0x';
		//random from 0 to FF for each color


		const randomColorA = Math.floor(Math.random() * 255);
		const colorToHexA = randomColorA.toString(16);
        const capitalA = colorToHexA.toUpperCase();
		const randomColorB = Math.floor(Math.random() * 255);
		const colorToHexB = randomColorB.toString(16);
		const capitalB = colorToHexB.toUpperCase();
		const randomColorC = Math.floor(Math.random() * 255);
		const colorToHexC = randomColorC.toString(16);
		const capitalC = colorToHexC.toUpperCase();
        const Color = start + capitalA + capitalB + capitalC;

		const Embed = new EmbedBuilder()
			.setColor(`${Color}`)
		const Embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Random Image ${horny}`)
			.setImage(image)
			.setTimestamp()
			.setFooter({ text: `Powered api.waifu.pics || ${tags}`});

		await interaction.reply({ embeds: [Embed]});
	},
};