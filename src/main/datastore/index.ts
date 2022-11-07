import Nedb from "@seald-io/nedb";
import { log, LogTypes } from "../logger";

// Cache the last modified date of a Notion's page with
// Notion's pageId as the primary key.

const db = new Nedb({
  filename: "./.notion-hugo-cache/pages.cache",
  autoload: true,
  corruptAlertThreshold: 0,
});

export const findByPageId = async (
  pageId: string
): Promise<ModelPageMeta | null> => {
  let docs: ModelPageMeta[];
  try {
    docs = await db.findAsync({ pageId: pageId });
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in findAsync: pageCache: ${error}`
    );
  }

  if (docs && docs.length === 0) {
    return null;
  }

  if (docs && docs.length > 1) {
    log(
      "More than 1 record was found. Check the database unexpectedly.",
      LogTypes.error
    );
    throw new Error("Invalid query");
  }

  return docs[0];
};

export const createPage = async (sys: sys): Promise<ModelPageMeta | null> => {
  const modelPage: ModelPageMeta | null = await findByPageId(sys.pageId);
  if (modelPage && modelPage.pageId) {
    log(`Record already exists: pageId: ${sys.pageId}`, LogTypes.warn);
    return null;
  }

  try {
    await db.insertAsync(sys);
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in findAsync: pageCache: ${error}`
    );
  }

  return await findByPageId(sys.pageId);
};

export const updatePage = async (
  newSys: sys
): Promise<ModelPageMeta | null> => {
  const modelPage: ModelPageMeta | null = await findByPageId(newSys.pageId);
  if (!modelPage) {
    log(
      `Record Not Found: Skip record update process: pageId: ${newSys.pageId}`,
      LogTypes.warn
    );
    return null;
  }

  const query = {
    pageId: modelPage.pageId,
  };
  const options = {
    multi: false,
    upsert: false,
  };

  try {
    await db.updateAsync(query, newSys, options);
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in findAsync: pageCache: ${error}`
    );
  }

  return await findByPageId(newSys.pageId);
};

export const deletePage = async (pageId: string): Promise<boolean> => {
  const modelPage: ModelPageMeta | null = await findByPageId(pageId);
  if (!modelPage) {
    log(
      `Record Not Found: Skip record update process: pageId: ${pageId}`,
      LogTypes.warn
    );
    return false;
  }

  const query = {
    pageId: modelPage.pageId,
  };

  try {
    await db.removeAsync({ query }, {});
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in findAsync: pageCache: ${error}`
    );
  }

  return true;
};
