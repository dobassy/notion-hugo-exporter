import { ensureDir, writeFile } from "fs-extra";
import { trimYmd } from "./helpers/date";
import { log } from "./logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML = require("json-to-pretty-yaml");

export const parseDirectoryPath = (
  config: NotionHugoConfig,
  meta: frontMatter
) => {
  const section: string = meta.section ? meta.section : "posts";
  return `./${config.directory}/${section}`;
};

export const createDirectoryForFile = async (
  config: NotionHugoConfig,
  meta: frontMatter
): Promise<void> => {
  const directory = parseDirectoryPath(config, meta);
  await ensureDir(`./${directory}`);
};

export const determineFilePath = (
  config: NotionHugoConfig,
  meta: frontMatter
): string => {
  const fileExtension = "md";
  const directory = parseDirectoryPath(config, meta);

  const datePrefix = trimYmd(meta.date);
  let fileName = `${datePrefix}-${meta.sys.pageId}`;

  return `./${directory}/${fileName}.${fileExtension}`;
};

const setFileContent = (
  frontMatter: frontMatter,
  mainContent: string | null
) => {
  let fileContent = "";
  fileContent += `---\n`;
  fileContent += YAML.stringify(frontMatter);
  fileContent += `---\n`;
  if (mainContent) {
    fileContent += mainContent;
  }

  return fileContent;
};

/**
 *
 * @param {String} entryId - The id of the Contentful entry
 * @param {Object} frontMatter - Object containing all the data for frontmatter
 * @param {String} mainContent - String data for the main content that will appear below the frontmatter
 */
const createFile = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  mainContent: string | null
): Promise<void> => {
  const fileContent = setFileContent(frontMatter, mainContent);
  // create file
  await createDirectoryForFile(config, frontMatter);
  const filePath = determineFilePath(config, frontMatter);
  log(`[pageId: ${frontMatter.sys.pageId}] Write file: path: ${filePath}`);
  await writeFile(filePath, fileContent).catch((error) => {
    if (error) {
      log(error);
    }
  });
};

export default createFile;
