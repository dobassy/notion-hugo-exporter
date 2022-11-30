/* eslint-disable @typescript-eslint/no-explicit-any */
import { ensureDir, pathExists } from "fs-extra";
import { join } from "path";
import { createOrUpdateImageMap, findByImageId } from "../datastore/imageMap";
import { log, LogTypes } from "../logger";
import { convertWebp } from "./imageConverter";
import { getImageFilename, getImageFullName, getImageUID } from "./notionImage";

import fs from "fs";
import Axios from "axios";

const resolveFilePath = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  url: string
): Promise<string> => {
  const directory = await determineDir(config, frontMatter);
  await ensureDir(directory);

  const iamgeFileName = getImageFilename(url);
  const imageUID = getImageUID(url);
  const filename = `${imageUID}-${iamgeFileName}`;
  return `${directory}/${filename}`;
};

const determineDir = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter
): Promise<string> => {
  if (!config.saveAwsImageDirectory)
    throw new Error(`Unable to resolve save directory`);

  const m = frontMatter.date.match(/^(\d{4})/);
  const year = m ? m[1] : ".";
  return join(config.saveAwsImageDirectory, year, frontMatter.sys.pageId);
};

export const saveImageMap = async (
  s3ImageUrl: string,
  filepath: string
): Promise<void> => {
  const id = getImageFullName(s3ImageUrl);
  await createOrUpdateImageMap(id, filepath);
};

const checkExistsImageMapAndFileCache = async (
  s3url: string
): Promise<boolean> => {
  const imageId = getImageFullName(s3url);

  const imageMapModel = await findByImageId(imageId);
  const idExists = !!imageMapModel;
  if (!idExists) return false;

  const fileExists = await pathExists(imageMapModel.filePath);

  if (idExists && fileExists) {
    return true;
  }
  return false;
};

export const downloadImage = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  url: string
): Promise<string | null> => {
  if (!config.saveAwsImageDirectory) {
    return null;
  }
  const filepath = await resolveFilePath(config, frontMatter, url);

  if (await checkExistsImageMapAndFileCache(url)) {
    log(
      `[Info] File already exists: Skipping download process: ${filepath}`,
      LogTypes.info
    );

    return filepath;
  }

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", (err: any) => {
        log(
          `[Error] Attempts to download iamge: ${filepath}: ${err}`,
          LogTypes.error
        );
        reject(null);
      })
      .once("close", async () => {
        log(
          `[Info] Attempts to download iamge successfully: ${filepath}`,
          LogTypes.info
        );

        let publishImagePath: string;
        if (config.s3ImageConvertToWebpEnalbed) {
          const webpImage = await convertWebp(filepath);
          publishImagePath = webpImage !== "" ? webpImage : filepath;
        } else {
          publishImagePath = filepath;
        }
        await saveImageMap(url, publishImagePath);
        resolve(publishImagePath);
      });
  });
};
