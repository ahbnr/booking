import { container } from 'tsyringe';
import EtheralTransporter from './EtheralTransporter';
import BackendConfig from '../booking-backend.config';
import SMTPTransporter from './SMTPTransporter';
import { assertNever } from 'common';
import SendGridTransporter from './SendGridTransporter';

export interface MailTransporter {
  send(
    receiverMail: string,
    subject: string,
    textContent: string,
    htmlContent?: string
  ): Promise<unknown>;
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
    case 'sendgrid':
      container.register('MailTransporter', {
        useValue: new SendGridTransporter(BackendConfig.mailService),
      });
      break;
    default:
      assertNever();
  }
}
