import Nedb from "@seald-io/nedb";
import { log, LogTypes } from "../logger";

// Cache the last modified date of a Notion's page with
// Notion's pageId as the primary key.

const LOCAL_DATABASE_NAME = "./.notion-hugo-cache/image_map.cache";

const db = new Nedb({
  filename: LOCAL_DATABASE_NAME,
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
  let docs: ModelImageMeta[];
  try {
    docs = await db.findAsync({ imageId: imageId });
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in findAsync: imageMap: ${error}`
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

  try {
    await db.insertAsync(data);
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in insertAsync: imageMap: ${error}`
    );
  }

  return await findByImageId(imageId);
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
  try {
    await db.updateAsync(query, data, options);
  } catch (error) {
    throw new Error(
      `Unexpected error occurred in updateAsync: imageMap: ${error}`
    );
  }

  return await findByImageId(imageId);
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
