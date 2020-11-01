import nodemailer from 'nodemailer';
import Config from '../booking_backend.config.json';

export async function sendMail(
  receiverMail: string,
  subject: string,
  textContent: string,
  htmlContent?: string
) {
  if (htmlContent == null) {
    htmlContent = textContent;
  }

  // FIXME: Replace with real SMTP server and account
  const testAccount = await nodemailer.createTestAccount();

  let transporter;
  if (Config.useEtheral) {
    // FIXME: this object is reusable, we should cache it somewhere
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      sendmail: true,
    });
  }

  const mailOptions = {
    from: '"booking@example.com" <booking@example.com>', // sender address
    to: receiverMail,
    subject: subject,
    html: htmlContent,
    text: textContent,
  };

  // send mail
  const info = await transporter.sendMail(mailOptions);

  // Mail preview:
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
