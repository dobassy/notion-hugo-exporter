import { isAwsImageUrl, getImageFilename } from "./validation";

describe("isAwsImageUrl", () => {
  test("Matchs the AWS url", () => {
    const url =
      "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject";
    const result = isAwsImageUrl(url);
    expect(result).toBe(true);
  });

  test("Matchs the No AWS url", () => {
    const url = "https://example.com/hello.png";
    const result = isAwsImageUrl(url);
    expect(result).toBe(false);
  });
});

describe("getImageFilename", () => {
  test("Matchs Untitled.png", () => {
    const url =
      "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject";
    const result = getImageFilename(url);
    expect(result).toEqual("Untitled.png");
  });

  test("Matchs hello.jpg", () => {
    const url = "https://example.com/hello.jpg/hello.png";
    const result = getImageFilename(url);
    expect(result).toEqual("hello.jpg");
  });

  test("Does not match (throw Error)", () => {
    const url = "https://example.com/hello";
    expect(() => getImageFilename(url)).toThrow(Error);
  });
});
