const gql = require('graphql-tag');
const _ = require('lodash');
const db = require('../db');
const createTestServer = require('../tests/server');

describe('characters resolvers', () => {
  describe('charactersList', () => {
    const server = createTestServer();

    const query = gql`
      query charactersList($affiliation: Affiliation) {
        charactersList(affiliation: $affiliation) {
          id
        }
      }
    `;

    describe('when no affiliation is given', () => {
      const queryWithNoArgs = gql`
        {
          charactersList {
            id
          }
        }
      `;

      it('returns all characters in the database', async () => {
        const {
          data: { charactersList: result },
        } = await server.query({
          query: queryWithNoArgs,
        });

        const expectedIds = db
          .get('characters')
          .map('id')
          .value();
        expect(_.map(result, 'id').sort()).toEqual(expectedIds.sort());
      });
    });

    describe('when an affiliation is given', () => {
      const AFFILIATION = 'JEDI';

      it('returns all characters with that affiliation', async () => {
        const {
          data: { charactersList: result },
        } = await server.query({
          query,
          variables: { affiliation: AFFILIATION },
        });

        const expectedIds = db
          .get('characters')
          .filter({ affiliation: AFFILIATION })
          .map('id')
          .value();
        expect(_.map(result, 'id').sort()).toEqual(expectedIds.sort());
      });
    });
  });

  describe('character', () => {
    const server = createTestServer();

    const query = gql`
      query character($id: ID!) {
        character(id: $id) {
          id
          bestFriend {
            id
          }
        }
      }
    `;

    describe('when the provided ID does not exist', () => {
      let data;
      let errors;

      beforeAll(async () => {
        ({ data, errors } = await server.query({
          query,
          variables: { id: 'inexistent' },
        }));
      });

      it('returns null data', () => {
        expect(data).toBeNull();
      });

      it('returns a UserInputError with "Inexistent ID" message', () => {
        expect(
          errors.some(({ extensions, message }) => {
            return (
              extensions.code === 'BAD_USER_INPUT' &&
              message === 'Inexistent ID'
            );
          }),
        ).toBeTruthy();
      });
    });

    describe('when the provided ID exists', () => {
      let id;
      let bestFriendId;
      let result;

      beforeAll(async () => {
        ({ id, bestFriend: bestFriendId } = db
          .get('characters')
          .find(({ bestFriend }) => bestFriend)
          .value());

        ({
          data: { character: result },
        } = await server.query({
          query,
          variables: { id },
        }));
      });

      it('returns the specified character', () => {
        expect(result.id).toEqual(id);
      });

      it("populates the character's bestFriend", () => {
        expect(result.bestFriend.id).toEqual(bestFriendId);
      });
    });
  });

  describe('createCharacter', () => {
    let validInput;

    const mutation = gql`
      mutation createCharacter($input: CreateCharacterInput!) {
        createCharacter(input: $input) {
          id
          name
          age
          affiliation
          bestFriend {
            id
          }
        }
      }
    `;

    beforeAll(() => {
      validInput = {
        name: 'Sebastián Salata',
        age: 27,
        affiliation: 'JEDI',
        bestFriend: db
          .get('characters')
          .find()
          .value().id,
      };
    });

    describe('when the request is not authenticated', () => {
      const server = createTestServer();
      let data;
      let errors;

      beforeAll(async () => {
        ({ data, errors } = await server.query({
          mutation,
          variables: { input: validInput },
        }));
      });

      it('returns null data', () => {
        expect(data).toBeNull();
      });

      it('returns an AuthenticationError', () => {
        expect(
          errors.some(err => err.extensions.code === 'UNAUTHENTICATED'),
        ).toBeTruthy();
      });
    });

    describe('when the request is authenticated', () => {
      const server = createTestServer({ isAuth: true });
      let result;

      beforeAll(async () => {
        ({
          data: { createCharacter: result },
        } = await server.query({
          mutation,
          variables: { input: validInput },
        }));
      });

      it('returns the created character with the specified attributes', () => {
        Object.keys(_.omit(validInput, 'bestFriend')).forEach(attrName => {
          expect(result).toHaveProperty(attrName, validInput[attrName]);
        });
        expect(result).toHaveProperty('bestFriend.id', validInput.bestFriend);
      });

      it('persists the character', () => {
        const persistedCharacter = db
          .get('characters')
          .find({ id: result.id })
          .value();
        expect(persistedCharacter).toBeTruthy();
      });
    });
  });
});
