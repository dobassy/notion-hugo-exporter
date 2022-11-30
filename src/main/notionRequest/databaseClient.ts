/* eslint-disable @typescript-eslint/no-explicit-any */
import { log } from "../logger";
import notion from "./client";

const databaseId = process.env.NOTION_BLOG_DATABASE_ID;

const isAllIncludes = (searches: string[], targets: string[]) =>
  searches.every((el: string) => targets.includes(el));

export const getDtabaseMeta = async () => {
  if (!databaseId) throw new Error("Notion databaseId does not defined.");
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response;
};

export const getPublishedArticles = async (): Promise<any[]> => {
  if (!databaseId) throw new Error("Notion databaseId does not defined.");
  const pages = [];
  let cursor = undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { results, next_cursor }: { results: any[]; next_cursor: any } =
      await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        filter: {
          property: "isPublished",
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: "Created",
            direction: "ascending",
          },
        ],
      });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }

  return pages;
};

// Check if Notion Database Properties meet the required blogging requirements
export const checkRequiredPropertiesExists = async () => {
  const response = await getDtabaseMeta();
  const keys = Object.keys(response["properties"]);

  const requiredProperties = [
    "isPublished",
    "PublishedAt",
    "UpdatedAt",
    "Tags",
    "Category",
    "ToC",
    "LegacyAlert",
    "Slug",
    "Url",
  ];
  if (isAllIncludes(requiredProperties, keys)) {
    return keys;
  } else {
    log(keys);
    throw new Error(
      'To generate the Hugo\'s front matter, you need prepare the Notion properties: Requries ["isPublished", "PublishedAt", "UpdatedAt", "Tags", "Category", "ToC", "legacyAlert", "Slug", "Url"]'
    );
  }
};
