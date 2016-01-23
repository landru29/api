/*global module, require*/
module.exports = function (server) {
    'use strict';
    var jwt = require('jsonwebtoken');

    function getEncryptor(encryptorName) {
        if (!encryptorName) {
            throw 'No encryptor specified';
        }
        var encryptor = server.config.oauth[encryptorName];
        if (!encryptor) {
            throw 'Bad encryptor specified';
        }
        return encryptor;
    }

    return {

        /**
         * Encrypt data
         * @param   {Object} data          Data to encrypt
         * @param   {String} encryptorName Name of the encryptor specfied in authentication.json
         * @param   {function} callback    Callback function (optional)
         * @returns {String} encrypted data
         */
        encrypt: function (data, encryptorName, callback) {
            var encryptor = getEncryptor(encryptorName);
            var encrypted = jwt.sign(data, encryptor.secret, {
                algorithm: 'HS256',
                expiresInMinutes: encryptor['expires-in-minutes'] > 0 ? encryptor['expires-in-minutes'] : null
            });
            if (callback) {
                callback(encrypted);
            }
            return encrypted;
        },

        /**
         * Async decrypt data
         * @param   {Object} data          Data to decrypt
         * @param   {String} encryptorName Name of the encryptor specfied in authentication.json
         * @param   {function} callback    Callback function
         */
        decrypt: function (data, encryptorName, callback) {
            var encryptor = getEncryptor(encryptorName);
            jwt.verify(data, encryptor.secret, callback);
        }

    };
};
