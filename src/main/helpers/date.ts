export const isDateNewer = (
  originDate: string,
  comparedDate: string
): boolean => {
  return new Date(comparedDate) > new Date(originDate);
};

export const trimYmd = (date: string): string => {
  const re = new RegExp(/^(\d{4}-\d{2}-\d{2})/);
  const result = date.match(re);
  if (result) {
    return result[1];
  } else {
    return "";
  }
};

export const isOnlyDate = (date: string): boolean => {
  const re = new RegExp(/^(\d{4}-\d{2}-\d{2})$/);
  const result = date.match(re);
  return result ? true : false;
};

export const setTimeMidnight = (date: string, utcOffset?: string): string => {
  if (!isOnlyDate(date)) {
    throw new Error(`Invalid format of 'date': value: ${date}`);
  }
  if (utcOffset && !utcOffset.match(/^(\+\d{2}\:?\d{2})$/)) {
    throw new Error(`Invalid format of 'utcOffset': value: ${utcOffset}`);
  }
  return utcOffset ? `${date}T00:00:00${utcOffset}` : `${date}T00:00:00Z`;
};
