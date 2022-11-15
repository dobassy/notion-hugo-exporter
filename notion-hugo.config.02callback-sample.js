const downloadImageCallback = (filepath) => {
  console.log(`Hello, I'm in a Callabck: filepath ${filepath}`);
  return new Promise((resolve, reject) => {
    uploadImageToWordpress(filepath)
      .then((res) => {
        console.log(
          `Upload completed: source_url: ${res.data.source_url} (Media ID: ${res.data.id})`
        );

        return resolve(true);
      })
      .catch((err) => {
        return reject(
          new Error(`Failed to upload file ${filepath}: Details: ${err}`)
        );
      });
  });
};

const customTransformerCallback = (n2m) => {
  // Example 1: Convert Bookmark block to Hugo format shortcode: {{<blogcard "https://notion.so/">}}
  n2m.setCustomTransformer("bookmark", async (block) => {
    const { bookmark } = block;
    if (!bookmark?.url) return "";
    return `{{<blogcard "${bookmark.url}">}}`;
  });

  // Example 2: Convert YouTube URL to Hugo format shortcode: {{<youtube "abcdefg">}}
  n2m.setCustomTransformer("video", async (block) => {
    const { video } = block;
    if (video.type !== "external") return "";

    const youtoube = new RegExp(/youtube.com/);
    if (youtoube.test(video.external.url)) {
      const url = new URL(video.external.url);
      const video_id = url.searchParams.get("v");
      return `{{<youtube "${video_id}">}}`;
    }
    return `Video URL: ${video.external.url}`;
  });
};

const wp_username = "username";
const wp_password = "password";
const wp_url = "http://wordpress.example.com/wp-json/wp/v2/media";

const uploadImageToWordpress = (filepath) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const FormData = require("form-data");

  const form = new FormData();
  const file = fs.createReadStream(filepath);

  // Create a filename such as "e7b0d937-1643715807758-image.png"
  const filename = filepath.split("/").pop();
  const file_ext = filename.split(".").pop();
  const file_prefix = filename.split("-")[0];
  const datetime = new Date().getTime();
  const uploadFilename = `${file_prefix}-${datetime}-image.${file_ext}`;
  form.append("file", file, { filename: uploadFilename });

  const config = {
    headers: {
      ...form.getHeaders(),
    },
    auth: {
      username: wp_username,
      password: wp_password,
    },
  };

  console.log(`Uploaded... filename: ${uploadFilename}`);
  return axios.post(wp_url, form, config);
};

module.exports = {
  directory: "content_notion",
  concurrency: 1,

  saveAwsImageDirectory: "tmp/downloads",

  downloadImageCallback: downloadImageCallback,

  customTransformerCallback: customTransformerCallback,
};
