import Nedb from "@seald-io/nedb";
import { log, LogTypes } from "../logger";

// Cache the last modified date of a Notion's page with
// Notion's pageId as the primary key.

const db = new Nedb({
  filename: "./.notion-hugo-cache/image_map.cache",
  autoload: true,
  corruptAlertThreshold: 0,
});

type imageMapParams = {
  imageId: string;
  filePath: string;
};

export const findByImageId = async (
  imageId: string
): Promise<ModelImageMeta | null> => {
  return new Promise<ModelImageMeta | null>((resolve, reject) => {
    db.find({ imageId: imageId }, (err: any, docs: ModelImageMeta[]) => {
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

export const createImageMap = async (
  imageId: string,
  filePath: string
): Promise<ModelImageMeta | null> => {
  const modelPage: ModelImageMeta | null = await findByImageId(imageId);
  if (modelPage && modelPage.imageId) {
    log(`Record already exists: imageId: ${imageId}`, LogTypes.info);
    return null;
  }

  const data: imageMapParams = { imageId: imageId, filePath: filePath };
  return new Promise<ModelImageMeta | null>(async (resolve, reject) => {
    db.insert(data, (err, _doc: any) => {
      if (err) {
        return reject(err);
      }
    });

    resolve(await findByImageId(imageId));
  });
};

export const updateImageMap = async (
  imageId: string,
  filePath: string
): Promise<ModelImageMeta | null> => {
  const modelPage: ModelImageMeta | null = await findByImageId(imageId);
  if (!modelPage) {
    log(
      `Record Not Found: Skip record update process: pageId: ${imageId}`,
      LogTypes.warn
    );
    return null;
  }

  const query = {
    imageId: modelPage.imageId,
  };
  const options = {
    multi: false,
    upsert: false,
  };

  const data: imageMapParams = { imageId: imageId, filePath: filePath };
  return new Promise<ModelImageMeta | null>(async (resolve, reject) => {
    db.update(query, data, options, (err, _numReplaced) => {
      if (err) {
        return reject(err);
      }
    });

    resolve(await findByImageId(imageId));
  });
};

export const createOrUpdateImageMap = async (
  imageId: string,
  filePath: string
): Promise<ModelImageMeta | null> => {
  const modelPage: ModelImageMeta | null = await findByImageId(imageId);

  if (modelPage && modelPage.imageId) {
    return updateImageMap(imageId, filePath);
  } else {
    return createImageMap(imageId, filePath);
  }
};
