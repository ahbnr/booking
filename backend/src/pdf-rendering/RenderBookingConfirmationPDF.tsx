import React, { ReactElement } from 'react';
import {
  Text,
  Page,
  Document,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import TimeslotDBInterface from '../repositories/model_interfaces/TimeslotDBInterface';
import SettingsDBInterface from '../repositories/model_interfaces/SettingsDBInterface';
import { genBookingConfirmation } from '../docgen/GenBookingConfirmation';
import BackendConfig from '../booking-backend.config';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';

export default async function renderBookingConfirmationPDF(
  lookupUrl: string,
  booking: BookingDBInterface,
  timeslot: TimeslotDBInterface,
  lookupToken: string,
  settings: SettingsDBInterface
): Promise<ReactElement> {
  const styles = StyleSheet.create({
    page: {
      padding: '1cm',
      fontSize: '11pt',
    },
    title: {
      fontSize: '16pt',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '0.8cm',
    },
    timeString: {
      fontStyle: 'italic',
    },
    paragraph: {
      marginBottom: '5mm',
    },
    resourceParagraph: {
      marginLeft: '5mm',
      marginBottom: '5mm',
    },
    primaryHint: {
      fontSize: '1.5em',
      fontWeight: 'bold',
    },
  });

  const bookingConfirmationTexts = await genBookingConfirmation(
    lookupUrl,
    booking,
    timeslot,
    lookupToken,
    settings
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>{bookingConfirmationTexts.title}</Text>
        </View>
        <View>
          <View style={styles.paragraph}>
            <Text style={styles.paragraph}>
              {bookingConfirmationTexts.intro}
            </Text>
            <Text style={styles.resourceParagraph}>
              {bookingConfirmationTexts.resourceString}
            </Text>
            <Text style={styles.timeString}>
              {bookingConfirmationTexts.timeString}
            </Text>
          </View>
          <View style={styles.paragraph}>
            <View>
              <Text>{bookingConfirmationTexts.linkIntro}</Text>
            </View>
            <Link src={bookingConfirmationTexts.lookupLink}>
              {bookingConfirmationTexts.linkText}
            </Link>
            {bookingConfirmationTexts.linkPrimaryHint && (
              <View>
                <Text style={styles.primaryHint}>
                  ${bookingConfirmationTexts.linkPrimaryHint}
                </Text>
              </View>
            )}
            {bookingConfirmationTexts.linkSecondaryHint && (
              <View>
                <Text>{bookingConfirmationTexts.linkSecondaryHint}</Text>
              </View>
            )}
          </View>
          {BackendConfig.mailFooterPdf}
        </View>
      </Page>
    </Document>
  );
}
