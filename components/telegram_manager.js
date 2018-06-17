const logger = require("./logger_manager")("telegram_manager");
require('dotenv').config();
const Telegraf = require("telegraf");
const cronManager = require("./cron_manager");

var TELEGRAM_TOKEN;
var bot;

exports.init = () => {
  logger.info("tele_manager: +init");
  registerBot();
  cronManager.registerBotLink(bot);
  cronManager.registerCronsByStartup();
  logger.info("tele_manager: -init");
};

function registerBot() {

  try {
    TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    logger.info("TELEGRAM_TOKEN is: " + TELEGRAM_TOKEN);
    bot = new Telegraf(TELEGRAM_TOKEN);
    bot.start(ctx => ctx.reply("Welcome to the cron messagers bot!"));
    bot.command("/add_cron", ctx => addCronMessage(ctx));
    bot.command("/delete_cron", ctx => deleteCronMessage(ctx));
    bot.command("/get_crons", ctx => getRegisteredCronMessages(ctx));
    // just for debugging
    bot.hears("hi", ctx => ctx.reply("Hey there"));
    bot.startPolling();
  } catch (e) {
    logger.info("Error registring the the telegram bot -> exit with code 225");
    logger.info(e);
    process.exit(225);
  }

}

function addCronMessage(ctx) {
  logger.info("+addCronMessage: " + JSON.stringify(ctx.message));

  var messageRegisteredSuccess = reply => {
    logger.info(
      "addCronMessage: message registered: " +
      JSON.stringify(ctx.message)
    );
    ctx.reply("registered");
  };

  var messageRegisteredError = error => {
    logger.info(
      "addCronMessage: message not registered: " +
      JSON.stringify(ctx.message)
    );
    logger.info("I am here: " + error);
    logger.info(error);
    ctx.reply("error by registering the message");
  };

  cronManager
    .registerCronMessage(ctx)
    .then(messageRegisteredSuccess, messageRegisteredError);
}

function deleteCronMessage(ctx) {
  cronManager
    .removeRegisteredMessage(ctx);
}

function getRegisteredCronMessages(ctx) {
  logger.info("+getRegisteredCronMessages");

  var getMessagesSuccess = messages => {
    logger.info(
      "getRegisteredCronMessages: getMessagesSuccess: " +
      JSON.stringify(messages)
    );

    var string = "Registered cron messages: \n";

    if (messages.length === 0) {
      string = "none";
    } else {
      messages.forEach(function (elem, index) {
        string += "\n";
        string += (index + 1) + ". ";
        string += "[" + elem.cronExpression + "] ";
        string += "[" + elem.entryId + "] ";
        string += elem.message;
      });
    }
    ctx.reply(string);
  };

  var getMessagesError = error => {
    logger.info(
      "getMessagesError: error by registering the message: "
    );
    ctx.reply("error by retrieving all messages");
  };

  cronManager
    .getRegisteredCronMessages(ctx)
    .then(getMessagesSuccess, getMessagesError);
}