import React, { ReactElement } from 'react';
import { Text, Page, Document, View, StyleSheet } from '@react-pdf/renderer';
import renderResourceBookingsPDF from './RenderResourceBookingsPDF';
import { ResourceGroupedBookings } from 'common';
import { DateTime } from 'luxon';

export default function renderDayOverviewPDF(
  date: DateTime,
  resourceGroupedBookings: ResourceGroupedBookings[]
): ReactElement {
  const dateString = date
    .setLocale('de-DE')
    .toLocaleString({ ...DateTime.DATE_SHORT });
  const weekdayName = date
    .setLocale('de-DE')
    .toLocaleString({ weekday: 'long' });

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
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>
            {weekdayName} - {dateString}
          </Text>
        </View>
        {resourceGroupedBookings.map((resourceGroupedBookings, idx) =>
          renderResourceBookingsPDF(idx, resourceGroupedBookings)
        )}
      </Page>
    </Document>
  );
}
