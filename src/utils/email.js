import nodemailer from 'nodemailer'
import { htmlTemplate } from './htmlTemplate.js';

export const sendEmail = async (email,token)=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
          user: "abdow8896@gmail.com",
          pass: "ajetimkguxezvxyr",
        },
      });

      const info = await transporter.sendMail({
        from: '"CARMATE" <abdow8896@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "verify your email", // Subject line
        text: "please verify your account", // plain text body
        html: htmlTemplate(token), // html body
      });
}