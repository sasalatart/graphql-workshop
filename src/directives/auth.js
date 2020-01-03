const { defaultFieldResolver } = require('graphql');
const { AuthenticationError } = require('apollo-server');
const { SchemaDirectiveVisitor } = require('graphql-tools');

module.exports = class Auth extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    // eslint-disable-next-line no-param-reassign
    field.resolve = (root, args, ctx, info) => {
      if (!ctx.isAuth) throw new AuthenticationError();

      return resolve.call(this, root, args, ctx, info);
    };
  }
};
