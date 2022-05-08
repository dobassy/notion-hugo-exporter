import * as yargs from "yargs";
import { fetchDataFromNotion } from "./main";
import { loadConfig } from "./main/config";
import { initLogger, LogTypes } from "./main/logger";
import { runServer } from "./server";

yargs
  .options({
    clean: { type: "boolean", default: false },
    force: { type: "boolean", default: false, alias: "F" },
    verbose: { type: "boolean", default: false },
    server: { type: "boolean", default: false, alias: "S" },
  })
  .describe({
    clean: "Delete all output directories",
    force: "Ignore the timestamp cache and get the remote data",
    verbose: "Show detail logs",
    server: "Detects page changes in Notion's blog database and retrives data",
  })
  .usage("Usage: notion-hugo [flags]");

const argv = yargs.argv as unknown as CliArgs;

const initialize = async (): Promise<unknown> => {
  const log = initLogger();

  if (!process.env.NOTION_TOKEN) {
    log("You must set the NOTION_TOKEN. terminated.");
    return null;
  }

  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    log("You must set the NOTION_BLOG_DATABASE_ID. terminated.");
    return null;
  }

  loadConfig(".").then(async (config) => {
    if (config === false) {
      throw new Error(
        `There is an error in your config file, or it doesn't exits.\n`
      );
    }

    log(`[Info] Exported directory: ${config.directory}`, LogTypes.info);

    if (argv.clean) {
      log("Not implemented yet");
      return null;
    }
    await fetchDataFromNotion(config, argv);
    if (argv.server) {
      return runServer(config, argv);
    }
  });
};

initialize();
