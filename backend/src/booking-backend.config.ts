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

export interface SendGridConfig {
  kind: 'sendgrid';
  address: string;
  apikey: string;
}

interface BackendConfigI {
  mailService: EtheralConfig | SMTPConfig | SendGridConfig;
  organization: string;
  mailFooterHtml?: string;
  mailFooterText?: string;
}

const BackendConfig: BackendConfigI = {
  mailService: {
    kind: 'etheral',
  },
  organization: 'Your Organization',
};

export default BackendConfig;
