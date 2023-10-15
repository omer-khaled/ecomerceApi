import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    service: 'gmail',
    host:'smtp.gmail.com',
    port:587,
    secure:true,
    auth: {
      user: 'nodejsapp4@gmail.com',
      pass: 'mbhs yugt jqye ouxd',
    },
});

const sendEmail=(email,subject,message)=>{
    transport.sendMail({
        from:'nodejsapp4@gmail.com',
        to:email,
        subject:subject,
        html:message
    });
}

export default sendEmail;