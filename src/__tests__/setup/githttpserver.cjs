/**
 * This example will create a git http server to repositories on your local disk.
 * Set the GIT_PROJECT_ROOT environment variable to point to location of your git repositories.
 */

let server;

async function startServer(port) {
    if (typeof(port) !== 'number') port = 5222;

    const http = require('http');
    const cgi = require('cgi');

    const { tmpdir } = require('os');
    const { execSync } = require('child_process');

    execSync(`git init --bare ${tmpdir()}/testrepo.git`);

    const script = 'git';

    const gitcgi = cgi(script, {args: ['http-backend'],
        stderr: process.stderr,
        env: {
            'GIT_PROJECT_ROOT': tmpdir(),
            'GIT_HTTP_EXPORT_ALL': '1',
            'REMOTE_USER': 'test@example.com' // Push requires authenticated users by default
        }
    });

    server = http.createServer( (request, response) => {
        let path = request.url.substring(1);

        console.log('git http server request', request.url);
        
        if (path.indexOf('ping') > -1) {
            response.statusCode = 200;
            response.end('pong');
        } else if( path.indexOf('git-upload') > -1 ||
            path.indexOf('git-receive') > -1) {
            gitcgi(request, response);
        } else {
            response.statusCode = 404;
            response.end('not found');
        }
    });
    server = require('http-shutdown')(server);
    return new Promise(resolve => {
        server.listen(port, () => {
            console.log('githttpserver on port ' + port);
            resolve();
        });
    });
}

module.exports = {
    startServer: startServer,

    shutdownServer: async () => {
        return new Promise(resolve => {
            server.shutdown(function(err) {
                if (err) {
                    console.log('githttpserver shutdown failed', err.message);
                    return resolve();
                }
                console.log('githttpserver shut down');
                resolve();
            });            
        });
    }
}