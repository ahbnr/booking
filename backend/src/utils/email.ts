import nodemailer from 'nodemailer';

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

  // FIXME: this object is reusable, we should cache it somewhere
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail
  const info = await transporter.sendMail({
    from: '"booking@example.com" <booking@example.com>', // sender address
    to: receiverMail,
    subject: subject,
    html: htmlContent,
    text: textContent,
  });

  // Mail preview:
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
