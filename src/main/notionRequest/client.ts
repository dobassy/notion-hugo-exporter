import { Client, LogLevel } from "@notionhq/client";

const loglevel = LogLevel.ERROR;

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: loglevel,
});

export default notion;
