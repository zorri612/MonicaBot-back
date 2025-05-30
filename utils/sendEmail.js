const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // tu correo
        pass: process.env.EMAIL_PASS   // contraseña de aplicación
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo enviado a', to);
  } catch (error) {
    console.error('Error enviando correo:', error);
    throw error;
  }
};

module.exports = sendEmail;
