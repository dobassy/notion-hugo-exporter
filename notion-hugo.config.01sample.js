module.exports = {
  directory: "content_notion",
  concurrency: 1,

  // saveAwsImageDirectory: null,
  saveAwsImageDirectory: "tmp/downloads",

  downloadImageCallback: null,

  customTransformerCallback: null,

  authorName: "Overridden author",

  // [Optional] setting.
  customProperties: [
    ["ToC", "boolean"],
    ["AdditionalDescription", "text"],
  ],
};
