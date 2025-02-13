const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { hasGoodRole, goodRoles } = require('./discordCommands');

const dbPath = path.resolve(__dirname, '../db/test.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pvlist')
        .setDescription('Get yourself a private list only for yourself')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to add to the list or change the one that exist')
                .setRequired(false)
        ),

    async execute(interaction) {
        const text = interaction.options.getString('text');
        const textRegex = /^[a-zA-Z0-9\s]*$/;
        //checking if the user typed a text and he is not trying to sql injection
        if (text && !textRegex.test(text)) {
            return interaction.reply({ content: 'The text can only contain letters and numbers.', ephemeral: true });
        }
        const userID = interaction.user.id;
        const userMentioned = interaction.user;
        if (!hasGoodRole(interaction.member)) {
            return interaction.reply({
                content: `<@${userID}>, you can't use this ${userMentioned} because you don't have a ${goodRoles.map(role => `<@&${role}>`).join(' or ')}`,
                ephemeral: true,
            });
        }

        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
                return interaction.reply({ content: 'An error occurred while connecting to the database.', ephemeral: true });
            }
            console.log('Connected to the test database.');
        });

        if (text) {
            // If text is provided, update the user's message in the database
            db.run('UPDATE users SET message = ? WHERE discord_id_user = ?', [text, interaction.user.id], function (err) {
                if (err) {
                    console.error(err.message);
                    return interaction.reply({ content: 'An error occurred while updating the list.', ephemeral: true });
                }
                if (this.changes === 0) {
                    db.run('INSERT INTO users (discord_id_user, message) VALUES (?, ?)', [interaction.user.id, text], (err) => {
                        if (err) {
                            console.error(err.message);
                            return interaction.reply({ content: 'An error occurred while adding to the list.', ephemeral: true });
                        }
                        interaction.reply({ content: 'Your list has been updated.', ephemeral: true });
                    });
                } else {
                    interaction.reply({ content: 'Your list has been updated.', ephemeral: true });
                }
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Close the database connection.');
                });
            });
        } else {
            // If text is not provided, fetch and display the existing list
            db.all('SELECT message FROM users WHERE discord_id_user = ?', [interaction.user.id], async (err, rows) => {
                if (err) {
                    console.error(err.message);
                    await interaction.reply({ content: 'An error occurred while fetching the list.', ephemeral: true });
                    db.close();
                    return;
                }
                if (rows.length === 0) {
                    await interaction.reply({ content: 'You don\'t have a list yet. Use /text to add an item.', ephemeral: true });
                    db.close();
                    return;
                }

                const listEmbed = new EmbedBuilder()
                    .setColor(0x003253)
                    .setTitle('Your private list')
                    .setDescription('Here are the items in your list');

                rows.forEach((row, index) => {
                    let message = row.message;
                    if (message.length > 1984) {
                        message = message.slice(-1984) + '...';
                    }
                    listEmbed.addFields({
                        name: `Item ${index + 1}`,
                        value: message,
                        inline: false,
                    });
                });

                await interaction.reply({ embeds: [listEmbed], ephemeral: true });
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Close the database connection.');
                });
            });
        }
    },
};