const webpackConfig = require('../../../webpack.config.js');
const express = require('express');
let app = express();
let server;

async function startServer(port) {

    const webpack = require('webpack');
    const middleware = require('webpack-dev-middleware');
    const compiler = webpack(webpackConfig);

    app.use(express.static(webpackConfig.devServer.contentBase));
    app.use(
        middleware(compiler, {
            // webpack-dev-middleware options
        })
    );
    return new Promise(resolve => {
        try {
        server = app.listen(port, () => {
            console.log('devserver on port ' + port);
            resolve();
        });
        server = require('http-shutdown')(server);
        } catch(e) {
            console.log('devserver error1: ' + e);
        }    
    });
}

module.exports = {
    startServer: startServer,
    shutdownServer: async () => {
        return new Promise(resolve => {
            try {
                server.close(function(err) {
                    if (err) {
                        console.log('devserver shutdown failed', err.message);
                        return resolve();
                    }
                    console.log('devserver shut down');
                    resolve();
                });            
            } catch(e) { 
                console.log('devserver error2: ' + e);
            }
        });
    }
}