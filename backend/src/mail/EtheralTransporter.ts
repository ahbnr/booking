import { MailTransporter } from './MailTransporter';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { singleton } from 'tsyringe';
import { boundClass } from 'autobind-decorator';

@singleton()
@boundClass
export default class EtheralTransporter implements MailTransporter {
  private _mailer?: Mail;
  private async getMailer(): Promise<Mail> {
    if (this._mailer == null) {
      const testAccount = await nodemailer.createTestAccount();

      this._mailer = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    return this._mailer;
  }

  async send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<SentMessageInfo> {
    const mailer = await this.getMailer();

    const sendInfo = await mailer.sendMail({
      from: '"booking@example.com" <booking@example.com>', // sender address
      to: receiverMail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    // Mail preview:
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(sendInfo));

    return sendInfo;
  }
}
