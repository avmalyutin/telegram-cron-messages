/** write the proper tests here for database */

const dbManager = require("./db_manager");

// check the db connection
let dbInitSuccess = () => {
  console.log("test_db: success!");

  printAllEntries();
};

let dbInitError = () => {
  console.log("test_db: error!");
};

dbManager.initDB().then(dbInitSuccess, dbInitError);

let printAllEntries = () => {
  let getSuccess = entries => {
    console.log("test_db: entries retrieved: " + JSON.stringify(entries));
  };

  let getError = entries => {
    console.log("test_db: error getting entries!");
  };

  var newRecord = {
    chatId: 3234,
    entryId: "DDL",
    cronExpression: "* * * * *",
    message: "some message 123"
  };

  dbManager.removeRecordByEntryId("DDL").then(getSuccess, getError);
};
