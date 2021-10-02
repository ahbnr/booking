import React, { ReactElement, ReactNode } from 'react';
import '../App.css';
import '../utils/map_extensions';
import { boundClass } from 'autobind-decorator';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { DateTime, Duration } from 'luxon';
import { WeekdayName } from 'common';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Skeleton } from '@material-ui/lab';
import { InfoMessage } from './ListEx';
import { WeekdayBookingConstraint } from '../complex_queries/getValidBookingDays';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      width: '100%',
      height: '100%',
    },
    listItemText: {
      textAlign: 'center',
    },
    listButton: {
      width: '90%',
    },
  });

@boundClass
class UnstyledInfiniteWeekdaysList extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      bookingOptions: [],
      weekMultiplier: 0,
    };
  }

  private loadNextWeek(): Promise<void> {
    return new Promise<void>((resolve) => {
      const newBookingOptions: BookingOption[] = this.props.weekdays.map(
        (base) => {
          const bookingDay = base.earliestDate
            .plus(Duration.fromObject({ weeks: this.state.weekMultiplier }))
            .startOf('day');

          return {
            weekdayName: base.weekdayName,
            weekdayId: base.weekdayId,
            bookingDay,
          };
        }
      );

      this.setState(
        {
          bookingOptions: [...this.state.bookingOptions, ...newBookingOptions],
          weekMultiplier: this.state.weekMultiplier + 1,
        },
        resolve
      );
    });
  }

  render() {
    let itemCount = 0;
    if (this.props.weekdays.length > 0) {
      itemCount = this.state.bookingOptions.length + 1;
      if (this.props.maxWeekDistance >= 0) {
        itemCount = Math.min(itemCount, this.props.maxWeekDistance + 1);
      }
    }
    const itemSize = 80;

    let content: ReactNode;
    if (itemCount === 0) {
      content = (
        <InfoMessage
          emptyTitle={this.props.emptyTitle}
          emptyMessage={this.props.emptyMessage}
        />
      );
    } else {
      content = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" align="center">
            {this.props.notEmptyTitle}
          </Typography>
          <div style={{ width: '100%', flexGrow: 1 }}>
            <AutoSizer>
              {({ width, height }) => (
                <InfiniteLoader
                  isItemLoaded={(index) =>
                    index < this.state.bookingOptions.length
                  }
                  itemCount={itemCount}
                  loadMoreItems={this.loadNextWeek}
                  minimumBatchSize={this.props.weekdays.length}
                  threshold={this.props.weekdays.length}
                >
                  {({ onItemsRendered, ref }) => (
                    <FixedSizeList
                      itemSize={itemSize}
                      height={height}
                      itemCount={itemCount}
                      width={width}
                      onItemsRendered={onItemsRendered}
                      ref={ref}
                    >
                      {({ index, style }) => {
                        if (index >= this.state.bookingOptions.length) {
                          return (
                            <Skeleton
                              style={style}
                              variant="rect"
                              width={300}
                              height={itemSize}
                            />
                          );
                        }

                        return this.props.children(
                          this.state.bookingOptions[index],
                          style
                        );
                      }}
                    </FixedSizeList>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </div>
        </div>
      );
    }

    return <div className={this.props.classes.container}>{content}</div>;
  }
}

const InfiniteWeekdaysList = withTranslation()(
  withStyles(styles)(UnstyledInfiniteWeekdaysList)
);
export default InfiniteWeekdaysList;

interface Properties extends WithStyles<typeof styles>, WithTranslation {
  weekdays: WeekdayBookingConstraint[];
  maxWeekDistance: number;
  notEmptyTitle: string;
  emptyTitle?: string;
  emptyMessage?: string;
  children: (
    bookingOption: BookingOption,
    style: React.CSSProperties
  ) => ReactElement;
}

interface State {
  bookingOptions: BookingOption[];
  weekMultiplier: number;
}

export interface BookingOption {
  weekdayName: WeekdayName;
  weekdayId: number;
  bookingDay: DateTime;
}
