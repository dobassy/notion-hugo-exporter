const downloadImageCallback = (filepath) => {
  console.log(`Hello, I'm in a Callabck: filepath ${filepath}`);
  uploadImageToWordpress(filepath);
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
  axios
    .post(wp_url, form, config)
    .then((res) => {
      console.log(
        `Upload completed: source_url: ${res.data.source_url} (Media ID: ${res.data.id})`
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  directory: "content_notion",
  concurrency: 1,

  saveAwsImageDirectory: "tmp/downloads",

  downloadImageCallback: downloadImageCallback,
};
