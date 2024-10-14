const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  
  port: 587,
  secure: false,
  auth: {
    user: 'bricchi.florian13@gmail.com',
    pass: 'Florian*&21051992'
  }
});

async function sendWelcomeEmail(employeEmail, subject, text) {
    try {
      await transporter.sendMail({
        from: '"Votre Entreprise" <bricchi.florian13@gmail.com>',
        to: employeEmail,
        subject: subject,
        text: text,
        html: text.replace(/\n/g, '<br>')
      });
      console.log('Email envoyé avec succès');
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }
  }

module.exports = { sendWelcomeEmail };