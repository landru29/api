module.exports = function (server) {
    'use strict';
    var q = require('q');
    var Quizz = server.getModel('Quizz');
    var _ = require('lodash');


    /**
     * Read all quizz
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readQuizz(opts /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            Quizz.find({}, undefined, opts).then(function(quizz) {
                resolve(quizz);
                return callback(null, quizz);
            }, function(err) {
                reject(err);
                callback(err);
            });
        });
    }

    /**
     * Get random questions
     * @param   {Number} count  Number of questions
     * @param   {Object} filter Filter questions
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function pickQuizz(count, filter /*, callback*/) {
        var thisfilter = _.extend({published: true}, filter ? filter : {});
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            Quizz.random(thisfilter, count).then(function(quizz) {
                resolve(quizz);
                return callback(null, quizz);
            }, function(err) {
                reject(err);
                callback(err);
            });
        });
    }

    /**
     * Get an Quizz by ID
     * @param {String} id         Quizz Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readQuizzById(id /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        var filter = {
            _id: id
        };
        return q.promise(function (resolve, reject) {
            Quizz.find(filter).then(
                function(data) {
                    resolve(_.first(data));
                    return callback(null, _.first(data));
                },
                function(err) {
                    reject(err);
                    return callback(err);
                }
            );
        });
    }

    /**
     * Create an Quizz
     * @param   {Object} QuizzData Quizz {name, date, sport}
     * @param {function} callback       Callback function
     * @returns {Object} Promise
     */
    function createQuizz(QuizzData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            var quizz = new Quizz();
            _.extend(
                quizz,
                _.pick(
                    QuizzData,
                    [
                        'explaination',
                        'image',
                        'level',
                        'published',
                        'tags',
                        'text',
                        'choices'
                    ]
                )
            ).save(function (err, createdQuizz) {
                if (!err) {
                    resolve(createdQuizz);
                    callback(null, createdQuizz);
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });
    }

    /**
     * Count all questions
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function countQuizz(/*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            Quizz.count({}).then(function(size) {
                resolve(size);
                return callback(null, size);
            }, function(err) {
                reject(err);
                callback(err);
            });
        });
    }

    /**
     * Delete a Quizz
     * @param   {String} id       Quizz Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteQuizz(id /*, callback*/) {
        var filter = {
            _id: id
        };
        var callback = server.helpers.getCallback(arguments);
        return Quizz.remove(filter, callback);
    }

    /**
     * Update a Quizz
     * @param   {String} id             Quizz Identifier
     * @param   {Object} QuizzData Quizz {name, sport, date}
     * @param {function} callback       Callback function
     * @returns {Object} Promise
     */
    function updateQuizz(id, QuizzData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            readQuizzById(id).then(
                function(quizz) {
                    _.extend(
                        quizz,
                        _.pick(
                            QuizzData,
                            [
                                'explaination',
                                'image',
                                'level',
                                'published',
                                'tags',
                                'text',
                                'choices'
                            ]
                        )
                    ).save(callback).then(function (data) {
                        resolve(data);
                        callback(null, data);
                    }, function (err) {
                        reject(err);
                        callback(err);
                    });
                },
                function(err) {
                    reject(err);
                    return callback(err);
                }
            );
        });
    }


    return {
        readQuizz: readQuizz,
        readQuizzById: readQuizzById,
        createQuizz: createQuizz,
        deleteQuizz: deleteQuizz,
        updateQuizz: updateQuizz,
        countQuizz: countQuizz,
        pickQuizz: pickQuizz
    };
};
