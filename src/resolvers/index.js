/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const resolvers = fs
  .readdirSync(__dirname)
  .filter(file => file.endsWith('.resolvers.js'))
  .map(fileName => require(path.join(__dirname, fileName)));

module.exports = _.merge({}, ...resolvers);
