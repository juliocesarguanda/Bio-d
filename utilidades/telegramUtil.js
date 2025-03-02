async function sendMessage(message) {
    try {
        const fetch = (await import('node-fetch')).default;

        const token = '7623090655:AAE0U1B6QjM0Pnho72pxlL8qjfF4rfw4Ixk'; // Reemplaza con tu token
        const chatId = '6391695542'; // Reemplaza con tu ID de chat o el ID del usuario
        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Telegram API error: ${data.description}`);
        }

    } catch (error) {
        if (error.type === 'system' && error.code === 'ENOTFOUND') {
            console.error('Error de conexión: No se pudo conectar a Internet.');
        } else {
            console.error('Error:', error.message);
        }
    }
}

module.exports = {
    sendMessage
};




// const { sendMessage } = require('./telegramUtil');

// // Ejemplo de uso:
// sendMessage('¡Hola desde Telegram!').catch(console.error);
