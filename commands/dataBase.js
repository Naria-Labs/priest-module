const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const options = [
    { name: 'Save', value: 'Save' },
    { name: 'Fetch', value: 'Fetch' },
    { name: 'Delete', value: 'Delete' },
    { name: 'Update', value: 'Update' },
    { name: 'AddColumn', value: 'AddColumn' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('db')
        .setDescription('Check the DB')
        .addStringOption(option =>
            option.setName('test')
                .setDescription('testing the database with the random text')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Choose the operation')
                .addChoices(...options)
                .setRequired(true)
        ),

    async execute(interaction) {
        const getOptions = interaction.options.getString('options');
        const userId = interaction.user.id;
        const testValue = interaction.options.getString('test');
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./db/test.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the test database.');
        });

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS users (Uid INTEGER PRIMARY KEY, discord_id_user TEXT UNIQUE, test TEXT)');

            if (getOptions === 'Save') {
                const stmt = db.prepare('INSERT OR REPLACE INTO users (discord_id_user, test) VALUES (?, ?)');
                stmt.run(userId, testValue);
                stmt.finalize();
            } else if (getOptions === 'Fetch') {
                db.get('SELECT * FROM users WHERE discord_id_user = ?', [userId], (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }
                    if (row) {
                        console.log(`Data for user ${userId}:`, row);
                    } else {
                        console.log(`No data found for user ${userId}`);
                    }
                });
            } else if (getOptions === 'AddColumn') {
                const columnName = testValue;
                db.run(`ALTER TABLE users ADD COLUMN ${columnName} TEXT`, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log(`Column ${columnName} added to the users table.`);
                });
            }
        });

        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });

        await interaction.reply({ content: `The database has been ${getOptions}d`, ephemeral: true });
    },
};
