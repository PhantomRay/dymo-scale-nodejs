  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  var config = require('./config'),
      HID = require('node-hid'),
      usb = require('usb'),
      log4js = require('log4js'),
      util = require('util'),
      server = require('./server').start();

  log4js.configure(config.log);
  var logger = log4js.getLogger();

  logger.info('started in ' + process.env.NODE_ENV + ' mode');

  var reading = false,
      interval,
      vid = 0x922,
      pid = 0x8003,
      msg = '';

  startReading();

  usb.on('attach', function (device) {
      if (device.deviceDescriptor.idVendor === vid && device.deviceDescriptor.idProduct === pid) {
          msg = 'Dymo M10 attached';
          logger.info(msg);

          server.subscriber.emit('message', {
              type: 'info',
              message: msg
          });

          interval = setInterval(startReading, 1000);
      }
  });

  usb.on('detach', function (device) {
      if (device.deviceDescriptor.idVendor === vid && device.deviceDescriptor.idProduct === pid) {
          msg = 'Dymo M10 detached';
          logger.warn(msg);

          server.subscriber.emit('message', {
              type: 'warn',
              message: msg
          });

          reading = false;
          clearInterval(interval);
      }
  });

  function startReading() {
      if (reading) return;
      try {
          var d = new HID.HID(vid, pid);
          reading = true;

          d.on('data', function (data) {
              var buf = new Buffer(data);
              logger.trace(util.format('0: %s\t0: %s\t0: %s\t0: %s', buf[0], buf[1], buf[2], buf[3]));

              var grams = buf[4] + (256 * buf[5]);
              if (buf[1] === 5) {
                  msg = 'TARE IS ON';
                  logger.warn(msg);
                  server.subscriber.emit('message', {
                      type: 'error',
                      message: msg
                  });
              } else if (grams > 0 && buf[3] === 255) {
                  msg = 'Please switch to gram';
                  // in ounce
                  logger.warn(msg);
                  server.subscriber.emit('message', {
                      type: 'error',
                      message: msg
                  });
              } else {
                  logger.debug(grams + ' grams');
                  server.subscriber.emit('message', {
                      type: 'weight',
                      message: grams
                  });
              }
          });

          d.on('error', function (err) {
              if (!/could not read from HID device/.test(err.message)) {
                  logger.error(err);
                  server.subscriber.emit('message', {
                      type: 'error',
                      message: err.message
                  });
              }

              reading = false;
              d.close();
          });
      } catch (err) {
          if (/cannot open device/.test(err.message)) {
              msg = 'Dymo M10 cannot be found';
              server.subscriber.emit('message', {
                  type: 'error',
                  message: msg
              });
              logger.warn(msg);
          } else {
              logger.error(err);
              server.subscriber.emit('message', {
                  type: 'error',
                  message: err.message
              });
          }
      }
  }
