import { getArticle } from "./pageClient";
import {
  pageTitle,
  pageAuthor,
  pageDraft,
  pagePublishedAt,
  pageUpdatedAt,
  pageTags,
  pageCategory,
  pageSection,
  pageSlug,
  pageUrl,
  pageDescription,
  pageFilepath,
  pageLinkTitle,
  pageWeight,
  extractExternalUrl,
  hasPlainText,
  customPropery,
} from "./property";
import { log, LogTypes } from "../logger";

// Store all metadata in frontMatter
// Values that are not directly needed to create Hugo pages are stored in the
// under 'sys' key (e.g. pageId, Page modification date, etc...)
// Note that: Notion's Page modification date (as 'last_edited_time') is different
//            from the last update date of Hugo's page ('lastmod')
export const getPageFrontmatter = async (
  pageId: string,
  options: frontmatterOptions,
  customProperties: string[][] | undefined
): Promise<frontMatter> => {
  log(`[Info] [pageId: ${pageId}] Fetch from Notion API`);
  const pageMeta = await getArticle(pageId);
  if (pageMeta["archive"]) {
    log(pageMeta);
    throw new Error(
      `The page property is "archive", but the status is "isPublished".
      Make sure the publishing settings for this article are correct.`
    );
  }
  const properties = pageMeta["properties"];

  log(properties, LogTypes.debug);

  let frontMatter: any = {
    sys: {
      pageId: pageId,
      createdTime: pageMeta["created_time"],
      lastEditedTime: pageMeta["last_edited_time"],
    },
    title: pageTitle(properties),
    date: pagePublishedAt(properties),
    description: pageDescription(properties),
    tags: pageTags(properties),
    categories: pageCategory(properties),
    author: pageAuthor(properties, options),
    // legacy_alert: pageLegacyAlert(properties),
    draft: pageDraft(properties),
  };

  if (hasPlainText(properties["Url"])) {
    frontMatter["url"] = pageUrl(properties);
  } else if (hasPlainText(properties["Slug"])) {
    frontMatter["slug"] = pageSlug(properties);
  } else {
    throw new Error(
      `One of the "Url" and "Slug" page properties must be defined.`
    );
  }

  // Property for forcing the exported `.md` file name.
  if (pageFilepath(properties)) {
    frontMatter["sys"]["propFilepath"] = pageFilepath(properties);
  }

  if (pageSection(properties)) {
    frontMatter["section"] = pageSection(properties);
  }

  if (pageUpdatedAt(properties)) {
    frontMatter["lastmod"] = pageUpdatedAt(properties);
  }

  if (extractExternalUrl(properties)) {
    frontMatter["featured_image"] = extractExternalUrl(properties);
    frontMatter["images"] = [extractExternalUrl(properties)];
  }

  // Properties expected to be used by Docsy theme, etc
  //   linkTitle:
  //   weight:
  if (pageLinkTitle(properties)) {
    frontMatter["linkTitle"] = pageLinkTitle(properties);
  }

  if (pageWeight(properties)) {
    frontMatter["weight"] = pageWeight(properties);
  }

  if (customProperties) {
    for (const customProperty of customProperties) {
      const cProp = customProperty[0];
      const cType = customProperty[1];
      frontMatter[cProp] = customPropery(properties, cProp, cType);
    }
  }

  return frontMatter as frontMatter;
};
