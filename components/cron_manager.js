const logger = require("./logger_manager")("cron_manager");
const CronJob = require("cron").CronJob;
const db_manager = require("./db_manager");

var bot;

var jobsMapByChatId = {};

exports.registerBotLink = botLink => {
  bot = botLink;
};

exports.registerCronsByStartup = () => {

  return new Promise((resolve, reject) => {

    logger.info("+registerCronsByStartup");

    db_manager.getAllRecordsFromDB().then(function (elems) {

      logger.info("+getAllRecordsFromDB: " + JSON.stringify(elems));

      elems.forEach(function (elem) {

        var job = new CronJob(elem.cronExpression, function () {
          bot.telegram.sendMessage(elem.chatId, elem.message);
        });

        // add to the corresponding array
        if (typeof jobsMapByChatId[elem.chatId] === 'undefined') {
          jobsMapByChatId[elem.chatId] = [];
        }

        jobsMapByChatId[elem.chatId].push({
          entryId: elem.entryId,
          job: job
        });

        job.start();

      });
      logger.info("+getAllRecordsFromDB");
    });
  });
};

exports.registerCronMessage = function (telegramContext) {
  return new Promise((resolve, reject) => {
    logger.info(
      "+registerCronMessage: context message is: " +
      JSON.stringify(telegramContext.message)
    );

    // get text
    var text = telegramContext.message.text;

    logger.info("registerCronMessage: the message text is:" + text);

    var obj = validateAndParseTelegramMessage(text);

    if (typeof obj === "undefined") {
      logger.info("The format of message is not valid");
      reject("not valid format of message");
    }

    // register the cron

    // https://github.com/kelektiv/node-cron

    var chatId = telegramContext.message.chat.id;

    logger.info("Start registering the cron...");

    var success = function (elementAdded) {

      var job = new CronJob(obj.cron, function () {
        bot.telegram.sendMessage(chatId, obj.message);
      });

      // add to the corresponding array
      if (typeof jobsMapByChatId[chatId] === 'undefined') {
        jobsMapByChatId[chatId] = [];
      }

      jobsMapByChatId[chatId].push({
        entryId: elementAdded.entryId,
        job: job
      });

      job.start();

      logger.info("Cron is registered!");

      resolve();
    };

    addCronToDababase(chatId, obj).then(success);
  });
};

var validateAndParseTelegramMessage = messageBody => {
  logger.info("+validateAndParseTelegramMessage: " + messageBody);

  var firstBracketIdx = messageBody.indexOf("[");
  var secondBracketIdx = messageBody.indexOf("]");

  if (firstBracketIdx === -1 || secondBracketIdx === -1) {
    logger.info(
      "-validateAndParseTelegramMessage: not valid message: firstBracketIdx: " +
      firstBracketIdx +
      " and secondBracketIdx: " +
      secondBracketIdx
    );
    return void 0;
  }

  logger.info(
    "validateAndParseTelegramMessage: firstBracketIdx: " + firstBracketIdx
  );
  logger.info(
    "validateAndParseTelegramMessage: secondBracketIdx: " + secondBracketIdx
  );

  var cron = messageBody.slice(firstBracketIdx + 1, secondBracketIdx);
  var message = messageBody.slice(secondBracketIdx + 1);

  logger.info("validateAndParseTelegramMessage: cron is: (" + cron + ")");

  logger.info("validateAndParseTelegramMessage: message is: (" + message + ")");

  var obj = {
    cron: cron,
    message: message
  };

  logger.info("+validateAndParseTelegramMessage:");
  return obj;
};


var validateAndParseDeleteMessage = messageBody => {
  logger.info("+validateAndParseDeleteMessage: " + messageBody);

  var firstBracketIdx = messageBody.indexOf("[");
  var secondBracketIdx = messageBody.indexOf("]");

  if (firstBracketIdx === -1 || secondBracketIdx === -1) {
    logger.info(
      "-validateAndParseDeleteMessage: not valid message: firstBracketIdx: " +
      firstBracketIdx +
      " and secondBracketIdx: " +
      secondBracketIdx
    );
    return void 0;
  }

  logger.info(
    "validateAndParseDeleteMessage: firstBracketIdx: " + firstBracketIdx
  );
  logger.info(
    "validateAndParseDeleteMessage: secondBracketIdx: " + secondBracketIdx
  );

  var indent = messageBody.slice(firstBracketIdx + 1, secondBracketIdx);

  return indent;

}

var addCronToDababase = (chatId, obj) => {
  return new Promise((resolve, reject) => {
    logger.info(
      "+addCronToDababase: " + chatId + " and obj is: " + JSON.stringify(obj)
    );

    var successGet = messages => {
      logger.info("addCronToDababase: successGet: " + JSON.stringify(messages));

      var ids = messages.map(elem => {
        return elem.entry_id;
      });

      logger.info("addCronToDababase: successGet: ids: " + JSON.stringify(ids));

      var newId;

      do {
        newId = makeid(3);
      } while (ids.indexOf(newId) !== -1);

      var elemToAdd = {
        chatId: chatId,
        entryId: newId,
        cronExpression: obj.cron,
        message: obj.message
      };

      var addSuccess = () => {
        logger.info("addCronToDababase: addSuccess:");
        resolve(elemToAdd);
      };

      db_manager.addNewRecord(elemToAdd).then(addSuccess);
    };

    db_manager.getAllRecordsFromDB().then(successGet);
  });
};

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function makeid(size) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < size; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.getRegisteredCronMessages = () => {
  return db_manager.getAllRecordsFromDB();
};


exports.removeRegisteredMessage = (ctx) => {

  logger.info(
    "+removeRegisteredMessage: context message is: " +
    JSON.stringify(ctx.message)
  );

  // get text
  var text = ctx.message.text;

  logger.info("removeRegisteredMessage: the message text is:" + text);

  var obj = validateAndParseDeleteMessage(text);

  if (typeof obj === "undefined") {
    logger.info("removeRegisteredMessage: The format of message is not valid");
    return;
  }

  // register the cron

  // https://github.com/kelektiv/node-cron

  var chatId = ctx.message.chat.id;

  logger.info("Start removing the cron: chatId: " + chatId + " and obj: " + obj);


  db_manager.removeRecordByEntryId(obj).then(function () {

    var arrayOfJobs = jobsMapByChatId[chatId + ""];

    logger.info("Array of jobs size: " + arrayOfJobs.length);

    logger.info("The list of keys: " + JSON.stringify(Object.keys(jobsMapByChatId)));

    var filteredElem = arrayOfJobs.filter(function (el) {
      logger.info("entryid: " + el + " and obj " + obj);
      return el.entryId === obj;
    });

    var jobToCancel = filteredElem[0].job;

    jobToCancel.stop();

  });

  // remove from database

  // remove from current jobs




}