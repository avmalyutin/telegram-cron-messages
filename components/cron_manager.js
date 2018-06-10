/** This manager will handle the cron expressions */
const CronJob = require("cron").CronJob;

const db_manager = require("./db_manager");

var bot;

var jobsMapByChatId = {};

exports.registerBotLink = botLink => {
  bot = botLink;
};

exports.registerCronsByStartup = () => {

  return new Promise((resolve, reject) => {

    console.log("+registerCronsByStartup");

    db_manager.getAllRecordsFromDB().then(function (elems) {

      console.log("+getAllRecordsFromDB: " + JSON.stringify(elems));

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


      console.log("+getAllRecordsFromDB");


    });


  });
};

exports.registerCronMessage = function (telegramContext) {
  return new Promise((resolve, reject) => {
    console.log(
      "+registerCronMessage: context message is: " +
      JSON.stringify(telegramContext.message)
    );

    // get text
    var text = telegramContext.message.text;

    console.log("registerCronMessage: the message text is:" + text);

    var obj = validateAndParseTelegramMessage(text);

    if (typeof obj === "undefined") {
      console.log("The format of message is not valid");
      reject("not valid format of message");
    }

    // register the cron

    // https://github.com/kelektiv/node-cron

    var chatId = telegramContext.message.chat.id;

    console.log("Start registering the cron...");

    var success = function (elementAdded) {
      console.log("I am here 1");

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

      console.log("Cron is registered!");

      resolve();
    };

    addCronToDababase(chatId, obj).then(success);
  });
};

var validateAndParseTelegramMessage = messageBody => {
  console.log("+validateAndParseTelegramMessage: " + messageBody);

  var firstBracketIdx = messageBody.indexOf("[");
  var secondBracketIdx = messageBody.indexOf("]");

  if (firstBracketIdx === -1 || secondBracketIdx === -1) {
    console.log(
      "-validateAndParseTelegramMessage: not valid message: firstBracketIdx: " +
      firstBracketIdx +
      " and secondBracketIdx: " +
      secondBracketIdx
    );
    return void 0;
  }

  console.log(
    "validateAndParseTelegramMessage: firstBracketIdx: " + firstBracketIdx
  );
  console.log(
    "validateAndParseTelegramMessage: secondBracketIdx: " + secondBracketIdx
  );

  var cron = messageBody.slice(firstBracketIdx + 1, secondBracketIdx);
  var message = messageBody.slice(secondBracketIdx + 1);

  console.log("validateAndParseTelegramMessage: cron is: (" + cron + ")");

  console.log("validateAndParseTelegramMessage: message is: (" + message + ")");

  var obj = {
    cron: cron,
    message: message
  };

  console.log("+validateAndParseTelegramMessage:");
  return obj;
};


var validateAndParseDeleteMessage = messageBody => {
  console.log("+validateAndParseDeleteMessage: " + messageBody);

  var firstBracketIdx = messageBody.indexOf("[");
  var secondBracketIdx = messageBody.indexOf("]");

  if (firstBracketIdx === -1 || secondBracketIdx === -1) {
    console.log(
      "-validateAndParseDeleteMessage: not valid message: firstBracketIdx: " +
      firstBracketIdx +
      " and secondBracketIdx: " +
      secondBracketIdx
    );
    return void 0;
  }

  console.log(
    "validateAndParseDeleteMessage: firstBracketIdx: " + firstBracketIdx
  );
  console.log(
    "validateAndParseDeleteMessage: secondBracketIdx: " + secondBracketIdx
  );

  var indent = messageBody.slice(firstBracketIdx + 1, secondBracketIdx);

  return indent;

}

var addCronToDababase = (chatId, obj) => {
  return new Promise((resolve, reject) => {
    console.log(
      "+addCronToDababase: " + chatId + " and obj is: " + JSON.stringify(obj)
    );

    var successGet = messages => {
      console.log("addCronToDababase: successGet: " + JSON.stringify(messages));

      var ids = messages.map(elem => {
        return elem.entry_id;
      });

      console.log("addCronToDababase: successGet: ids: " + JSON.stringify(ids));

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
        console.log("addCronToDababase: addSuccess:");
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

  console.log(
    "+removeRegisteredMessage: context message is: " +
    JSON.stringify(ctx.message)
  );

  // get text
  var text = ctx.message.text;

  console.log("removeRegisteredMessage: the message text is:" + text);

  var obj = validateAndParseDeleteMessage(text);

  if (typeof obj === "undefined") {
    console.log("removeRegisteredMessage: The format of message is not valid");
    return;
  }

  // register the cron

  // https://github.com/kelektiv/node-cron

  var chatId = ctx.message.chat.id;

  console.log("Start removing the cron: chatId: " + chatId + " and obj: " + obj);


  db_manager.removeRecordByEntryId(obj).then(function () {

    var arrayOfJobs = jobsMapByChatId[chatId + ""];

    console.log("Array of jobs size: " + arrayOfJobs.length);

    console.log("The list of keys: " + JSON.stringify(Object.keys(jobsMapByChatId)));

    var filteredElem = arrayOfJobs.filter(function (el) {
      console.log("entryid: " + el + " and obj " + obj);
      return el.entryId === obj;
    });

    var jobToCancel = filteredElem[0].job;

    jobToCancel.stop();

  });

  // remove from database

  // remove from current jobs




}