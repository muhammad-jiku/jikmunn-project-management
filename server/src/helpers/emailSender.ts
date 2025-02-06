import nodemailer from 'nodemailer';
import config from '../config';

interface IEmailOptions {
  email: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: config.email.smtp_host,
  port: Number(config.email.smtp_port),
  secure: false,
  auth: {
    user: config.email.smtp_username,
    pass: config.email.smtp_password,
  },
});

const sendEmail = async (options: IEmailOptions): Promise<void> => {
  const emailOptions = {
    from: config.email.smtp_sender,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(emailOptions);
};

export const EmailHelper = {
  sendEmail,
};
