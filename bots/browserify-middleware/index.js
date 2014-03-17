'use strict';

var ms = require('ms');
var semver = require('semver');
var npm = require('../../lib/npm');
var github = require('../../lib/github');

var PACKAGE_JSON = '/ForbesLindesay/browserify-middleware/raw/master/package.json';
var lastGood  = 0;
var version = '~0.0.0';
var status = 'loading...';

exports.name = 'browserify-middleware';
exports.status = function () {
  return status;
};
exports.run = checkStatus;
exports.runFrequency = '1 hour';

function checkStatus() {
  return npm.get('/browserify').then(function (res) {
    var latest = res['dist-tags'].latest;
    if (semver.satisfies(latest, version)) {
      status = latest;
      return;
    }
    return github.json('GET', PACKAGE_JSON, {}, {host: 'github.com'}).then(function (res) {
      var dep = res.body.dependencies.browserify;
      version = dep;
      if (semver.satisfies(latest, version)) {
        status = latest;
        return;
      }
      status = 'update required';
    });
  });
}