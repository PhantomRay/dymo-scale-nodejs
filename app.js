  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  var config = require('./config'),
      HID = require('node-hid'),
      usb = require('usb'),
      log4js = require('log4js'),
      util = require('util');

  log4js.configure(config.log);
  var logger = log4js.getLogger();

  logger.info('Started in ' + process.env.NODE_ENV);

  var reading = false,
      interval, vid = 0x922,
      pid = 0x8003;

  startReading();

  usb.on('attach', function (device) {
      if (device.deviceDescriptor.idVendor === vid && device.deviceDescriptor.idProduct === pid) {
          logger.info('Dymo M10 attached');

          interval = setInterval(startReading, 1000);
      }
  });

  usb.on('detach', function (device) {
      if (device.deviceDescriptor.idVendor === vid && device.deviceDescriptor.idProduct === pid) {
          logger.warn('Dymo M10 detached');
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
                  logger.warn('TARE IS ON');
              } else if (grams > 0 && buf[3] === 255) {
                  // in ounce
                  logger.warn('Please switch to gram');
              } else
                  logger.debug(grams + ' grams');
          });

          d.on('error', function (err) {
              if (!/could not read from HID device/.test(err.message))
                  logger.error(err);

              reading = false;
              d.close();
          });
      } catch (err) {
          if (/cannot open device/.test(err.message)) {
              logger.warn('Dymo M10 cannot be found');
          } else
              logger.error(err);
      }
  }
