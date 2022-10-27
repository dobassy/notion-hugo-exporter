export const includeAwsImageUrl = (markdownText: string): boolean => {
  const s3pattern = new RegExp(
    /https:\/\/s3.+amazonaws\.com.+X-Amz-Credential.+/,
    "gm"
  );

  if (markdownText.match(s3pattern)) {
    return true;
  }
  return false;
};
