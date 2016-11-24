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
                filename: 'dev_',
                pattern: 'yyyyMMdd.log',
                alwaysIncludePattern: true
            }
        }, {
            type: 'logLevelFilter',
            level: 'TRACE',
            appender: {
                type: 'console'
            }
        }],
        replaceConsole: true
    }
};
