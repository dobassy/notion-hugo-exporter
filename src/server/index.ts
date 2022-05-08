/* ================================================================================
  This code is based on Notion SDK example.
  https://github.com/makenotion/notion-sdk-js/blob/main/examples/database-email-update/index.js.
================================================================================ */

import { getPublishedArticles } from "../main/notionRequest/getDatabases";
import { fetchDataFromNotion } from "../main";

const taskPageIdToStatusMap: any = {};
/**
 * Local map to store task pageId to its last status.
 */
type pageIdStatus = {
  [pageId: string]: string;
};

const findAndSendEmailsForUpdatedTasks = async (): Promise<boolean> => {
  // Get the tasks currently in the database.
  console.log("\nFetching tasks from Notion DB...");
  const currentTasks = await getTasksFromNotionDatabase();

  // Return any tasks that have had their status updated.
  const updatedTasks = findUpdatedTasks(currentTasks);
  if (!updatedTasks.length) {
    console.log("\nNothing has been updated");
    return false;
  }

  console.log(`[Info] Found ${updatedTasks.length} updated tasks.`);
  for (const task of updatedTasks) {
    taskPageIdToStatusMap[task.pageId] = task.status;
    console.log(`[Info] Detect Changes: ${task.pageId} - ${task.title}`);
  }
  return true;
};

const getTasksFromNotionDatabase = async (): Promise<Task[]> => {
  const pages = await getPublishedArticles();
  console.log(`${pages.length} pages successfully fetched.`);
  return pages.map((page) => {
    const lastEditedTime = page.last_edited_time;
    const status = lastEditedTime ? lastEditedTime : "No Time";
    const title = page.properties["Name"].title
      .map(({ plain_text }: any) => plain_text)
      .join("");
    return {
      pageId: page.id,
      status,
      title,
    };
  });
};

/**
 * Compares task to most recent version of task stored in taskPageIdToStatusMap.
 * Returns any tasks that have a different status than their last version.
 */
const findUpdatedTasks = (currentTasks: Task[]): Task[] => {
  return currentTasks.filter((currentTask) => {
    const previousStatus = getPreviousTaskStatus(currentTask);
    return currentTask.status !== previousStatus;
  });
};

/**
 * Finds or creates task in local data store and returns its status.
 */
const getPreviousTaskStatus = ({
  pageId,
  status,
}: {
  pageId: string;
  status: string;
}): string => {
  // If this task hasn't been seen before, add to local pageId to status map.
  if (!taskPageIdToStatusMap[pageId]) {
    taskPageIdToStatusMap[pageId] = status;
  }
  return taskPageIdToStatusMap[pageId];
};

export const runServer = async (
  config: NotionHugoConfig,
  argv: CliArgs
): Promise<void> => {
  const setInitialTaskPageIdToStatusMap = async () => {
    const currentTasks: pageIdStatus[] = await getTasksFromNotionDatabase();
    for (const { pageId, status } of currentTasks) {
      taskPageIdToStatusMap[pageId] = status;
    }
  };

  const fetchInterval = config.fetchInterval
    ? config.fetchInterval * 1000
    : 30000;

  setInitialTaskPageIdToStatusMap().then(() => {
    console.log(`
    [Info] Notion's last updated time only recorded in 1 minute increments.
        Please note that updates in the same number of minutes cannot be detected.
        Youre setting: ${fetchInterval} msec`);
    setInterval(async () => {
      const hasUpdated = await findAndSendEmailsForUpdatedTasks();
      if (hasUpdated) {
        await fetchDataFromNotion(config, argv);
      }
    }, fetchInterval);
  });
};
