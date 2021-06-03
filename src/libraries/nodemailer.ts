import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import User from '../entities/User';

const emailTransporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Example',
    link: 'https://Example.com/',
  },
});

const sendConfirmationEmail = async (user: User) => {
  const email = {
    body: {
      title: 'Hello!',
      action: {
        instructions: 'Simply click the link below to confirm your email and secure your spot on the waitlist.',
        button: {
          color: '#22BC66',
          text: 'Confirm Your Email',
          link: `https://waitlist.Example.com/confirmEmail?email=${user.email}&hash=${user.hash}`,
        },
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await emailTransporter.sendMail({
    from: '"Example" <hello@Example.com>',
    to: user.email,
    subject: 'confirm your email',
    html: emailBody,
    text: emailText,
  });
};

const sendWelcomeEmail = async (user: User) => {
  const email = {
    body: {
      title: 'You\'re on the list.',
      intro: [
        'Hang tight and we will let you in soon.',
        'Want access faster? Get others to sign up using your referral code and we will bump you up the list.',
        `Referral Link: https://Example.com/?r=${user.id}`,
      ],
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await emailTransporter.sendMail({
    from: '"Example" <hello@Example.com>',
    to: user.email,
    subject: 'you\'re on the list',
    html: emailBody,
    text: emailText,
  });
};

export default emailTransporter;
export {
  sendConfirmationEmail,
  sendWelcomeEmail,
};
