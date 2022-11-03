import { pathExists, remove } from "fs-extra";
import { basename, dirname, extname } from "path";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import { log, LogTypes } from "../logger";

export const convertWebp = async (
  originalImagePath: string
): Promise<string> => {
  const directory = dirname(originalImagePath);
  const ext = extname(originalImagePath);
  const filename = basename(originalImagePath, ext);

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
    log(`Convert image successfully: ${webpFilename}: Remove original file.`);
    try {
      await remove(originalImagePath);
    } catch (err) {
      log(
        `Failed to remove file: ${originalImagePath}: errors: ${err}`,
        LogTypes.warn
      );
    }
    return webpFilename;
  } else {
    log(`Failed to convert image: origin: ${originalImagePath}`);
    return "";
  }
};
