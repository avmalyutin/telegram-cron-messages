const logger = require("./components/logger_manager")("main");
const dbManager = require("./components/db_manager");
const teleManager = require("./components/telegram_manager");

logger.info("Starting the application....");
checkAndInitDatabase().then(() => {
  // register telegram manager
  logger.info("initialising the telegram manager....");
  checkAndInitTelegramManager();
});

function checkAndInitDatabase() {
  return new Promise((resolve, reject) => {
    var dbInitSuccess = () => {
      logger.info("database has been successfully initialised");
      return resolve();
    };

    var dbInitError = (error) => {
      logger.error("error initializing database -> exit with code 220");
      logger.error(error);
      process.exit(220);
    };

    logger.info("initialising the database....");
    dbManager.init().then(dbInitSuccess, dbInitError);
  });
}

function checkAndInitTelegramManager() {
  try {
    teleManager.init();
  } catch (e) {
    logger.error(e);
    logger.info(
      "index: error initializing telegram manager -> exit with code 221"
    );
    process.exit(221);
  }
  logger.info("index: telegram manager has been successfully initialised");
}