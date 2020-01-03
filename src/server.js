const { ApolloServer } = require('apollo-server');
const config = require('./config');
const db = require('./db');
const schemaDirectives = require('./directives');
const resolvers = require('./resolvers');
const typeDefs = require('./type-defs');

module.exports = new ApolloServer({
  schemaDirectives,
  resolvers,
  typeDefs,
  context({ req }) {
    const isAuth = req.headers.authorization === `Bearer ${config.authToken}`;

    // TODO: add data loaders, i18n, etc.
    return {
      isAuth,
      collections: {
        get characters() {
          return db.get('characters');
        },
      },
    };
  },
});
