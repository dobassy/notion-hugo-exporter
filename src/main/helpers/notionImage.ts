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

export const isAwsImageUrlString = (string: string): boolean => {
  const regHost = new RegExp(/amazonaws\.com/, "i");
  const regPath = new RegExp(/notion-static\.com/, "i");
  if (string.match(regHost) && string.match(regPath)) {
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

export const getImageUID = (url: string): string => {
  const u = new URL(url);
  const pathname = u.pathname;
  const m = pathname.split("/");

  return m[2];
};

export const getImageFullName = (url: string): string => {
  const u = new URL(url);
  const pathname = u.pathname;
  const m = pathname.match(/\/(.+)/);
  if (!m) {
    return "";
  }

  const fullname = m[1];

  const imagePattern = new RegExp(
    /^.+notion-static.+\.(?:jpe?g|gif|png|webp|avif)/,
    "i"
  );

  if (fullname.match(imagePattern)) {
    return fullname;
  } else {
    return "";
  }
};
