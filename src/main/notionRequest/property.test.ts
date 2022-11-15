import { pageTitle } from "./property";
describe("urlize() returns kebab-case string", () => {
  test("Without slash", () => {
    const titleProperty = {
      Name: {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            plain_text: "Generate the ",
            href: null,
          },
          {
            type: "text",
            plain_text: "schema.org",
            href: "http://schema.org/",
          },
          {
            type: "text",
            plain_text: " (JSON-LD) with Hugo",
            href: null,
          },
        ],
      },
    };

    const result = pageTitle(titleProperty);
    expect(result).toEqual("Generate the schema.org (JSON-LD) with Hugo");
  });
});
