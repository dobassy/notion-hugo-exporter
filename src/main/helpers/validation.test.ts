import { includeAwsImageUrl } from "./validation";

describe("includeAwsImageUrl", () => {
  test("Matchs the AWS url", () => {
    const result = includeAwsImageUrl(textIncludingUrl);
    expect(result).toBe(true);
  });

  test("Matchs the No AWS url", () => {
    const result = includeAwsImageUrl(textPlain);
    expect(result).toBe(false);
  });
});

const textIncludingUrl = `
# Hello notion with s3 image

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject)

end of text
`;

const textPlain = `
# Notion
Notion is a project management and note-taking software platform designed
to help members of companies or organizations coordinate deadlines,
objectives, and assignments for greater efficiency and productivity.
`;
