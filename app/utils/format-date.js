import React from 'react';
import { FormattedDate } from 'react-intl';

export default function formatDate(locale, time) {
  if (Intl && Intl.DateTimeFormat) {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(time);
  }
  return (
    <FormattedDate value={time} year="numeric" month="numeric" day="numeric" />
  );
}
