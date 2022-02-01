import { urlize } from "./string";

describe("urlize() returns kebab-case string", () => {
  test("With slash", () => {
    const string = "/Hello Notion  ";
    const result = urlize(string);
    expect(result).toEqual("/hello-notion");
  });

  test("Without slash", () => {
    const string = "Hello Notion  ";
    const result = urlize(string);
    expect(result).toEqual("/hello-notion");
  });

  test("Without slash", () => {
    const string = "Notion / Hello Notion  ";
    const result = urlize(string);
    expect(result).toEqual("/notion/hello-notion");
  });
});
