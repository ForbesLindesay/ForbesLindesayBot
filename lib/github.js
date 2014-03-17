'use strict';

var github = require('github-basic');

exports.json = function (method, path, query, options) {
  options = options || {};
  options.auth = {
    type: 'oauth',
    token: process.env.ACCESS_TOKEN
  };
  return github.json(method, path, query, options);
};