import { SentMessageInfo } from 'nodemailer';
import { container } from 'tsyringe';
import EtheralTransporter from './EtheralTransporter';

export interface MailTransporter {
  send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<SentMessageInfo>;
}

export function initMailTransporter() {
  container.register('MailTransporter', {
    useClass: EtheralTransporter,
  });
}
