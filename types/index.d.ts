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
  fetchInterval: number;
};

type ModelPageMeta = {
  pageId: string;
  createdTime: string;
  lastEditedTime: string;
  _id: string;
};

type sys = {
  pageId: string;
  createdTime: string;
  lastEditedTime: string;
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
      lastmod?: string;
      featured_image?: string;
      images?: string[];
      slug?: string;
      section?: string;
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
    };

type Task = {
  pageId: string;
  status: string;
  title: string;
};
