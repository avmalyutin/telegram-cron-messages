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

### Development
1. clone the repo
2. Execute:
```javascript
npm install
```
3. Execute:
```javascript
node index.js
```


### Examples of usage
Current list of commands:
/addCron [40 * * * * * ] some schedules message here
/getCrons
/deleteCron [KO4]



### TODO
1. Better error handling
2. Better API definition
3. Better logging
4. ...
