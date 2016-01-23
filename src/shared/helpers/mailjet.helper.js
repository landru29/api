module.exports = function (server) {
    'use strict';
    var http = require('http');
    var querystring = require('querystring');
    var q = require('q');

    return function (data) {

        var config = server.config['mail-sender'].mailjet;

        var keyPair = [config.key, config.secret].join(':');
        var authent = new Buffer(keyPair).toString('base64');

        var body = {
            from: data.from,
            to: (data.to ? data.to : []).join(', '),
            cc: (data.cc ? data.cc : []).join(', '),
            bcc: (data.bcc ? data.bcc : []).join(', '),
            subject: data.subject,
            html: data.html,
            text: data.text
        };

        var encodedBody = querystring.stringify(body);

        var options = {
            hostname: 'api.mailjet.com',
            port: 80,
            path: '/v3/send/',
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + authent,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(encodedBody)
            }
        };

        // API request
        q.Promise(function (resolve, reject) {
            var req = http.request(options, function (res) {
                server.log.info('[MAILJET: STATUS]', res.statusCode);
                server.log.info('[MAILJET: HEADERS]', JSON.stringify(res.headers));
                var str = '';
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    str += chunk;
                });

                res.on('error', function (e) {
                    reject(e);
                });

                res.on('end', function () {
                    server.log.info('[MAILJET: DATA]', str);
                    resolve(str);
                });

            });

            server.log.info('[MAILJET: BODY]', JSON.stringify(body));
            req.write(encodedBody);

            req.end();
        });

    };
};
