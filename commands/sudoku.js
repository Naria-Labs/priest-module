const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const difficulty = {
    'easy': 'Easy Sudoku',
    'medium': 'Medium Sudoku',
    'hard': 'Hard Sudoku',
    'expert': 'Expert Sudoku',
};

function makeSubgroup(name) {
    return (group) =>
        group
            .setName(name)
            .setDescription(difficulty[name])
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('set')
                    .setDescription('Set the difficulty for the sudoku game')
            );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudoku')
        .setDescription('Sudoku game')
        .addSubcommandGroup(makeSubgroup('easy'))
        .addSubcommandGroup(makeSubgroup('medium'))
        .addSubcommandGroup(makeSubgroup('hard'))
        .addSubcommandGroup(makeSubgroup('expert')),

    async execute(interaction) {
        const { options } = interaction;
        const difficultyGroup = options.getSubcommandGroup();
        const difficultyLevel = options.getSubcommand();
        const matrixSudoku = Array.from({ length: 9 }, () => Array(9).fill(0));

        function shuffle(array) {
            let i = array.length,
                j = 0,
                temp;

            while (i--) {
                j = Math.floor(Math.random() * (i + 1));
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }

            return array;
        }

        const rowSudoku = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                matrixSudoku[i][j] = rowSudoku[j];
                for (let k = 0; k < j; k++) {
                    if (matrixSudoku[i][j] === matrixSudoku[i][k]) {
                        matrixSudoku[i][j] = rowSudoku[k];
                    }
                }
            }
            shuffle(rowSudoku);
        }

        function deleteNumbers(matrix, level) {
            const numbersToDelete = level === 'easy' ? 40 : level === 'medium' ? 50 : level === 'hard' ? 60 : 70;
            for (let i = 0; i < numbersToDelete; i++) {
                const row = Math.floor(Math.random() * 9);
                const col = Math.floor(Math.random() * 9);
                matrix[row][col] = 0;
            }
            return matrix;
        }

        const finalSudoku = deleteNumbers(matrixSudoku, difficultyGroup);

        await interaction.reply({ content: `You have selected ${difficulty[difficultyGroup]} with ${difficultyLevel} level`, ephemeral: true });
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`Sudoku ${difficulty[difficultyGroup]} ${difficultyLevel}`)
            .setDescription('Sudoku game')
            .addFields(
                { name: 'Sudoku', value: `\`\`\`${finalSudoku.map(row => row.join(' ')).join('\n')}\`\`\`` },
            )
            .setTimestamp()
            .setFooter({ text: `Powered by hopes and dreams` });

        await interaction.followUp({ embeds: [embed] });
    },
};
