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

function isValid(matrix, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (matrix[row][x] === num || matrix[x][col] === num) {
            return false;
        }
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (matrix[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }

    return true;
}

function fillSudoku(matrix) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (matrix[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(matrix, row, col, num)) {
                        matrix[row][col] = num;
                        if (fillSudoku(matrix)) {
                            return true;
                        }
                        matrix[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function deleteNumbers(matrix, level) {
    const numbersToDelete = level === 'easy' ? 22 : level === 'medium' ? 44 : level === 'hard' ? 55 : 66;
    for (let i = 0; i < numbersToDelete; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        matrix[row][col] = 0;
    }
    return matrix;
}
//add "|"every 3 numbers in the sudoku matrix and - every 3 rows
function formatSudoku(matrix) {
    return matrix.map((row, index) => {
        const formattedRow = row.join(' ');
        if ((index + 1) % 3 === 0 && index !== 8) {
            return `${formattedRow}\n- - - - - - - -\n`;
        }
        return formattedRow;
    }).join('\n');
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

        fillSudoku(matrixSudoku);
        const finalSudoku = deleteNumbers(matrixSudoku, difficultyGroup);
        const formattedSudoku = formatSudoku(finalSudoku);
        await interaction.reply({ content: `You have selected ${difficulty[difficultyGroup]} with ${difficultyLevel} level`, ephemeral: true });
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`Sudoku ${difficulty[difficultyGroup]} ${difficultyLevel}`)
            .setDescription('Sudoku game')
            .addFields(
                { name: 'Sudoku', value: `\`\`\`${formattedSudoku.map(row => row.join(' ')).join('\n')}\`\`\`` },
            )
            .setTimestamp()
            .setFooter({ text: `Powered by hopes and dreams` });

        await interaction.followUp({ embeds: [embed] });
    },
};
