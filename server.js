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
    port = port || 8081;
    var wss = new WebSocketServer({
        port: port
    });

    wss.on('connection', function (ws) {
        console.log('new connection');
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
