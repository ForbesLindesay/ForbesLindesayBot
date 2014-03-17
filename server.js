'use strict';

var fs = require('fs');
var http = require('http');
var ms = require('ms');
var raven = require('raven');

var ravenClient;
if (process.env.SSCC_RAVEN) {
  ravenClient = new raven.Client(process.env.SSCC_RAVEN);
  ravenClient.patchGlobal(function () {
    process.exit(1);
  });
}

var bots = fs.readdirSync(__dirname + '/bots').map(function (bot) {
  return require('./bots/' + bot);
});

bots.forEach(function (bot) {
  bot.run().done(function () {
    bot.lastRun = Date.now();
  }, reportError);
  setInterval(function () {
    bot.run().done(function () {
      bot.lastRun = Date.now();
    }, reportError);
  }, ms(bot.runFrequency + ''));
});

http.createServer(function (req, res) {
  var status = bots.map(function (bot) {
    var isBotGood = bot.lastRun && (Date.now() - bot.lastRun) < (ms(bot.runFrequency + '') * 3);
    return '<h2' + (isBotGood ? '' : ' style="color:red"') + '>' +
      bot.name + '</h2>' +
      '<p><i>' + (bot.lastRun ? (new Date(bot.lastRun)).toISOString() : 'not run') + '</i></p>' +
      bot.status().replace(/\n/g, '<br>');
  }).join('');
  res.setHeader('content-type', 'text/html');
  res.end(status);
}).listen(3000);

function reportError(err) {
  if (process.env.BOT_RAVEN) {
    ravenClient.captureError(err);
  } else {
    setTimeout(function () {
      throw err;
    }, 0);
  }
}