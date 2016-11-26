module.exports = {
    log: {
        levels: {
            '[all]': 'DEBUG'
        },
        appenders: [{
            type: 'logLevelFilter',
            level: 'INFO',
            appender: {
                type: 'dateFile',
                filename: 'log',
                pattern: 'yyyyMMdd.log',
                alwaysIncludePattern: true
            }
        }, {
            type: 'logLevelFilter',
            level: 'INFO',
            appender: {
                type: 'console'
            }
        }],
        replaceConsole: true
    }
};
