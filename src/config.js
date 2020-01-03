const { PORT = 3000, AUTH_TOKEN = 'super-secret-token' } = process.env;

module.exports = {
  authToken: AUTH_TOKEN,
  port: PORT,
};
