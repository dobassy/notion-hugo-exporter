import { urlize } from "../helpers/string";

export const pageTitle = (prop: any): string => {
  return extractPlainText(prop["Name"]);
};
export const pageAuthor = (prop: any, options: frontmatterOptions): string => {
  const defaultAuthor = options.author;
  if (prop["Author"] === undefined) {
    return defaultAuthor;
  }
  const author = extractPlainText(prop["Author"]);
  if (author) {
    return author;
  } else {
    return defaultAuthor;
  }
};
export const pageDraft = (prop: any): boolean => {
  if (prop["isDraft"] !== undefined) {
    return isChecked(prop["isDraft"]);
  }
  return false;
};
export const pagePublishedAt = (prop: any): string => {
  return extractDateTime(prop["PublishedAt"]);
};
export const pageUpdatedAt = (prop: any): string => {
  return extractDateTime(prop["UpdatedAt"]);
};
export const pageTags = (prop: any): string[] => {
  return extractMultiValues(prop["Tags"]);
};
export const pageCategory = (prop: any): string[] => {
  const category = extractPlainText(prop["Category"]);
  if (category === "") {
    return [];
  }

  return [category];
};
export const pageSection = (prop: any): string => {
  return extractPlainText(prop["Section"]);
};
export const pageToC = (prop: any): boolean => {
  return isChecked(prop["ToC"]);
};
export const pageLegacyAlert = (prop: any): boolean => {
  return isChecked(prop["LegacyAlert"]);
};
export const pageSlug = (prop: any): string => {
  const slug = extractPlainText(prop["Slug"]);
  return urlize(slug);
};
export const pageUrl = (prop: any): string => {
  const url = extractPlainText(prop["Url"]);
  return urlize(url);
};
export const pageDescription = (prop: any): string => {
  return extractPlainText(prop["Description"]);
};

export const pageFilepath = (prop: any): string | null => {
  if (prop["filepath"] === undefined) {
    return null;
  }
  return extractPlainText(prop["filepath"]);
};
export const pageLinkTitle = (prop: any): string | null => {
  if (prop["linkTitle"] === undefined) {
    return null;
  }
  return extractPlainText(prop["linkTitle"]);
};
export const pageWeight = (prop: any): string | null => {
  if (prop["weight"] === undefined) {
    return null;
  }
  return extractNumber(prop["weight"]);
};

const extractPlainText = (prop: any): string => {
  if (prop["title"]) {
    return prop["title"][0]["plain_text"];
  } else if (prop["rich_text"] && prop["rich_text"].length === 1) {
    return prop["rich_text"][0]["plain_text"];
  } else if (prop["select"]) {
    return prop["select"]["name"];
  }
  return "";
};

const extractNumber = (prop: any): string => {
  if (prop["number"]) {
    return prop["number"];
  }
  return "";
};

const extractMultiValues = (prop: any): string[] => {
  let values: string[] = [];
  if (prop["multi_select"]) {
    const tags: any[] = prop["multi_select"];
    values = tags.map((tag) => tag["name"]);
    return values;
  }
  return [""];
};

const extractDateTime = (prop: any): string => {
  if (prop["date"]) {
    return prop["date"]["start"];
  }
  return "";
};

export const extractExternalUrl = (prop: any): string => {
  if (!prop["Image"]) {
    return "";
  }
  if (prop["Image"]["files"].length === 0) {
    return "";
  }

  const file = prop["Image"]["files"][0];
  if (file["type"] === "external") {
    return file["external"]["url"];
  }

  return "";
};

export const hasPlainText = (prop: any): boolean => {
  if (prop["rich_text"].length > 0) {
    return true;
  }
  return false;
};
const isChecked = (prop: any): boolean => {
  if (prop["type"] === "checkbox") {
    return prop["checkbox"];
  }
  return false;
};
