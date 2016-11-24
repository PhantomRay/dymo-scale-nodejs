'use strict';

var WebSocketServer = require('ws').Server,
    log4js = require('log4js'),
    EventEmitter = require('events').EventEmitter,
    config = require('./config'),
    subscriber = new EventEmitter(),
    uuid = require('uuid');

log4js.configure(config.log);
var log = log4js.getLogger();

exports.start = function (port) {
    var wss = new WebSocketServer({
        port: port || 8081
    });

    wss.on('connection', function (ws) {
        ws.on('message', function (message) {
            console.log('received: %s', message);
        });
    });

    log.info('web socket server listening on port ' + port);

    wss.broadcast = function (data) {
        for (var i in this.clients)
            this.clients[i].send(JSON.stringify(data));
    };

    // refact below
    subscriber = new EventEmitter();
    subscriber.on('message', function (data) {
        wss.broadcast(data);
    });

    wss.subscriber = subscriber;
    return wss;
};



function sendMessage(ws, msg, type, replyTo) {
    type = type || '';
    replyTo = replyTo || null;

    if (ws.readyState === ws.OPEN) {
        var data = {
            messageId: uuid.v4(),
            replyTo: replyTo,
            body: typeof (msg) === 'object' ? JSON.stringify(msg) : msg,
            type: type,
            timestamp: new Date().toISOString()
        };

        ws.send(JSON.stringify(data));
        log.v('data sent to client:');
        log.v(data);
    }
}

function processMessage(msg) {
    try {
        msg = JSON.parse(msg);
    } catch (err) {

    }
    log.trace('message received from rmm server:');
    log.trace(JSON.stringify(msg));
    try {
        if (typeof (msg) === 'object') {
            msg.type = msg.type || '';

            if (msg.type.toLowerCase() === 'error') {
                log.error(msg.content);
            } else {
                log.error(msg.type);
                switch (msg.type.toLowerCase()) {
                case 'ping':
                    break;
                case 'message':
                    sendMessage(msg.content, 'message', msg.messageId);
                    break;
                default:
                    break;
                }
            }
        } else {
            log.w('unidentified message');
            log.w(msg);
        }
    } catch (err) {
        log.error(err);
        sendMessage(err, 'error', msg.MessageId);
    }
}
