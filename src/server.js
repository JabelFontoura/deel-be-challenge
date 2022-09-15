const app = require('./app');
const errorHandler = require('./middleware/error-handler');

init();

async function init() {
  app.use(errorHandler);
  app.listen(3001, () => {
    console.log('Express App Listening on Port 3001');
  });
}
