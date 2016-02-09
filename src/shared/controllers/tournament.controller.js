module.exports = function (server) {
    'use strict';
    var q = require('q');
    var Tournament = server.getModel('Tournament');
    var _ = require('lodash');


    /**
     * Read all tournaments
     * @param   {String} userId   Curent user
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readTournaments(userId /*, callback*/) {
        var filter = userId ? {userId: userId} : undefined;
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            Tournament.find(filter).then(function(tournaments) {
                resolve(tournaments);
                return callback(null, tournaments);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Get an tournament by ID
     * @param {String} userId     Curent user
     * @param {String} id         Tournament Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readTournamentById(userId, id /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        var filter = {
            _id: id
        };
        if (userId) {
            filter.userId = userId;
        }
        return q.promise(function (resolve, reject) {
            Tournament.find(filter, function(err, list) {
                    callback(err, _.first(list));
                }
            ).then(
                function(data) {
                    resolve(_.first(data));
                },
                function(err) {
                    reject(err);
                }
            );
        });
    }

    /**
     * Create an Tournament
     * @param   {String} userId         Curent user
     * @param   {Object} TournamentData Tournament {name, date, sport}
     * @param {function} callback       Callback function
     * @returns {Object} Promise
     */
    function createTournament(userId, tournamentData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            var tournament = new Tournament();
            tournament.name = tournamentData.name;
            tournament.date = tournamentData.date;
            tournament.sport = tournamentData.sport;
            tournament.userId = userId;
            tournament.save(function (err, createdTournament) {
                if (!err) {
                    resolve(createdTournament);
                    callback(null, createdTournament);
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });
    }

    /**
     * Delete a tournament
     * @param   {String} userId   Curent user
     * @param   {String} id       Tournament Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteTournament(userId, id /*, callback*/) {
        var filter = {
            _id: id
        };
        if (userId) {
            filter.userId = userId;
        }
        var callback = server.helpers.getCallback(arguments);
        return Tournament.remove(filter, callback);
    }

    /**
     * Update a tournament
     * @param   {String} userId         Curent user
     * @param   {String} id             Tournament Identifier
     * @param   {Object} TournamentData Tournament {name, sport, date}
     * @param {function} callback       Callback function
     * @returns {Object} Promise
     */
    function updateTournament(userId, id, tournamentData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            readTournamentById(userId, id).then(
                function(tournament) {
                    if (tournamentData.name) {
                        tournament.name = tournamentData.name;
                    }
                    if (tournamentData.sport) {
                        tournament.sport = tournamentData.sport;
                    }
                    if (tournamentData.date) {
                        tournament.date = tournamentData.date;
                    }
                    tournament.save(callback).then(function (data) {
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
        readTournaments: readTournaments,
        readTournamentById: readTournamentById,
        createTournament: createTournament,
        deleteTournament: deleteTournament,
        updateTournament: updateTournament
    };
};
