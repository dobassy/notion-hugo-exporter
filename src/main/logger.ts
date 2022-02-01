let isQuietMode = false;
let isVerboseMode = false;

const colorRed = "\x1b[31m";
const colorYellow = "\x1b[33m";
const colorGreen = "\x1b[32m";
const colorWhite = "\x1b[37m";

export enum LogCategories {
  default,
  verbose,
}

export enum LogTypes {
  log,
  info,
  warn,
  error,
}

export const error = (message: string) => {
  return new Error(`${colorRed}${message}${colorWhite}`);
};

export const log = (
  message: unknown,
  type: LogTypes = LogTypes.log,
  category: LogCategories = LogCategories.default
): void => {
  const emitLog = () => {
    switch (type) {
      case LogTypes.info:
        console.info(`${colorGreen}${message}${colorWhite}`);
        break;
      case LogTypes.warn:
        console.warn(`${colorYellow}${message}${colorWhite}`);
        break;
      case LogTypes.error:
        console.warn(`${colorRed}${message}${colorWhite}`);
        break;
      default:
        console.log(message);
        break;
    }
  };

  if (isQuietMode) {
    return;
  }
  // this isn't being used right now. But it's here in case I want to add a --verbose flag for the logs
  if (category === LogCategories.verbose && !isVerboseMode) {
    return;
  }
  emitLog();
};

/**
 * Initialize the logger state. Should run at the beginning of the app.
 */
export const initLogger = (
  quietMode = false,
  verboseMode = false
): typeof log => {
  isQuietMode = quietMode;
  isVerboseMode = verboseMode;
  return log;
};
