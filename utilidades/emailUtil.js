const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
    try {
        // Crear un objeto de transporte
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'soportealdiaparati@gmail.com', // Reemplaza con tu correo de Gmail
                pass: 'oydroczgfclqtjhd' // Reemplaza con tu contraseña de aplicación
            }
        });

        // Configurar el correo
        let mailOptions = {
            from: 'soportealdiaparati@gmail.com', // Reemplaza con tu correo de Gmail
            to: to,
            subject: subject,
            text: text
        };

        // Enviar el correo
        let info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        if (error.code === 'ENOTFOUND') {
            console.error('Error de conexión: No se pudo conectar a Internet.');
        } else {
            console.error('Error al enviar el correo:', error.message);
        }
    }
}

module.exports = {
    sendEmail
};



// const { sendEmail } = require('../../utilidades/emailUtil');

// // Ejemplo de uso:
// sendEmail('juliocesarguanda@gmail.com', 'Asunto del Correo', 'Este es el contenido del correo')
//     .then(() => console.log('Correo enviado exitosamente'))
//     .catch(console.error);



