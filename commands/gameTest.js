const { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/test.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startgame')
        .setDescription('Starts the game')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Set the board size')
                .setMinValue(3)
                .setMaxValue(8)
        ),

    async execute(interaction) {
        const author = interaction.member;
        const boardSize = interaction.options.getInteger('number');
        let Board = Array.from({ length: boardSize }, () => Array(boardSize).fill('<:space:1315336436987203716>'));

        let playerX = Math.floor(Math.random() * (boardSize-1));
        let playerY = Math.floor(Math.random() * (boardSize-1));

        let pointX = Math.floor(Math.random() * boardSize);
        let pointY = Math.floor(Math.random() * boardSize);

        Board[pointX][pointY] = '<:yippee:1314224420566339615>';
        Board[playerX][playerY] = '<:trolldespair:1314248186352763003>';

        let scoreValue = 0;

        const getBoardString = () => Board.map(row => row.join('')).join('\n');
        const updateScoreButton = () => score.setLabel(`Score: ${scoreValue}`);

        const left = new ButtonBuilder()
            .setCustomId('left')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅');

        const up = new ButtonBuilder()
            .setCustomId('up')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬆');

        const down = new ButtonBuilder()
            .setCustomId('down')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬇️');

        const right = new ButtonBuilder()
            .setCustomId('right')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️');

        const score = new ButtonBuilder()
            .setCustomId('score')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Score: 0')
            .setDisabled(true);

        const row = new ActionRowBuilder()
            .addComponents(left, up, down, right, score);

        await interaction.reply({
            content: getBoardString(),
            components: [row],
        });

        const updateButtons = () => {
            left.setDisabled(playerY === 0);
            up.setDisabled(playerX === 0);
            down.setDisabled(playerX === boardSize - 1);
            right.setDisabled(playerY === boardSize - 1);
        };

        const checkPosition = () => {
            if (playerX === pointX && playerY === pointY) {
                do {
                    pointX = Math.floor(Math.random() * boardSize);
                    pointY = Math.floor(Math.random() * boardSize);
                } while (pointX === playerX && pointY === playerY);
                scoreValue++;
            }
        };

        const collector = interaction.channel.createMessageComponentCollector({ time: 60001 });
        //where the game is starting
        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: 'This game is not for you!', ephemeral: true });
            }
            updateButtons();
            checkPosition();

            Board[playerX][playerY] = '<:space:1315336436987203716>';

            switch (buttonInteraction.customId) {
                case 'left':
                    if (playerY > 0) playerY--;
                    break;
                case 'up':
                    if (playerX > 0) playerX--;
                    break;
                case 'down':
                    if (playerX < boardSize - 1) playerX++;
                    break;
                case 'right':
                    if (playerY < boardSize - 1) playerY++;
                    break;
                default:
                    break;
            }

            checkPosition();

            Board[playerX][playerY] = '<:trolldespair:1314248186352763003>';
            Board[pointX][pointY] = '<:yippee:1314224420566339615>';

            updateScoreButton();
            updateButtons();

            await buttonInteraction.update({
                content: getBoardString(),
                components: [row],
            });
        });

        collector.on('end', () => {
            left.setDisabled(true);
            up.setDisabled(true);
            down.setDisabled(true);
            right.setDisabled(true);

            interaction.editReply({
                content: 'Game over!',
                components: [row],
            });

            function addOrUpdateScore(userId, scoreValue) {
                const db = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }
                    console.log('Connected to the test database.');
                });

                db.serialize(() => {
                    db.run('CREATE TABLE IF NOT EXISTS users (Uid INTEGER PRIMARY KEY, discord_id_user TEXT UNIQUE, scores INTEGER)', (err) => {
                        if (err) {
                            console.error(err.message);
                        }
                    });

                    db.get('SELECT scores FROM users WHERE discord_id_user = ?', [userId], (err, row) => {
                        if (err) {
                            console.error(err.message);
                        } else if (row) {
                            const newScore = Math.max(row.scores, scoreValue);
                            db.run('UPDATE users SET scores = ? WHERE discord_id_user = ?', [newScore, userId], (err) => {
                                if (err) {
                                    console.error(err.message);
                                }
                            });
                        } else {
                            db.run('INSERT INTO users (discord_id_user, scores) VALUES (?, ?)', [userId, scoreValue], (err) => {
                                if (err) {
                                    console.error(err.message);
                                }
                            });
                        }
                    });
                });

                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Close the database connection.');
                });
            }

            //update the database
            addOrUpdateScore(interaction.user.id, scoreValue);
        });
    },
};
