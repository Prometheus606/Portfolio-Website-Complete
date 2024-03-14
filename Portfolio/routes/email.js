const nodemailer = require('nodemailer');


const sendEmail = (targedName, targedEmail, subject, message) => {

    let transporter
  
    // Definiere die E-Mail-Optionen
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: process.env.FROM_EMAIL,
        subject: `${targedName} wünscht Kontakt!`,
        text: `Du hast eine Nachricht über das Kontaktformular deiner Website erhalten! \n\n ${subject} \n\n ${message} \n\n Du erreichst ${targedName} über seine Email: ${targedEmail}`
     };


     try {
        // Erstelle einen Transporter mit den E-Mail-Zugangsdaten
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: process.env.FROM_EMAIL,
            pass: process.env.FROM_PASSWORD
            }
        });

    } catch {
        console.log("Fehler beim Authentifizieren.");
        return new Error()
    }
  
    // Sende die E-Mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return new Error()
        } else {
            console.log('E-Mail gesendet: ' + info.response);
        }
    });
    
}

module.exports = sendEmail