import notion from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints.d";
import { ListBlockChildrenResponseResults } from "notion-to-md/build/types";

export const getArticle = async (pageId: string) => {
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
