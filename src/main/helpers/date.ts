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
