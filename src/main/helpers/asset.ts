// Hogo puts static content into 'static/' directory, but does not include
// the 'static' hierarchy after it is published in the URL. So remove the '/satic' string.
export const publicPath = (imageMeta: ModelImageMeta): string => {
  const filePath = imageMeta.filePath;
  if (filePath.match(/^static\/.+/)) {
    return filePath.replace(/^static/, "");
  }
  return filePath;
};
