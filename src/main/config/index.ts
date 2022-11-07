import path from "path";
import { pathExists } from "fs-extra";
import { log, LogTypes } from "../logger";

/**
 * Determine if a file is yaml or js depending on the file extension
 */
const determineFileType = (fileName: string): string | null => {
  const splitStr = fileName.split(".");
  const fileExtension = splitStr[splitStr.length - 1];
  switch (fileExtension) {
    case "js":
      return "javascript";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return null;
  }
};

const loadJavascriptConfigFile = (
  filePath: string
): NotionHugoConfig | false => {
  // eslint-disable-next-line global-require
  log(`[Info] Appempts to load configuration file: ${filePath}`, LogTypes.info);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const configObject = require(filePath);
  if (configObject && typeof configObject === "object") {
    return configObject;
  }
  return false;
};

/**
 * Attempt to load a config file
 */
const loadFile = async (
  rootDir = ".",
  fileName = ""
): Promise<NotionHugoConfig | false> => {
  const filePath = path.resolve(rootDir, fileName);

  if (await pathExists(filePath)) {
    const fileType = determineFileType(fileName);
    if (fileType === "javascript") {
      return loadJavascriptConfigFile(filePath);
    }
  }
  return false;
};

const loadConfig = async (
  /**
   * Directory of the config file. (Default ".")
   */
  rootDir = "."
): Promise<NotionHugoConfig | false> => {
  rootDir = path.resolve(rootDir);
  const defaultConfigs = ["notion-hugo.config.js"];
  const tasks = [];
  const configList: NotionHugoConfig[] = [];
  for (const config of defaultConfigs) {
    const file = loadFile(rootDir, config).then((result) => {
      if (result) {
        configList.push(result);
      }
    });
    tasks.push(file);
  }
  return Promise.all(tasks).then(() => {
    // eslint-disable-next-line no-unreachable-loop
    for (const config of configList) {
      return config;
    }
    return false;
  });
};

export { loadConfig };
