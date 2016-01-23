module.exports = function (server) {
    'use strict';
    var fs = require('fs');
    var path = require('path');
    var q = require('q');
    var ejs = require('ejs');

    /**
     * Provide renew password page
     * @param     {String} token renewal
     * @param   {Function} callback     Callback function
     * @returns {Object} Promise
     */
    function loginRenew(token, firstTime /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            var filename = path.join(server.rootFolder, 'shared/public/renew-password/index.html');
            fs.readFile(filename, function (err, data) {
                var template = ejs.compile(data.toString(), {});
                var rendering = template({
                    token: token,
                    firstTime: firstTime
                });
                callback(err ? 404 : null, rendering);
                if (err) {
                    reject(err);
                } else {
                    resolve(rendering);
                }
            });
        });

    }

    return {
        loginRenew: loginRenew
    };
};
