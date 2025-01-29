require('dotenv').config();

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

//Used .env :3 secret stuff here
const admins = [
    process.env.ADMIN1,
    process.env.ADMIN2
].filter(Boolean);

const goodRoles = [
    process.env.GOOD_ROLE1,
    process.env.GOOD_ROLE2,
    process.env.GOOD_ROLE3
].filter(Boolean);


function hasGoodRole(user) {
    return goodRoles.some(role => user.roles.cache.has(role));
}

module.exports = {
    discordColors,
    goodRoles,
    hasGoodRole,
    admins
};
