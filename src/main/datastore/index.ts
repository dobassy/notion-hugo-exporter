import Nedb from "@seald-io/nedb";
import { log, LogTypes } from "../logger";

// Cache the last modified date of a Notion's page with
// Notion's pageId as the primary key.

const db = new Nedb({
  filename: "./.notion-hugo-cache/pages.cache",
  autoload: true,
  corruptAlertThreshold: 0,
});

export const findByPageId = (pageId: string): Promise<ModelPageMeta | null> => {
  return new Promise<ModelPageMeta | null>((resolve, reject) => {
    db.find({ pageId: pageId }, (err: any, docs: ModelPageMeta[]) => {
      if (err) {
        return reject(new Error(err));
      }

      if (docs && docs.length === 0) {
        return resolve(null);
      }

      if (docs && docs.length > 1) {
        log(
          "More than 1 record was found. Check the database unexpectedly.",
          LogTypes.error
        );
        reject("Invalid query");
      }

      return resolve(docs[0]);
    });
  });
};

export const createPage = async (sys: sys): Promise<ModelPageMeta | null> => {
  const modelPage: ModelPageMeta | null = await findByPageId(sys.pageId);
  if (modelPage && modelPage.pageId) {
    log(`Record already exists: pageId: ${sys.pageId}`, LogTypes.warn);
    return null;
  }

  return new Promise<ModelPageMeta | null>(async (resolve, reject) => {
    db.insert(sys, (err, doc: sys) => {
      if (err) {
        return reject(err);
      }
    });

    const modelPage = await findByPageId(sys.pageId);
    resolve(modelPage);
  });
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

  return new Promise<ModelPageMeta | null>(async (resolve, reject) => {
    db.update(query, newSys, options, (err, numReplaced) => {
      if (err) {
        return reject(err);
      }
    });

    const modelPage = await findByPageId(newSys.pageId);
    resolve(modelPage);
  });
};

export const deletePage = async (pageId: string): Promise<boolean | null> => {
  const modelPage: ModelPageMeta | null = await findByPageId(pageId);
  if (!modelPage) {
    log(
      `Record Not Found: Skip record update process: pageId: ${pageId}`,
      LogTypes.warn
    );
    return null;
  }

  const query = {
    pageId: modelPage.pageId,
  };
  return new Promise<boolean | null>(async (resolve, reject) => {
    db.remove(query, {}, (err, numOfDocs) => {
      log(`delete documents: ${numOfDocs}`);
      if (err) {
        return reject(err);
      }
    });

    resolve(true);
  });
};

export default db;
