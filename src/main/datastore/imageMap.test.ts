import fs from "fs-extra";
import {
  updateImageMap,
  createOrUpdateImageMap,
  findByImageId,
} from "./imageMap";

beforeAll(() => {
  fs.unlinkSync("./.notion-hugo-cache/image_map.cache");
});

describe("createOrUpdateImageMap", () => {
  test("Create process", async () => {
    const id =
      "secure.notion-static.com/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const filepath =
      "/images/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const result = await createOrUpdateImageMap(id, filepath);
    //@ts-ignore
    expect(result.filePath).toBe(
      "/images/12345678-1234-5678-abcd-123456789012/Untitled.png"
    );
  });

  test("Update process", async () => {
    const id =
      "secure.notion-static.com/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const filepath =
      "/new_images/abcdefgh-1234-5678-abcd-123456789012/Untitled.png";
    const result = await createOrUpdateImageMap(id, filepath);
    //@ts-ignore
    expect(result.filePath).toBe(
      "/new_images/abcdefgh-1234-5678-abcd-123456789012/Untitled.png"
    );
  });
});

describe("updateImageMap", () => {
  test("Normal process", async () => {
    const id =
      "secure.notion-static.com/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const filepath = "/abcdefgh-1234-5678-abcd-123456789012/Untitled.png";
    const result = await updateImageMap(id, filepath);
    //@ts-ignore
    expect(result.filePath).toBe(
      "/abcdefgh-1234-5678-abcd-123456789012/Untitled.png"
    );
  });
});

describe("findByImageId", () => {
  test("Normal process", async () => {
    const id =
      "secure.notion-static.com/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const result = await findByImageId(id);
    //@ts-ignore
    expect(result.filePath).toBe(
      "/abcdefgh-1234-5678-abcd-123456789012/Untitled.png"
    );
  });
  test("Normal process", async () => {
    const id =
      "null.notion-static.com/12345678-1234-5678-abcd-123456789012/Untitled.png";
    const result = await findByImageId(id);
    //@ts-ignore
    expect(result).toBe(null);
  });
});
