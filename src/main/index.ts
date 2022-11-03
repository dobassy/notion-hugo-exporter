import createFile from "./createFile";
import { error, log, LogTypes } from "./logger";
import { getBlocks, getPageFrontmatter } from "./notionRequest/getArticles";
import { getPublishedArticles } from "./notionRequest/getDatabases";
import fs from "fs-extra";
import { NotionToMarkdownCustom } from "./notion-to-md/notion-to-md";
import notion from "./notionRequest/client";
import {
  ListBlockChildrenResponseResults,
  MdBlock,
} from "notion-to-md/build/types";
import pLimit from "p-limit";
import { createPage, findByPageId, updatePage } from "./datastore";
import { isDateNewer } from "./helpers/date";
import { isAwsImageUrl } from "./helpers/notionImage";
import { downloadImage } from "./helpers/donwload";
import { includeAwsImageUrl } from "./helpers/validation";
import { convertS3ImageUrl } from "./helpers/markdown";

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

// Judgement if the page is updated based on the cache information and lastEditedTime
// @params page Object returned by Notion API
// @return true: Updated required
const isRequiredPageUpdate = async (page: any): Promise<boolean> => {
  const pageCache = await findByPageId(page["id"]);
  if (!pageCache) {
    return true;
  }
  return page["last_edited_time"] !== pageCache.lastEditedTime;
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

const executeDownloadImageCallbacks = async (
  callbackTasks: any[],
  frontMatter: frontMatter
): Promise<void> => {
  if (callbackTasks.length > 0) {
    try {
      await Promise.all(callbackTasks);

      log(
        `[Info] [pageId: ${frontMatter.sys.pageId}] User defined callback is completed`,
        LogTypes.info
      );
    } catch (error) {
      log("[Error] Error occurred in a user defined callback", LogTypes.error);
      // @ts-ignore
      throw new Error(error);
    }
  }
};

const fetchBodyFromNotion = async (
  config: NotionHugoConfig,
  frontMatter: frontMatter,
  argv: CliArgs
): Promise<string> => {
  const blocks: ListBlockChildrenResponseResults = await getBlocks(
    frontMatter.sys.pageId
  );

  const awsUrls = await validateAwsUrlIncluded(blocks);

  if (awsUrls.length > 0) {
    if (argv.server) {
      log(
        `The AWS url was found, but the process skipping (In server mode).`,
        LogTypes.warn
      );
    } else {
      const callbackTasks: Promise<void>[] = [];
      const concurrency = config.concurrency ? config.concurrency : 5;
      const limit = pLimit(concurrency);

      for (const imageUrl of awsUrls) {
        log(`${imageUrl} - [PageTitle: ${frontMatter.title}]`, LogTypes.warn);
        const filepath = await downloadImage(config, frontMatter, imageUrl);

        // If a callback after image download is set in the configuration file,
        // Add to Queue to execute Callback
        if (
          typeof config.downloadImageCallback === "function" &&
          filepath &&
          fs.existsSync(filepath)
        ) {
          callbackTasks.push(
            // @ts-ignore
            limit(() => config.downloadImageCallback(filepath))
          );
        }
      }

      executeDownloadImageCallbacks(callbackTasks, frontMatter);
    }
  }

  // Convert to Markdown using npm 'github souvikinator/notion-to-md'
  const n2m = new NotionToMarkdownCustom({ notionClient: notion });
  if (typeof config.customTransformerCallback === "function") {
    config.customTransformerCallback(n2m);
  }
  const mdblocks: MdBlock[] = await n2m.blocksToMarkdown(blocks);

  const mdString = n2m.toMarkdownString(mdblocks);

  const markdownText = await convertS3ImageUrl(mdString);
  if (config.s3ImageUrlWarningEnabled && includeAwsImageUrl(markdownText)) {
    log(markdownText, LogTypes.debug);
    throw error(`The AWS image url was found in the article. Access time to this URL is limited.
    Be sure to change this URL to a publicly available URL.`);
  }
  return markdownText;
};

const fetchDataFromNotion = async (
  config: NotionHugoConfig,
  argv: CliArgs
): Promise<void> => {
  const createMessages: string[] = [];
  const skipMessages: string[] = [];
  const updatedMessages: string[] = [];

  const convertAndWriteMarkdown = async (pageId: string): Promise<void> => {
    const options: { author: string } = {
      author: config.authorName ? config.authorName : "Writer",
    };
    const frontMatter = await getPageFrontmatter(
      pageId,
      options,
      config.customProperties
    );
    if (!checkFrontMatterContainRequiredValues(frontMatter)) {
      log(frontMatter);
      throw new Error(`frontMatter does not contain the required values.`);
    }

    const lastCheckedCache = await findByPageId(pageId);
    log(
      `[Info] [pageId: ${pageId}] Check cache: ${
        lastCheckedCache
          ? "Found: " + lastCheckedCache.createdTime
          : "Not found: null"
      }`
    );

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

    const mdString = await fetchBodyFromNotion(config, frontMatter, argv);
    log(`[Info] [pageId: ${pageId}] Writing...`);
    await writeContentFile(config, frontMatter, mdString);
  };

  const concurrency = config.concurrency ? config.concurrency : 5;
  const limit = pLimit(concurrency);
  const results = await getPublishedArticles();

  const tasks: Promise<void>[] = [];
  for (const page of results) {
    if (argv.force || (await isRequiredPageUpdate(page))) {
      tasks.push(limit(() => convertAndWriteMarkdown(page["id"])));
    } else {
      skipMessages.push(
        `Skip mesage: pageId: ${page["id"]}}: title: ${page["properties"]["Name"]["title"][0]["plain_text"]}}`
      );
      log(
        `[Info] [pageId: ${page["id"]}] Not chenged. No need to update ...skip`
      );
    }
  }

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
