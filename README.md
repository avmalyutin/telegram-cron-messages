# telegram-cron-messages
Simple bot to fire cron messages

### Description
This bot has been created to fire messages by cron expressions. Currently, the code base is not perfect (see TODO list). I am planning to spend some time bringing the bot into the finished state. Pull requests are highly appreciated.

The one special thing about bot is that all cron messages are registered in database. Therefore, if the server will be restarted, then the existing cron messages will be registered again.

### Used technologies
The bot is written in JavaScript:
1. Server: [Node.js](https://nodejs.org/en/)
2. Telegram bot api library: [Telegraf](https://telegraf.js.org/#/)
3. Database: [SQLite](https://www.sqlite.org/index.html)
4. SQLite tutorial for Noje.js: [tutorial](http://www.sqlitetutorial.net/sqlite-create-table/)
4. Cron library: [node-cron](https://github.com/kelektiv/node-cron)
5. Environmental variables: [dotenv](https://github.com/motdotla/dotenv)

### Development
1. Clone the repo
2. Rename the file **.env_t** to **.env**. Define your telegram bot token in this file.
```javascript
TELEGRAM_TOKEN=YOUR_TOKEN_HERE
```
3. Execute:
```javascript
npm install
```
4. Execute:
```javascript
node index.js
```
5. Try either the list of commands or just type **hi** and receive the answer from bot.

### Examples of usage
Current list of commands:
/add_cron [40 * * * * * ] some schedules message here
/get_crons
/delete_cron [KO4]

### TODO
1. Better error handling
2. Better API definition
3. Better logging, write logging to files
4. Better interaction, by keyboards
5. ...