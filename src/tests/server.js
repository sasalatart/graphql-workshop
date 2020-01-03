const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const db = require('../db');
const schemaDirectives = require('../directives');
const resolvers = require('../resolvers');
const typeDefs = require('../type-defs');

module.exports = function createTestServer(ctx) {
  const server = new ApolloServer({
    context: () => ({
      collections: {
        get characters() {
          return db.get('characters');
        },
      },
      ...ctx,
    }),
    mockEntireSchema: false,
    mocks: true,
    resolvers,
    schemaDirectives,
    typeDefs,
  });

  return createTestClient(server);
};
