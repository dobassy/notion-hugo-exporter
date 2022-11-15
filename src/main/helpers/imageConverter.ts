import { pathExists, remove } from "fs-extra";
import { basename, dirname, extname, normalize } from "path";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import { log, LogTypes } from "../logger";

export const convertWebp = async (
  originalImagePath: string
): Promise<string> => {
  const directory = dirname(originalImagePath);
  const ext = extname(originalImagePath);
  const filename = basename(originalImagePath, ext);

  if (ext === ".webp") {
    log(
      `[Converter] This file is already in webp format: Skip conversion process: ${originalImagePath}`
    );
    return originalImagePath;
  }

  log(`[Converter] Attempt image conversion: ${originalImagePath}`);
  await imagemin([originalImagePath], {
    destination: directory,
    plugins: [imageminWebp({ quality: 75 })],
  });

  const webpFilename = normalize(`${directory}/${filename}.webp`);

  if (await pathExists(webpFilename)) {
    log(
      `[Converter] Convert image successfully: ${webpFilename}: Remove original file.`
    );
    try {
      await remove(originalImagePath);
    } catch (err) {
      log(
        `[Converter] Failed to remove file: ${originalImagePath}: errors: ${err}`,
        LogTypes.warn
      );
    }
    return webpFilename;
  } else {
    log(`[Converter] Failed to convert image: origin: ${originalImagePath}`);
    return "";
  }
};
