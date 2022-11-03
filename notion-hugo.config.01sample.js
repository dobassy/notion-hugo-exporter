module.exports = {
  directory: "content_notion",
  concurrency: 1,

  // saveAwsImageDirectory: null,
  saveAwsImageDirectory: "tmp/downloads",

  // s3ImageUrlWarningEnabled: false,

  // s3ImageUrlReplaceEnabled: true,

  // s3ImageConvertToWebpEnalbed: true,

  downloadImageCallback: null,

  customTransformerCallback: null,

  authorName: "Overridden author",

  // [Optional] setting, If you need.
  // customProperties: [
  //   ["ToC", "boolean"],
  //   ["AdditionalDescription", "text"],
  // ],
};
