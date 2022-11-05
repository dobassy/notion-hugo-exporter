interface CliArgs {
  clean: boolean;
  force: boolean;
  verbose: boolean;
  server: boolean;
}

type NotionHugoConfig = {
  directory: string;
  concurrency?: number;
  saveAwsImageDirectory?: string;
  downloadImageCallback?: (filepath: string) => void;
  customTransformerCallback?: (n2m: any) => void;
  fetchInterval: number;
  authorName?: string;
  s3ImageUrlWarningEnabled?: boolean;
  s3ImageUrlReplaceEnabled?: boolean;
  s3ImageConvertToWebpEnalbed?: boolean;
  customProperties?: string[][];
  useOriginalConverter?: boolean;
};

type ModelPageMeta = {
  pageId: string;
  createdTime: string;
  lastEditedTime: string;
  _id: string;
};

type ModelImageMeta = {
  imageId: string;
  filePath: string;
};

type sys = {
  pageId: string;
  createdTime: string;
  lastEditedTime: string;
  propFilepath?: string;
};

type frontMatter =
  | {
      sys: sys;
      date: string;
      title: string;
      description: string;
      tags: string[];
      categories: string[];
      toc: boolean;
      author: string;
      legacy_alert: boolean;
      draft: boolean;
      url: string;
      slug?: string;
      lastmod?: string;
      featured_image?: string;
      images?: string[];
      section?: string;
      linkTitle?: string;
      weight?: number;
    }
  | {
      sys: sys;
      date: string;
      title: string;
      description: string;
      tags: string[];
      categories: string[];
      toc: boolean;
      author: string;
      legacy_alert: boolean;
      draft: boolean;
      url?: string;
      slug: string;
      lastmod?: string;
      featured_image?: string;
      images?: string[];
      section?: string;
      linkTitle?: string;
      weight?: number;
    };

type frontmatterOptions = {
  author: string;
};

type Task = {
  pageId: string;
  status: string;
  title: string;
};
