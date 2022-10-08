import { log, LogTypes } from "../logger";
import notion from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints.d";
import { ListBlockChildrenResponseResults } from "notion-to-md/build/types";
import {
  pageTitle,
  pageAuthor,
  pageDraft,
  pagePublishedAt,
  pageUpdatedAt,
  pageTags,
  pageCategory,
  pageSection,
  pageToC,
  pageLegacyAlert,
  pageSlug,
  pageUrl,
  pageDescription,
  pageFilepath,
  pageLinkTitle,
  pageWeight,
  extractExternalUrl,
  hasPlainText,
} from "./property";

// Store all metadata in frontMatter
// Values that are not directly needed to create Hugo pages are stored in the
// under 'sys' key (e.g. pageId, Page modification date, etc...)
// Note that: Notion's Page modification date (as 'last_edited_time') is different
//            from the last update date of Hugo's page ('lastmod')
export const getPageFrontmatter = async (
  pageId: string,
  options: frontmatterOptions
): Promise<frontMatter> => {
  log(`[Info] [pageId: ${pageId}] Fetch from Notion API`);
  const pageMeta = await getArticle(pageId);
  if (pageMeta["archive"]) {
    log(pageMeta);
    throw new Error(
      `The page property is "archive", but the status is "isPublished".
      Make sure the publishing settings for this article are correct.`
    );
  }
  const properties = pageMeta["properties"];

  log(properties, LogTypes.debug);

  let frontMatter: any = {
    sys: {
      pageId: pageId,
      createdTime: pageMeta["created_time"],
      lastEditedTime: pageMeta["last_edited_time"],
    },
    title: pageTitle(properties),
    date: pagePublishedAt(properties),
    description: pageDescription(properties),
    tags: pageTags(properties),
    categories: pageCategory(properties),
    toc: pageToC(properties),
    author: pageAuthor(properties, options),
    legacy_alert: pageLegacyAlert(properties),
    draft: pageDraft(properties),
  };

  if (hasPlainText(properties["Url"])) {
    frontMatter["url"] = pageUrl(properties);
  } else if (hasPlainText(properties["Slug"])) {
    frontMatter["slug"] = pageSlug(properties);
  } else {
    throw new Error(
      `One of the "Url" and "Slug" page properties must be defined.`
    );
  }

  // Property for forcing the exported `.md` file name.
  if (pageFilepath(properties)) {
    frontMatter["sys"]["propFilepath"] = pageFilepath(properties);
  }

  if (pageSection(properties)) {
    frontMatter["section"] = pageSection(properties);
  }

  if (pageUpdatedAt(properties)) {
    frontMatter["lastmod"] = pageUpdatedAt(properties);
  }

  if (extractExternalUrl(properties)) {
    frontMatter["featured_image"] = extractExternalUrl(properties);
    frontMatter["images"] = [extractExternalUrl(properties)];
  }

  // Properties expected to be used by Docsy theme, etc
  //   linkTitle:
  //   weight:
  if (pageLinkTitle(properties)) {
    frontMatter["linkTitle"] = pageLinkTitle(properties);
  }

  if (pageWeight(properties)) {
    frontMatter["weight"] = pageWeight(properties);
  }

  return frontMatter as frontMatter;
};

const getArticle = async (pageId: string) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

// Expecting to use the "Notion to Markdown" package
export const getBlocks = async (
  blockId: string
): Promise<ListBlockChildrenResponseResults> => {
  const blocks: ListBlockChildrenResponseResults = [];
  let cursor: unknown;
  while (true) {
    const response = (await notion.blocks.children.list({
      start_cursor: cursor,
      block_id: blockId,
    })) as ListBlockChildrenResponse;
    const results = response.results;
    const next_cursor = response.next_cursor;

    blocks.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  return blocks;
};
