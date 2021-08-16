import { MailTransporter } from './MailTransporter';
import { singleton } from 'tsyringe';
import { boundClass } from 'autobind-decorator';
import BackendConfig, { SendGridConfig } from '../booking-backend.config';
import sgMail from '@sendgrid/mail';

@singleton()
@boundClass
export default class SendGridTransporter implements MailTransporter {
  constructor(private readonly sendGridConfig: SendGridConfig) {
    sgMail.setApiKey(sendGridConfig.apikey);
  }

  async send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<unknown> {
    const mail = {
      from: `"Buchungsservice ${BackendConfig.organization}" <${this.sendGridConfig.address}>`,
      to: receiverMail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const [result] = await sgMail.send(mail);

    return result;
  }
}
