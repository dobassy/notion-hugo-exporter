import createFile from "./createFile";
import { error, log, LogTypes } from "./logger";
import { getBlocks, getPageFrontmatter } from "./notionRequest/getArticles";
import { getPublishedArticles } from "./notionRequest/getDatabases";
import fs from "fs-extra";
import { NotionToMarkdown } from "notion-to-md";
import notion from "./notionRequest/client";
import {
  ListBlockChildrenResponseResults,
  MdBlock,
} from "notion-to-md/build/types";
import pLimit from "p-limit";
import { createPage, findByPageId, updatePage } from "./datastore";
import { isDateNewer } from "./helpers/date";
import { isAwsImageUrl } from "./helpers/validation";
import { downloadImage } from "./helpers/donwload";

const checkFrontMatterContainRequiredValues = (
  frontMatter: frontMatter
): boolean => {
  const errorFunc = (errorReason: string) => {
    log(frontMatter);
    throw new Error(
      `frontMatter does not contain the required values: ${errorReason}`
    );
  };

  if (!frontMatter.date) {
    errorFunc("Missing 'date'");
  }

  if (frontMatter.categories.length === 0) {
    errorFunc("Missing 'categories'");
  }

  if (frontMatter.tags.length === 0) {
    errorFunc("Missing 'tags'");
  }

  return true;
};

/**
 * return true:  Since there is an update, it will be processed
 * return false: Not processed because there is no update
 */
const checkUpdatedTime = (
  frontMatter: frontMatter,
  lastCheckedCache: ModelPageMeta
): boolean => {
  const currentPageMeta = frontMatter.sys;
  if (!lastCheckedCache) {
    return true;
  }

  return isDateNewer(
    lastCheckedCache.lastEditedTime,
    currentPageMeta.lastEditedTime
  );
};

const notionImageBlockUrl = (block: any): string => {
  if (block["type"] === "image" && block["image"]["file"]) {
    return block["image"]["file"]["url"];
  } else if (block["type"] === "image" && block["image"]["external"]) {
    return block["image"]["external"]["url"];
  }
  return "";
};

const validateAwsUrlIncluded = async (blocks: any[]): Promise<string[]> => {
  const urls: any = [];
  const extractUrl = async (blocks: any) => {
    for (let block of blocks) {
      if (block["has_children"]) {
        const childBlocks = await getBlocks(block["id"]);
        await extractUrl(childBlocks);
      }

      if (block["type"] === "image") {
        const url = notionImageBlockUrl(block);
        if (isAwsImageUrl(url)) {
          urls.push(url);
        }
      }
    }
  };
  await extractUrl(blocks);
  return urls;
};

const fetchBodyFromNotion = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter
): Promise<string> => {
  const blocks: ListBlockChildrenResponseResults = await getBlocks(
    frontMatter.sys.pageId
  );

  const awsUrls = await validateAwsUrlIncluded(blocks);
  if (awsUrls.length > 0) {
    for (const imageUrl of awsUrls) {
      log(`${imageUrl} - [PageTitle: ${frontMatter.title}]`, LogTypes.warn);
      const filepath = await downloadImage(config, frontMatter, imageUrl);
      if (
        config.downloadImageCallback &&
        typeof config.downloadImageCallback === "function" &&
        filepath &&
        fs.existsSync(filepath)
      ) {
        config.downloadImageCallback(filepath);
      }
    }
    throw error(`The AWS url was found. Access time to this URL is limited.
    Be sure to change this URL to a publicly available URL.`);
  }

  // Convert to Markdown using npm 'github souvikinator/notion-to-md'
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdblocks: MdBlock[] = await n2m.blocksToMarkdown(blocks);
  const mdString = n2m.toMarkdownString(mdblocks);
  return mdString;
};

const fetchDataFromNotion = async (
  config: NotionHugoConfig,
  argv: CliArgs
): Promise<void> => {
  const createMessages: string[] = [];
  const skipMessages: string[] = [];
  const updatedMessages: string[] = [];

  const convertAndWriteMarkdown = async (pageId: string): Promise<void> => {
    const frontMatter = await getPageFrontmatter(pageId);
    if (!checkFrontMatterContainRequiredValues(frontMatter)) {
      log(frontMatter);
      throw new Error(`frontMatter does not contain the required values.`);
    }

    const lastCheckedCache = await findByPageId(pageId);
    // Check the update date and skip if it doesn't need to be processed
    if (
      !argv.force &&
      lastCheckedCache &&
      !checkUpdatedTime(frontMatter, lastCheckedCache)
    ) {
      skipMessages.push(
        `Skip mesage: pageId: ${pageId}: title: ${frontMatter.title}`
      );
      return;
    }

    if (lastCheckedCache) {
      await updatePage(frontMatter.sys);
      updatedMessages.push(
        `Updated cache: pageId: ${pageId}: title: ${frontMatter.title}`
      );
    } else {
      await createPage(frontMatter.sys);
      createMessages.push(
        `Create message: pageId: ${pageId}: title: ${frontMatter.title}`
      );
    }

    const mdString = await fetchBodyFromNotion(config, frontMatter);
    await writeContentFile(config, frontMatter, mdString);
  };

  const concurrency = config.concurrency ? config.concurrency : 5;
  const limit = pLimit(concurrency);
  const response = await getPublishedArticles();
  const tasks = response.results.map((page) =>
    limit(() => convertAndWriteMarkdown(page["id"]))
  );

  await Promise.all(tasks).then(() => {
    log(`----------- results --------------`);
    log(`Create messages: ${createMessages.length}`);
    log(`Update messages: ${updatedMessages.length}`);
    log(`Skip messages  : ${skipMessages.length}`);

    if (argv.verbose) {
      log(`${createMessages}`);
      log(`${updatedMessages}`);
      log(`${skipMessages}`);
    }
  });
};

const writeContentFile = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  content: string
): Promise<void> => {
  return createFile(config, frontMatter, content);
};

export { fetchDataFromNotion };
