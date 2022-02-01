import { error } from "../logger";

export const isAwsImageUrl = (url: string): boolean => {
  const parser = new URL(url);
  const regHost = new RegExp(/amazonaws\.com/, "i");
  const regPath = new RegExp(/notion-static\.com/, "i");
  if (parser.host.match(regHost) && parser.pathname.match(regPath)) {
    return true;
  }
  return false;
};

export const getImageFilename = (url: string): string => {
  const parser = new URL(url);
  const re = new RegExp(/([^\/]+\.(?:jpe?g|gif|png|webp|avif))/, "i");
  const result = parser.pathname.match(re);

  if (!result) {
    throw error(`Failed to extract the filename.
    This function should always get some filename. Make sure that is appropriat URL`);
  }

  return result[0];
};
