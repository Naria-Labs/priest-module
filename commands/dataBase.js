const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { admins } = require('./discordCommands');
const sqlite3 = require('sqlite3').verbose();

const options = [
    { name: 'Fetch me', value: 'Fetch' },
    { name: 'Fetch all', value: 'Fetch all' },
];

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
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
                return interaction.reply({
                    content: 'An error occurred while connecting to the database.',
                    ephemeral: true,
                });
            }
            console.log('Connected to the test database.');
        });

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS users (Uid INTEGER PRIMARY KEY, discord_id_user TEXT UNIQUE, test TEXT)');

            if (getOptions === 'Fetch') {
                db.all('SELECT * FROM users WHERE discord_id_user = ?', [interaction.user.id], (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        return interaction.reply({
                            content: 'An error occurred while fetching data.',
                            ephemeral: true,
                        });
                    }

                    if (rows.length > 0) {
                        const data = rows.map(row => {
                            return Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ');
                        }).join('\n');
                        interaction.reply({ content: `Your data:\n${data}`, ephemeral: true });
                    } else {
                        interaction.reply({ content: 'No data found for your account.', ephemeral: true });
                    }
                });
            } else if (getOptions === 'Fetch all') {
                db.all('SELECT * FROM users', (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        return interaction.reply({
                            content: 'An error occurred while fetching data.',
                            ephemeral: true,
                        });
                    }

                    if (rows.length > 0) {
                        const data = rows.map(row => {
                            return Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ');
                        }).join('\n');
                        interaction.reply({ content: `All data in the database:\n${data}`, ephemeral: true });
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
            console.log('Closed the database connection.');
        });
    },
};