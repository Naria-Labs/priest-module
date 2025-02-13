const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { admins } = require('./discordCommands');

const options = [
    { name: 'Fetch me', value: 'Fetch' },
    { name: 'Fetch all', value: 'Fetch all'},
];
//sqlite3 test.db btw for the future dummy
const dbPath = path.resolve(__dirname, '../db/test.db');
const dbDir = path.dirname(dbPath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('db')
        .setDescription('Check the DB')
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Choose the operation')
                .addChoices(...options)
                .setRequired(true)
        ),

    async execute(interaction) {
        const userID = interaction.user.id;
        if (!admins.includes(userID)) {
            return interaction.reply({
                content: `You don't have permission to use this command.`,
                ephemeral: true,
            });
        }
        const getOptions = interaction.options.getString('options');
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the test database.');
        });

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS users (Uid INTEGER PRIMARY KEY, discord_id_user TEXT UNIQUE, test TEXT)');

            if (getOptions === 'Fetch') {
                db.all('SELECT * FROM users WHERE discord_id_user = ?', [interaction.user.id], (err, rows) => {
                    if (err) {
                        console.error(err.message);
                if (getOptions === 'Fetch all') {
                db.all('SELECT * FROM users', (err, rows) => {
                    if (err) {
                        console.error(err.message);
                    }
                    if (rows.length > 0) {
                        const data = rows.map(row => {
                            return Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ');
                        }).join('\n');
                        interaction.reply({ content: `Data in the database:\n${data}`, ephemeral: true });
                    } else {
                        interaction.reply({ content: 'No data found in the database.', ephemeral: true });
                    }
                });
            }
        });

        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    },
};

