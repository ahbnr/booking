import { VerificationTimeout } from '../models/booking.model';
import TimeslotDBInterface from '../repositories/model_interfaces/TimeslotDBInterface';
import { DateTime } from 'luxon';
import { i18nextInstance } from '../utils/i18n';
import humanizeDuration from 'humanize-duration';
import SettingsDBInterface from '../repositories/model_interfaces/SettingsDBInterface';

import dedent from 'dedent-js';
import BookingDBInterface from '../repositories/model_interfaces/BookingDBInterface';

export interface BookingConfirmationDoc {
  title: string;
  intro: string;
  resourceString: string;
  timeString: string;
  linkIntro: string;
  linkText: string | undefined;
  lookupLink: string;
  linkPrimaryHint: string | undefined;
  linkSecondaryHint: string | undefined;
}

export async function genBookingConfirmation(
  lookupUrl: string,
  booking: BookingDBInterface,
  timeslot: TimeslotDBInterface,
  lookupToken: string,
  settings: SettingsDBInterface
): Promise<BookingConfirmationDoc> {
  const weekday = await timeslot.getWeekday();
  const resourceName = weekday.resourceName;

  const startDate = DateTime.fromJSDate(booking.startDate).setLocale('de-DE');
  const endDate = DateTime.fromJSDate(booking.endDate).setLocale('de-DE');

  const intro = i18nextInstance.t('booking-repository-mail-booking-intro');

  const dateWithWeekday = startDate.toLocaleString({
    ...DateTime.DATE_MED_WITH_WEEKDAY,
  });
  const startTime = startDate.toLocaleString({ ...DateTime.TIME_24_SIMPLE });
  const endTime = endDate.toLocaleString({ ...DateTime.TIME_24_SIMPLE });

  const resourceString = `"${resourceName}"`;

  const timeString = `am ${dateWithWeekday} von ${startTime} bis ${endTime}.`;

  let linkIntro: string;
  let linkText: string;
  const lookupLink = `${lookupUrl}?lookupToken=${lookupToken}`;
  let linkPrimaryHint: string | undefined = undefined;
  let linkSecondaryHint: string | undefined = undefined;

  if (settings.data.requireMailConfirmation) {
    linkIntro = 'Öffnen Sie diesen Link um Ihre Buchung zu bestätigen:';
    linkText = 'Bestätigen und Buchungen einsehen';
    linkPrimaryHint = dedent`
        IHRE BUCHUNG VERFÄLLT AUTOMATISCH NACH
        ${humanizeDuration(VerificationTimeout.toMillis(), {
          language: 'de',
        }).toUpperCase()}
        WENN SIE NICHT BESTÄTIGT WIRD.
      `;
    linkSecondaryHint =
      'Sie können den Link auch verwenden um alle Buchungen auf diese E-Mail Adresse einzusehen oder Buchungen zu löschen.';
  } else {
    linkIntro =
      'Sie können Ihre Buchungen unter diesem Link einsehen und ggf. löschen:';
    linkText = 'Buchungen einsehen';
  }

  const confirmationDoc: BookingConfirmationDoc = {
    title: `Ihre Buchung - ${booking.name}`,
    intro,
    resourceString,
    timeString,
    linkIntro,
    linkText,
    lookupLink,
    linkPrimaryHint,
    linkSecondaryHint,
  };

  return confirmationDoc;
}
