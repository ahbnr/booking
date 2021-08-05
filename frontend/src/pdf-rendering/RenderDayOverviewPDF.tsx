import React, { ReactElement } from 'react';
import { Text, Page, Document, View, StyleSheet } from '@react-pdf/renderer';
import { ResourceGroupedBookings } from '../views/DayOverviewView';
import renderResourceBookingsPDF from './RenderResourceBookingsPDF';

export default function renderDayOverviewPDF(
  weekdayName: string,
  date: string,
  resourceGroupedBookings: ResourceGroupedBookings[]
): ReactElement {
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
            {weekdayName} - {date}
          </Text>
        </View>
        {resourceGroupedBookings.map((resourceGroupedBookings, idx) =>
          renderResourceBookingsPDF(idx, resourceGroupedBookings)
        )}
      </Page>
    </Document>
  );
}
