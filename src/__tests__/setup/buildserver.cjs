const webpackConfig = require('../../../webpack.config.js');
let server;

module.exports = {

    startServer: async (port) => {
    if (typeof(port) !== 'number') port = 5111;

    var http = require('http');
    var finalhandler = require('finalhandler');
    var serveStatic = require('serve-static');
    var serve = serveStatic(webpackConfig.devServer.contentBase);

    server = http.createServer(function(req, res) {
      var done = finalhandler(req, res);
      serve(req, res, done);
    });

    return new Promise(resolve => {
      try {
        server.listen(port, () => {
            console.log('buildserver on port ' + port);
            resolve();
        });
      } catch(e) {
          console.log('buildserver startup error: ' + e);
      }    
  });

  },

  shutdownServer: async () => {
    return new Promise(resolve => {
      server.close(function(err) {
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