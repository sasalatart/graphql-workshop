const config = require('./config');
const server = require('./server');

server.listen(config.port).then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Apollo server ready at ${url}`);
});
