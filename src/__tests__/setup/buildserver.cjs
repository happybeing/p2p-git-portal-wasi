const webpackConfig = require('../../../webpack.config.js');
let server;

async function startServer(port) {
  if (typeof(port) !== 'number') port = 5111;

  var http = require('http');

  var finalhandler = require('finalhandler');
  var serveStatic = require('serve-static');
  var serve = serveStatic(webpackConfig.devServer.contentBase);

  server = http.createServer(function(req, res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
  });

  console.log('buildserver on port ', port);
  server.listen(port);
  server = require('http-shutdown')(server);
}

module.exports = {
  startServer: startServer,
  shutdownServer: async () => {
    return new Promise(resolve => {
      server.shutdown(function(err) {
            if (err) {
                console.log('buildserver shutdown failed', err.message);
                return resolve();
            }
            console.log('buildserver shut down');
            resolve();
      });            
    });
  }
}