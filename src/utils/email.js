import nodemailer from 'nodemailer'
import { htmlTemplate, htmlTemplateOTP } from './htmlTemplate.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(path.resolve('./config/.env'));

export const sendEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
    });

    return await transporter.sendMail({
      from: '"CARMATE" <abdow8896@gmail.com>',
      to: email,
      subject: "Verify your email",
      html: htmlTemplate(token),
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};



export const sendCustomerSupportEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CARMATE SUPPORT" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Customer support email failed:', error);
    throw new Error('Failed to send customer support email');
  }
};

export const sendEmailForgetPassword = async ({ to = '', subject = '', html = '' }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdow8896@gmail.com",
      pass: "ajetimkguxezvxyr",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"CARMATE" <abdow8896@gmail.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // Use the html parameter passed to the function
  });

  return info;
}