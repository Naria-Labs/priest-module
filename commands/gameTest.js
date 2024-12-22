const { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startgame')
        .setDescription('Starts the game')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Set the board size')
                .setMinValue(1)
                .setMaxValue(8)
        ),

    async execute(interaction) {
        const author = interaction.member;
        const boardSize = interaction.options.getInteger('number');
        let Board = Array.from({ length: boardSize }, () => Array(boardSize).fill('<:space:1315336436987203716>'));

        let playerX = Math.floor(Math.random() * boardSize);
        let playerY = Math.floor(Math.random() * boardSize);

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

        const collector = interaction.channel.createMessageComponentCollector({ time: 60001 });

        const checkPosition = () => {
            if (playerX === pointX && playerY === pointY) {
                pointX = Math.floor(Math.random() * boardSize);
                pointY = Math.floor(Math.random() * boardSize);
                scoreValue++;
            }
        };
        const updateButtons = () => {
            left.setDisabled(playerY === 0);
            up.setDisabled(playerX === 0);
            down.setDisabled(playerX === boardSize - 1);
            right.setDisabled(playerY === boardSize - 1);
        };

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: 'This game is not for you!', ephemeral: true });
            }

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


            //scoreValue++; //change it later for a a smth that is not incrementing the score every time you move
            checkPosition();
            updateScoreButton();
            updateButtons();

            Board[playerX][playerY] = '<:trolldespair:1314248186352763003>';
            Board[pointX][pointY] = '<:yippee:1314224420566339615>';

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

            
            const fs = require('fs');

            function addOrUpdateScore(userId, scoreValue) {
                const scoreFile = `./scores/${userId}.json`;

                //check if the file exists
                if (fs.existsSync(scoreFile)) {
                    //if it exists, read the file
                    fs.readFile(scoreFile, 'utf8', (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        //parse the data
                        const scoreData = JSON.parse(data);
                        //update the score
                        //e.g. scoreData.score = 91 scoreValue = 100
                        (scoreValue >= scoreData.score) ? scoreData.score = scoreValue : scoreData.score = scoreData.score;
                        //write the updated score to the file
                        fs.writeFile(scoreFile, JSON.stringify(scoreData, null, 4), (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    });
                } else {
                    //if the file does not exist, create a new file and directory
                    fs.mkdir('./scores', { recursive: true }, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        //create a new score object
                        const scoreData = {
                            score: scoreValue,
                        };
                        //write the score object to the file
                        fs.writeFile(scoreFile, JSON.stringify(scoreData, null, 4), (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    });
                }
               
            }

            //update the file
            addOrUpdateScore(interaction.user.id, scoreValue);

        });
    },
};