'use strict';

var path = require('path');
var Promise = require('promise');
var RegClient = require('npm-registry-client');

var client = new RegClient({
  registry: 'https://registry.nodejitsu.com',
  cache: path.resolve(__dirname + '/../cache')
});

exports.get = function (url) {
  return new Promise(function (resolve, reject) {
    client.get(url, function (err, res) {
      if (err) reject(err);
      else resolve(res);
    })
  });
};