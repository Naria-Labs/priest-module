const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const { virusTotalAPIKey } = require('./discordCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scanfile')
        .setDescription('Get yourself a scan from VirusTotal')
        .addAttachmentOption((attachment) =>
            attachment
                .setName('file')
                .setDescription('The image of the food you want to know the name')
                .setRequired(true)
        ),

    async execute(interaction) {
        const attachment = interaction.options.getAttachment('file');
        const user = interaction.user;
        const fileURL = attachment.url;
        const fileName = attachment.name;
        const fileType = attachment.contentType;

        await interaction.reply({ content: 'Checking API quota and rate limits...', ephemeral: true });

        try {
            //Check rate limit and quota
            const quotaResponse = await axios.get('https://www.virustotal.com/api/v3/users/me', {
                headers: { 'x-apikey': virusTotalAPIKey },
            });

            const { data } = quotaResponse;
            const rateLimitRemaining = data.data.attributes.api_requests_hourly;
            const dailyQuotaRemaining = data.data.attributes.api_requests_daily;
            const monthlyQuotaRemaining = data.data.attributes.api_requests_monthly;

            if (rateLimitRemaining < 1) {
                await interaction.editReply({ content: 'Rate limit exceeded. Please try in a minute :3.', ephemeral: true });
                return;
            }

            if (dailyQuotaRemaining < 1) {
                await interaction.editReply({ content: 'Daily quota exceeded. Please try again tomorrow :c.', ephemeral: true });
                return;
            }

            if (monthlyQuotaRemaining < 1) {
                await interaction.editReply({ content: 'Monthly quota exceeded. Please try again next month :ccccc.', ephemeral: true });
                return;
            }

            //Download the file
            const response = await axios.get(fileURL, { responseType: 'arraybuffer' });
            const fileBuffer = Buffer.from(response.data);

            //upload file to VirusTotal
            const form = new FormData();
            form.append('file', fileBuffer, fileName);

            const uploadResponse = await axios.post('https://www.virustotal.com/api/v3/files', form, {
                headers: {
                    'x-apikey': virusTotalAPIKey,
                    ...form.getHeaders(),
                },
            });

            if (!uploadResponse.data || !uploadResponse.data.data || !uploadResponse.data.data.id) {
                throw new Error('Failed to upload file to VirusTotal.');
            }

            const fileId = uploadResponse.data.data.id;
            //wait 25 seconds
            await new Promise((resolve) => setTimeout(resolve, 25000));

            //get scan results
            const scanResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${fileId}`, {
                headers: { 'x-apikey': virusTotalAPIKey },
            });

            const scanData = scanResponse.data.data.attributes.results;
            let totalScans = 0;
            let maliciousCount = 0;

            for (const scanner in scanData) {
                totalScans++;
                if (scanData[scanner].category === 'malicious') {
                    maliciousCount++;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(maliciousCount > 0 ? '#ff0000' : '#0099ff')
                .setTitle('VirusTotal Scan Report')
                .setDescription(`🔍 **File Name:** ${fileName}\n📊 **Total Scans:** ${totalScans}\n🚨 **Detections:** ${maliciousCount}`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() });

            if (fileType && fileType.startsWith('image')) {
                embed.setImage(fileURL);
            }

            if (maliciousCount = 0) {
                embed.addFields({ name: '⚠️ WARNING!', value: 'This file is **malicious**! Please do not open it.' });
            } else if(maliciousCount < 4){
                embed.addFields({ name: '✅ Safe!', value: 'No threats detected.' });
            }

            await user.send({ embeds: [embed] });
            await interaction.editReply({ content: 'Scan completed! Check your DMs for details.', ephemeral: true });

        } catch (error) {
            console.error('Error scanning file:', error);
            await interaction.editReply({ content: 'An error occurred while scanning the file. Please try again later.', ephemeral: true });
        }
    },
};
