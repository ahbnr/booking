import { ConnectionOptions as TLSOptions } from 'tls';

interface EtheralConfig {
  kind: 'etheral';
}

export interface SMTPConfig {
  kind: 'smtp';
  address: string;
  host: string;
  port: number;
  secure: boolean; // For STARTTLS, set secure to false and requireTLS to true
  requireTLS?: boolean;
  tlsOptions?: TLSOptions;
  user: string;
  password: string;
}

interface BackendConfigI {
  mailService: EtheralConfig | SMTPConfig;
  organization: string;
  sendConfirmationMail: boolean;
}

const BackendConfig: BackendConfigI = {
  mailService: {
    kind: 'etheral',
  },
  organization: 'Your Organization',
  // DEBUG OPTION: Do not send mails that prompt users to confirm their bookings if false.
  // Also, bookings will be verified automatically if set to false
  sendConfirmationMail: true,
};

export default BackendConfig;
