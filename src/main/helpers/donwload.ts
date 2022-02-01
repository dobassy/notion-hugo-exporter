import { ensureDir } from "fs-extra";
import { log, LogTypes } from "../logger";
import { getImageFilename } from "./validation";

const fs = require("fs");
const Axios = require("axios");

const resolveFilePath = (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  url: string
): string => {
  const timestamp = Date.now();

  const iamgeFileName = getImageFilename(url);

  const directory = config.saveAwsImageDirectory;
  const filename = `${frontMatter.sys.pageId}-${timestamp}-${iamgeFileName}`;
  return `${directory}/${filename}`;
};

const createDirectory = async (directoryPath: string): Promise<void> => {
  await ensureDir(directoryPath);
};

export const downloadImage = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  url: string
): Promise<string | null> => {
  if (!config.saveAwsImageDirectory) {
    return null;
  }
  await createDirectory(config.saveAwsImageDirectory);
  const filepath = resolveFilePath(config, frontMatter, url);
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
          `[Error] Appments to download iamge: ${filepath}: ${err}`,
          LogTypes.error
        );
        reject(null);
      })
      .once("close", () => {
        log(`[Info] Appments to download iamge: ${filepath}`, LogTypes.info);
        resolve(filepath);
      });
  });
};
