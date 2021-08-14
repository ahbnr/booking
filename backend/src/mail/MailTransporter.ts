import { SentMessageInfo } from 'nodemailer';
import { container } from 'tsyringe';
import EtheralTransporter from './EtheralTransporter';
import BackendConfig from '../booking-backend.config';
import SMTPTransporter from './SMTPTransporter';
import assertNever from '../utils/assertNever';

export interface MailTransporter {
  send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<SentMessageInfo>;
}

export function initMailTransporter() {
  switch (BackendConfig.mailService.kind) {
    case 'etheral':
      container.register('MailTransporter', { useClass: EtheralTransporter });
      break;
    case 'smtp':
      container.register('MailTransporter', {
        useValue: new SMTPTransporter(BackendConfig.mailService),
      });
      break;
    default:
      assertNever();
  }
}
