import React, { ReactElement } from 'react';
import { StyleSheet, View } from '@react-pdf/renderer';

export default function renderHLinePDF(width: string): ReactElement {
  const styles = StyleSheet.create({
    hline: {
      borderBottomColor: 'black',
      borderBottomWidth: width,
      width: '100%',
      marginBottom: '5mm',
    },
  });

  return <View style={styles.hline}></View>;
}
