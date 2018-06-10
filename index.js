const dbManager = require("./components/db_manager");
const teleManager = require("./components/telegram_manager");

console.log("index: checking the database....");
checkAndInitDatabase().then(() => {
  // register telegram manager
  checkAndInitTelegramManager();
});

// other functions
function checkAndInitDatabase() {
  return new Promise((resolve, reject) => {
    var dbInitSuccess = () => {
      console.log("index: database has been successfully initialised");
      return resolve();
    };

    var dbInitError = () => {
      console.log("index: error initializing database -> exit with code 220");
      process.exit(220);
    };

    dbManager.init().then(dbInitSuccess, dbInitError);
  });
}

function checkAndInitTelegramManager() {
  try {
    teleManager.init();
  } catch (e) {
    console.log(
      "index: error initializing telegram manager -> exit with code 221"
    );
    process.exit(221);
  }
  console.log("index: telegram manager has been successfully initialised");
}