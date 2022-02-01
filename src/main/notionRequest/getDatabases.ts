import { log } from "../logger";
import notion from "./client";
import type { ListDatabasesResponse } from "@notionhq/client/build/src/api-endpoints.d";

const databaseId = process.env.NOTION_BLOG_DATABASE_ID;

const isAllIncludes = (searches: string[], targets: string[]) =>
  searches.every((el: string) => targets.includes(el));

export const getDtabaseMeta = async () => {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response;
};

export const getPublishedArticles =
  async (): Promise<ListDatabasesResponse> => {
    const response = await notion.databases.query({
      database_id: databaseId,
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
    return response;
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
