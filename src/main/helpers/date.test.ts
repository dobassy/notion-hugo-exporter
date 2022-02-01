import { isDateNewer, trimYmd } from "./date";

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
