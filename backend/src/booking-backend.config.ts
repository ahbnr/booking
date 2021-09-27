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
  mailFooterHtml: `
    <p>
      Bitte antworten Sie nicht auf diese E-Mail.
      Bei Fragen wenden Sie sich bitte an
      <a href="mailto:vorstand@sgi-flieden.de">vorstand@sgi-flieden.de</a>.
    </p>
    <hr />
    <b>Anfahrt</b>
    <p>
    Schützenhaus<br />
    Alte Strasse 61<br />
    36103 Flieden<br />
    </p>

    <p>
    <a href="https://goo.gl/maps/pqQuTLxVBrPfgh4k8">Google Maps</a>
    </p>

    <p>
    Telefon im Schützenhaus: <a href="tel:066552590">06655 25 90</a>
    </p>

    <p>
    Weitere Informationen können Sie unserer Website entnehmen:
    <a href="https://sgi-flieden.de">sgi-flieden.de</a>
    </p>
  `,
  mailFooterText: `
    Bitte antworten Sie nicht auf diese E-Mail. Bei Fragen wenden Sie sich bitte an vorstand@sgi-flieden.de.

    --------------------------------------

    *Anfahrt*

    Schützenhaus
    Alte Strasse 61
    36103 Flieden

    Google Maps: https://goo.gl/maps/pqQuTLxVBrPfgh4k8

    Telefon im Schützenhaus: 06655 25 90

    Weitere Informationen können Sie unserer Website entnehmen: https://sgi-flieden.de
  `,
};

export default BackendConfig;
