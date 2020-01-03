const { importSchema } = require('graphql-import');
const path = require('path');

module.exports = importSchema(path.join(__dirname, 'schema.graphql'));
