import { isDateNewer, isOnlyDate, setTimeMidnight, trimYmd } from "./date";

describe("Comparision of GMT and JST", () => {
  test("If the time are the same, it is judged that they have not been updated.", () => {
    const date1 = "2022-01-20T10:00:00.000Z";
    const date2 = "2022-01-20T19:00:00.000+09:00";
    const result = isDateNewer(date1, date2);
    expect(result).toBe(false);
  });

  test("After one second has passed", () => {
    const date1 = "2022-01-20T10:00:00.000Z";
    const date2 = "2022-01-20T19:00:01.000+09:00";
    const result = isDateNewer(date1, date2);
    expect(result).toBe(true);
  });
});

describe("Trim YYYY-mm-dd format from date string ", () => {
  test("Valida ymd format", () => {
    const date1 = "2022-01-20T10:00:00.000Z";
    const result = trimYmd(date1);
    expect(result).toBe("2022-01-20");
  });
  test("get an empty string when given an invalid format", () => {
    const date1 = "2022-01";
    const result = trimYmd(date1);
    expect(result).toBe("");
  });
});

describe("Check date only?", () => {
  test("valid input, then true", () => {
    const date1 = "2022-01-20";
    const result = isOnlyDate(date1);
    expect(result).toBe(true);
  });
  test("invalid input, then false", () => {
    const date1 = "2022-01-20T10:00:00.000Z";
    const result = isOnlyDate(date1);
    expect(result).toBe(false);
  });
  test("invalid input, then false", () => {
    const date1 = "2022-01";
    const result = isOnlyDate(date1);
    expect(result).toBe(false);
  });
});

describe("setTimeMidnight", () => {
  const date1 = "2022-01-20";
  test("valid input", () => {
    const result = setTimeMidnight(date1);
    expect(result).toBe("2022-01-20T00:00:00Z");
  });
  test("valid input with blank string", () => {
    const result = setTimeMidnight(date1, "");
    expect(result).toBe("2022-01-20T00:00:00Z");
  });
  test("valid input with +09:00", () => {
    const result = setTimeMidnight(date1, "+09:00");
    expect(result).toBe("2022-01-20T00:00:00+09:00");
  });
  test("valid input with +0900", () => {
    const result = setTimeMidnight(date1, "+0900");
    expect(result).toBe("2022-01-20T00:00:00+0900");
  });
});
