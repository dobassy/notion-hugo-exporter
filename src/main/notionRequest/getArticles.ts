import { log, LogTypes } from "../logger";
import notion from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints.d";
import { ListBlockChildrenResponseResults } from "notion-to-md/build/types";
import { urlize } from "../helpers/string";

// Store all metadata in frontMatter
// Values that are not directly needed to create Hugo pages are stored in the
// under 'sys' key (e.g. pageId, Page modification date, etc...)
// Note that: Notion's Page modification date (as 'last_edited_time') is different
//            from the last update date of Hugo's page ('lastmod')
export const getPageFrontmatter = async (
  pageId: string
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
    author: pageAuthor(properties),
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

  return frontMatter as frontMatter;
};

const pageTitle = (prop: any): string => {
  return extractPlainText(prop["Name"]);
};
const pageAuthor = (prop: any): string => {
  return "Writer";
};
const pageDraft = (prop: any): boolean => {
  if (prop["isDraft"] !== undefined) {
    return isChecked(prop["isDraft"]);
  }
  return false;
};
const pagePublishedAt = (prop: any): string => {
  return extractDateTime(prop["PublishedAt"]);
};
const pageUpdatedAt = (prop: any): string => {
  return extractDateTime(prop["UpdatedAt"]);
};
const pageTags = (prop: any): string[] => {
  return extractMultiValues(prop["Tags"]);
};
const pageCategory = (prop: any): string[] => {
  const category = extractPlainText(prop["Category"]);
  if (category === "") {
    return [];
  }

  return [category];
};
const pageSection = (prop: any): string => {
  return extractPlainText(prop["Section"]);
};
const pageToC = (prop: any): boolean => {
  return isChecked(prop["ToC"]);
};
const pageLegacyAlert = (prop: any): boolean => {
  return isChecked(prop["LegacyAlert"]);
};
const pageSlug = (prop: any): string => {
  const slug = extractPlainText(prop["Slug"]);
  return urlize(slug);
};
const pageUrl = (prop: any): string => {
  const url = extractPlainText(prop["Url"]);
  return urlize(url);
};
const pageDescription = (prop: any): string => {
  return extractPlainText(prop["Description"]);
};

const extractPlainText = (prop: any): string => {
  if (prop["title"]) {
    return prop["title"][0]["plain_text"];
  } else if (prop["rich_text"] && prop["rich_text"].length === 1) {
    return prop["rich_text"][0]["plain_text"];
  } else if (prop["select"]) {
    return prop["select"]["name"];
  }
  return "";
};

const extractMultiValues = (prop: any): string[] => {
  let values: string[] = [];
  if (prop["multi_select"]) {
    const tags: any[] = prop["multi_select"];
    values = tags.map((tag) => tag["name"]);
    return values;
  }
  return [""];
};

const extractDateTime = (prop: any): string => {
  if (prop["date"]) {
    return prop["date"]["start"];
  }
  return "";
};

const extractExternalUrl = (prop: any): string => {
  if (!prop["Image"]) {
    return "";
  }
  if (prop["Image"]["files"].length === 0) {
    return "";
  }

  const file = prop["Image"]["files"][0];
  if (file["type"] === "external") {
    return file["external"]["url"];
  }

  return "";
};

const isChecked = (prop: any): boolean => {
  if (prop["type"] === "checkbox") {
    return prop["checkbox"];
  }
  return false;
};

const hasPlainText = (prop: any): boolean => {
  if (prop["rich_text"].length > 0) {
    return true;
  }
  return false;
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
