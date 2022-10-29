import { findByImageId } from "../datastore/imageMap";
import { publicPath } from "./asset";
import { getImageFullName, isAwsImageUrlString } from "./notionImage";

// If the input value is an S3 URL, find and replace the real file from the key.
// If the image tag does not match or there is no image cache, do nothing and return the input value.
const replaceS3ImageUrl = async (text: string): Promise<string> => {
  const markdownOriginalLine = text;

  // expected for: ![](https://s3...)
  //             : ![any title](https://s3...)
  const markdownImageTagUrlPattern = new RegExp(
    /\!\[.*\]\((https:\/\/s3[^\)].+?)\)/
  );
  const m = text.match(markdownImageTagUrlPattern);

  if (m && m[1]) {
    const s3Url = m[1];

    const imageId = getImageFullName(s3Url);
    const fileCache = await findByImageId(imageId);

    if (!fileCache) return markdownOriginalLine;

    const publicFilepath = publicPath(fileCache);

    const urlPatternS3Image = new RegExp(/https:\/\/s3[^\)]+/);
    const markdownNewLine = markdownOriginalLine.replace(
      urlPatternS3Image,
      publicFilepath
    );

    return markdownNewLine;
  }
  return markdownOriginalLine;
};

export const convertS3ImageUrl = async (markdown: string): Promise<string> => {
  const new_md_array = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    if (isAwsImageUrlString(line)) {
      new_md_array.push(await replaceS3ImageUrl(line));
    } else {
      new_md_array.push(line);
    }
  }
  return new_md_array.join("\n");
};
