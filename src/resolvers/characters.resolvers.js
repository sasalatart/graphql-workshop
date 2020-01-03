const { UserInputError } = require('apollo-server');

function charactersList(root, args, ctx) {
  const { affiliation } = args;
  const { characters } = ctx.collections;

  return affiliation
    ? characters.filter({ affiliation }).value()
    : characters.value();
}

function findCharacter(root, args, ctx) {
  const { characters } = ctx.collections;
  const character = characters.find({ id: args.id }).value();

  if (!character) throw new UserInputError('Inexistent ID');
  return character;
}

function createCharacter(root, args, ctx) {
  const { characters } = ctx.collections;
  return characters.insert(args.input).write();
}

function bestFriend(character, args, ctx) {
  const { characters } = ctx.collections;
  return characters.find({ id: character.bestFriend }).value();
}

module.exports = {
  Query: {
    charactersList,
    character: findCharacter,
  },
  Mutation: {
    createCharacter,
  },
  Character: {
    bestFriend,
  },
};
