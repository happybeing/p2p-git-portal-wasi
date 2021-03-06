const webpackConfig = require('../../../webpack.config.js');
const express = require('express');
let app = express();
let server, middleware;

module.exports = {

    startServer: async (port) => {
        const webpack = require('webpack');
        const compiler = webpack(webpackConfig);
        middleware = require('webpack-dev-middleware')(compiler, {
            // webpack-dev-middleware options
        });

        app.use(express.static(webpackConfig.devServer.contentBase));
        app.use(middleware);
        return new Promise(resolve => {
            try {
                server = app.listen(port, () => {
                    console.log('devserver on port ' + port);
                    resolve();
                });
            } catch(e) {
                console.log('devserver startup error: ' + e);
            }    
        });
    },

    shutdownServer: async () => {
        return new Promise(resolve => {
            try {
                if (middleware) middleware.close();
                server.close(function(err) {
                    if (err) {
                        console.log('devserver shutdown failed', err.message);
                        return resolve();
                    }
                    console.log('devserver shut down');
                    resolve();
                });            
            } catch(e) { 
                console.log('devserver shutdown error: ' + e);
            }
        });
    }
}