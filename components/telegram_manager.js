/** This will handle telegram functionality */
const Telegraf = require("telegraf");
const cronManager = require("./cron_manager");

const db_manager = require("./db_manager");

const TOKEN = "YOUR_TOKEN_HERE";
const bot = new Telegraf(TOKEN);

var currenCronMessages = {};

bot.start(ctx => ctx.reply("Welcome to the cron messagers bot!"));
bot.command("/add_cron", ctx => addCronMessage(ctx));
bot.command("/delete_cron", ctx => deleteCronMessage(ctx));
bot.command("/get_crons", ctx => getRegisteredCronMessages(ctx));
// just for debugging
bot.hears("hi", ctx => ctx.reply("Hey there"));

exports.init = () => {
  console.log("tele_manager: +init");
  cronManager.registerBotLink(bot);
  cronManager.registerCronsByStartup();
  bot.startPolling();
  console.log("tele_manager: -init");
};

function addCronMessage(ctx) {
  console.log("+addCronMessage: " + JSON.stringify(ctx.message));

  var messageRegisteredSuccess = reply => {
    console.log(
      "addCronMessage: message registered: " +
      JSON.stringify(ctx.message)
    );
    ctx.reply("registered");
  };

  var messageRegisteredError = error => {
    console.log(
      "addCronMessage: message not registered: " +
      JSON.stringify(ctx.message)
    );
    console.log("I am here: " + error);
    console.log(error);
    ctx.reply("error by registering the message");
  };

  cronManager
    .registerCronMessage(ctx)
    .then(messageRegisteredSuccess, messageRegisteredError);
}

function deleteCronMessage(ctx) {

  // parse the values here


  cronManager
    .removeRegisteredMessage(ctx);






}

function getRegisteredCronMessages(ctx) {
  console.log("+getRegisteredCronMessages");

  var getMessagesSuccess = messages => {
    console.log(
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
    console.log(
      "getMessagesError: error by registering the message: "
    );
    ctx.reply("error by retrieving all messages");
  };

  cronManager
    .getRegisteredCronMessages(ctx)
    .then(getMessagesSuccess, getMessagesError);
}