import { MailTransporter } from './MailTransporter';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { singleton } from 'tsyringe';
import { boundClass } from 'autobind-decorator';
import BackendConfig, { SMTPConfig } from '../booking-backend.config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@singleton()
@boundClass
export default class SMTPTransporter implements MailTransporter {
  constructor(private smtpConfig: SMTPConfig) {}

  private _mailer?: Mail;
  private async getMailer(): Promise<Mail> {
    if (this._mailer == null) {
      const transportOptions: SMTPTransport.Options = {
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        requireTLS: this.smtpConfig.requireTLS,
        secure: this.smtpConfig.secure,
        tls: this.smtpConfig.tlsOptions,
        auth: {
          user: this.smtpConfig.user,
          pass: this.smtpConfig.password,
        },
      };

      this._mailer = nodemailer.createTransport(transportOptions);
    }

    return this._mailer;
  }

  async send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<unknown> {
    const mailer = await this.getMailer();

    const sendInfo = await mailer.sendMail({
      from: `"Buchungsservice ${BackendConfig.organization}" <${this.smtpConfig.address}>`,
      to: receiverMail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    return sendInfo;
  }
}
