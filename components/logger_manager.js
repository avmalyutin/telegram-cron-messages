require('dotenv').config();
const winston = require("winston");
require('winston-daily-rotate-file');
const {
    combine,
    timestamp,
    label,
    printf
} = winston.format;

const ROOT_LOGS = process.env.ROOT_LOGS;

const defaultLogsFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

let dayRotatingFileTransport = new(winston.transports.DailyRotateFile)({
    filename: ROOT_LOGS + 'application-%DATE%.log',
    datePattern: 'DD-MM-YYYY_HH',
    zippedArchive: true,
    colorize: true,
    maxSize: '10m',
    maxFiles: '30d'
});

var getLabel = (callingModule) => {
    return {
        label: callingModule
    };
};

module.exports = (callingModule) => {
    return winston.createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            label(getLabel(callingModule)),
            defaultLogsFormat
        ),
        transports: [
            new winston.transports.File({
                filename: ROOT_LOGS + 'error.log',
                handleExceptions: true,
                level: 'error'
            }),
            new winston.transports.Console({
                label: getLabel(callingModule)
            }),
            dayRotatingFileTransport
        ]
    });
};