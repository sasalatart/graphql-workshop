const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const lodashId = require('lodash-id');
const data = require('./data.json');

const db = low(new Memory());
db._.mixin(lodashId);
db.defaults(data).write();

module.exports = db;
