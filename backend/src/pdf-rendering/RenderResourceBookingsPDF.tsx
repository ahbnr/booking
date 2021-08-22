import { ReactElement } from 'react';
import { StyleSheet, Text, View } from '@react-pdf/renderer';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import { DateTime } from 'luxon';
import renderHLinePDF from './RenderHLinePDF';
import React from 'react';
import {
  BookingGetInterface,
  NonEmptyString,
  ResourceGroupedBookings,
} from 'common';

export default function renderResourceBookingsPDF(
  index: number,
  resourceGroupedBookings: ResourceGroupedBookings
): ReactElement {
  const styles = StyleSheet.create({
    body: {
      padding: 10,
    },
    header: {
      paddingBottom: '5mm',
      fontSize: '14pt',
      fontWeight: 'bold',
    },
    table: {
      display: 'flex',
      paddingBottom: '1cm',
    },
    evenTableRow: {
      flexDirection: 'row',
    },
    oddTableRow: {
      flexDirection: 'row',
      backgroundColor: '#eeeeee',
    },
    tableTimeCol: {
      paddingRight: '5mm',
    },
    tableContentCol: {
      flexGrow: 1,
      paddingLeft: '5mm',
    },
    tableCell: {},
  });

  const groupedBookings: BookingsGroup[] = flow(
    groupBy((booking: BookingGetInterface) => [
      booking.startDate,
      booking.endDate,
    ]),
    map((bookingList: BookingGetInterface[]) => {
      const sampleBooking = bookingList[0];

      return {
        names: bookingList.map((booking) => booking.name),
        startDate: DateTime.fromISO(sampleBooking.startDate),
        endDate: DateTime.fromISO(sampleBooking.endDate),
        timeslotIds: [],
      };
    }),
    sortBy((bookingGroup) => bookingGroup.startDate)
  )(resourceGroupedBookings.bookings);

  return (
    <View key={index}>
      {index > 0 && renderHLinePDF('0.3mm')}
      <View style={styles.header}>
        <Text>{resourceGroupedBookings.resourceName}</Text>
      </View>
      <View style={styles.table}>
        {groupedBookings.map((bookingGroup, idx) => (
          <View
            style={idx % 2 === 0 ? styles.evenTableRow : styles.oddTableRow}
            key={bookingGroup.startDate.toISO()}
          >
            <View style={styles.tableTimeCol}>
              <Text style={styles.tableCell}>
                {bookingGroup.startDate.toLocaleString({
                  ...DateTime.TIME_24_SIMPLE,
                  locale: 'de-DE',
                })}
                {' - '}
                {bookingGroup.endDate.toLocaleString({
                  ...DateTime.TIME_24_SIMPLE,
                  locale: 'de-DE',
                })}
              </Text>
            </View>
            <View style={styles.tableContentCol}>
              <Text style={styles.tableCell}>
                {bookingGroup.names.join(', ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface BookingsGroup {
  names: NonEmptyString[];
  startDate: DateTime;
  endDate: DateTime;
  timeslotIds: number[];
}
