import fs from "fs-extra";
import { createPage, updatePage, deletePage } from "./index";

beforeAll(() => {
  fs.unlinkSync("./.notion-hugo-cache/pages.cache");
});

describe("createPage", () => {
  test("Create process", async () => {
    const sys: sys = {
      pageId: "abcd1234-1234-5678-abcd-12345678abcd",
      createdTime: "2022-10-08T09:04:00.000Z",
      lastEditedTime: "2022-11-03T11:22:00.000Z",
    };

    const result = await createPage(sys);
    expect(result?.pageId).toBe("abcd1234-1234-5678-abcd-12345678abcd");
    expect(result?.createdTime).toBe("2022-10-08T09:04:00.000Z");
    expect(result?.lastEditedTime).toBe("2022-11-03T11:22:00.000Z");
  });

  test("Update process", async () => {
    const sys: sys = {
      pageId: "abcd1234-1234-5678-abcd-12345678abcd",
      createdTime: "2022-10-08T09:04:00.000Z",
      lastEditedTime: "2022-12-24T11:22:00.000Z",
    };

    const result = await updatePage(sys);
    expect(result?.pageId).toBe("abcd1234-1234-5678-abcd-12345678abcd");
    expect(result?.createdTime).toBe("2022-10-08T09:04:00.000Z");
    expect(result?.lastEditedTime).toBe("2022-12-24T11:22:00.000Z");
  });
});

describe("deletePage", () => {
  test("delete page failed", async () => {
    const id = "xxxxxxxx-1234-5678-abcd-12345678abcd";
    const result = await deletePage(id);
    expect(result).toBe(false);
  });

  test("delete page succeeded", async () => {
    const id = "abcd1234-1234-5678-abcd-12345678abcd";
    const result = await deletePage(id);
    expect(result).toBe(true);
  });
});
