import { ConnectionOptions as TLSOptions } from 'tls';
import React, { ReactElement } from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

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
  mailFooterPdf?: ReactElement;
}

const pdfStyles = StyleSheet.create({
  paragraph: {
    marginBottom: '5mm',
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: '2mm',
  },
});

const BackendConfig: BackendConfigI = {
  mailService: {
    kind: 'etheral',
  },
  organization: 'Your Organization',
  mailFooterHtml: `
    <p>
      Bitte antworten Sie nicht auf diese Mail.
    </p>
  `,
  mailFooterText: `
    Bitte antworten Sie nicht auf diese E-Mail.
  `,
  mailFooterPdf: (
    <>
      <View style={pdfStyles.paragraph}>
        <Text>Bitte antworten Sie nicht auf diese E-Mail.</Text>
      </View>
    </>
  ),
};

export default BackendConfig;
