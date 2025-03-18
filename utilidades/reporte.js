const { sendMessage } = require('./telegramUtil.js');

async function reportError(filePath, timestamp, message, url, requestData) {
    const errorMessage = `
        Error Report:
        - File: ${filePath}
        - Time: ${timestamp}
        - Message: ${message}
        - URL: ${url}
        - Request Data: ${JSON.stringify(requestData, null, 2)}
    `;

    try {
        await sendMessage(errorMessage);
    } catch (error) {
        console.error('Error al enviar el reporte a Telegram:', error.message);
    }
}

module.exports = {
    reportError
};
