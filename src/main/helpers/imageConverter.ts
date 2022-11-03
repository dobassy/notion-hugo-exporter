import { pathExists } from "fs-extra";
import { basename, dirname, extname } from "path";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import { log } from "../logger";

export const convertWebp = async (
  originalImagePath: string
): Promise<string> => {
  const directory = dirname(originalImagePath);
  const filename = basename(originalImagePath);
  const ext = extname(originalImagePath);

  if (ext === "webp") {
    log(`This file is already in webp format: ${originalImagePath}`);
    return originalImagePath;
  }

  log(`Try to convert image: ${originalImagePath}`);
  await imagemin([originalImagePath], {
    destination: directory,
    plugins: [imageminWebp({ quality: 75 })],
  });

  const webpFilename = `${directory}/${filename}.webp`;

  if (await pathExists(webpFilename)) {
    log(`Convert image successfully: ${webpFilename}`);
    return webpFilename;
  } else {
    return "";
  }
};
