const sqlite3 = require("sqlite3").verbose();

const DATABASE_PATH = "./db/crons.db";
let database;

/**
 * call this function to initialise the database connection
 */
exports.init = () => {
  return new Promise((resolve, reject) => {
    console.log("+initDB");

    const resultFun = err => {
      if (err) {
        console.error("-initDB: error: " + err.message);
        database = void 0;
        return reject();
      }

      console.log("-initDB: Connection to database successfully established!");

      // check and create the table

      return resolve();
    };

    database = new sqlite3.Database(
      DATABASE_PATH,
      sqlite3.OPEN_READWRITE,
      resultFun
    );
  });
};

/**
 * Returns Promise.
 * - resolve: return records
 * - reject: return nothing
 */
exports.getAllRecordsFromDB = () => {
  return new Promise((resolve, reject) => {
    console.log("+getAllRecordsFromDB");

    const sqlQuery = `SELECT
              CHAT_ID as chatId,
              ENTRY_ID as entryId,
              CRON_EXPRESSION as cronExpression,
              MESSAGE as message
        FROM CRON_MESSAGES`;

    const resultFun = (err, rows) => {
      if (err) {
        console.error("-getAllRecordsFromDB: error: " + err.message);
        return reject();
      }

      console.log("-getAllRecordsFromDB: rows: " + JSON.stringify(rows));
      return resolve(rows.slice());
    };

    database.all(sqlQuery, resultFun);
  });
};

/**
 * Returns Promise. Returns the list of the elements for defined chat (by chatId parameter)
 * @param {Number} chatId
 */
exports.getRecordsByChatId = chatId => {
  return new Promise((resolve, reject) => {
    console.log("+getRecordsByChatId: " + chatId);

    const sqlQuery = `SELECT
                CHAT_ID as chatId,
                ENTRY_ID as entryId,
                CRON_EXPRESSION as cronExpression,
                MESSAGE as message
      FROM CRON_MESSAGES
      WHERE CHAT_ID = ?`;

    const resultFun = (err, rows) => {
      if (err) {
        console.error("-getRecordsByChatId: error:" + err.message);
        return reject();
      }

      console.log(
        "-getRecordsByChatId: rows retrieved: " + JSON.stringify(rows)
      );
      return resolve(rows.slice());
    };

    database.all(sqlQuery, [chatId], resultFun);
  });
};

/**
 * Returns Promise. Removes elements for the specified chat (be chatId parameter)
 * @param {Number} chatId
 */
exports.removeRecordByChatId = chatId => {
  return new Promise((resolve, reject) => {
    console.log("+removeRecordByChatId: " + chatId);

    var resultFunc = err => {
      if (err) {
        console.error("-removeRecordByChatId: error:" + err.message);
        return reject();
      }

      console.log(
        "-removeRecordByChatId: successfully deleted for chatId: " + chatId
      );

      return resolve();
    };

    const sqlQuery = `DELETE
      FROM CRON_MESSAGES
      WHERE CHAT_ID = ?`;

    database.all(sqlQuery, [chatId], resultFunc);
  });
};

/**
 * Returns Promise. Deletes the element with defined entryId.
 * @param {String} entryId
 */
exports.removeRecordByEntryId = entryId => {
  return new Promise((resolve, reject) => {
    console.log("+removeRecordByEntryId: " + entryId);

    var resultFunc = err => {
      if (err) {
        console.error("-removeRecordByEntryId: error:" + err.message);
        return reject();
      }

      console.log(
        "-removeRecordByEntryId: successfully deleted for entryId: " + entryId
      );

      return resolve();
    };

    const sqlQuery = `DELETE
      FROM CRON_MESSAGES
      WHERE ENTRY_ID = ?`;

    database.all(sqlQuery, [entryId], resultFunc);
  });
};

/**
 * Returns Promise. Add new record to the database.
 * @param {Object} recordToAdd
 */
exports.addNewRecord = recordToAdd => {
  return new Promise((resolve, reject) => {
    console.log("+addNewRecord: " + JSON.stringify(recordToAdd));

    const sqlQuery = `INSERT INTO CRON_MESSAGES(CHAT_ID, ENTRY_ID, CRON_EXPRESSION, MESSAGE)
          VALUES (?,?,?,?)`;

    var valuesToInsertAsArray = [];
    var keysToInsert = ["chatId", "entryId", "cronExpression", "message"];

    keysToInsert.forEach(elem => {
      valuesToInsertAsArray.push(recordToAdd[elem]);
    });

    const resultFun = err => {
      if (err) {
        console.error("-addNewRecord: error:" + err.message);
        return reject();
      }

      console.log("+addNewRecord: row has been inserted!");
      return resolve();
    };

    database.run(sqlQuery, valuesToInsertAsArray, resultFun);
  });
};
