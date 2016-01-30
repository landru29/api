module.exports = function (server, config) {
    'use strict';
    var http = require('http');
    var querystring = require('querystring');
    var q = require('q');

    return function (data /*, callback*/) {

        var callback = server.helpers.getCallback(arguments);

        var keyPair = [config.vendor.key, config.vendor.secret].join(':');
        var authent = new Buffer(keyPair).toString('base64');

        var body = {
            from: data.from || config.sender,
            to: (data.to ? data.to : []).join(', '),
            cc: (data.cc ? data.cc : []).join(', '),
            bcc: (data.bcc ? data.bcc : []).join(', '),
            subject: data.subject || config.subject,
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
        return q.Promise(function (resolve, reject) {
            var req = http.request(options, function (res) {
                console.log('[MAILJET: STATUS]', res.statusCode);
                console.log('[MAILJET: HEADERS]', JSON.stringify(res.headers));
                var str = '';
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    str += chunk;
                });

                res.on('error', function (e) {
                    callback(e);
                    reject(e);
                });

                res.on('end', function () {
                    console.log('[MAILJET: DATA]', str);
                    resolve(str);
                    callback(null, str);
                });

            });

            console.log('[MAILJET: BODY]', JSON.stringify(body));
            req.write(encodedBody);

            req.end();
        });

    };
};
