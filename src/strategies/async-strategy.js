'use strict';

/**
 * Class to provide the machine functionality
 * in asynchronous mode.
 *
 * @param {String} json
 * @param {Object} $http
 * @param {Object} $q
 * @constructor
 */
function AsyncStrategy(json, $http, $q) {
    SyncStrategy.call(this);
    this.json = json;
    this.http = $http;
    this.q = $q;
    this.promise = null;
}

/**
 * Initializes the prototype.
 *
 * @type {SyncStrategy}
 */
AsyncStrategy.prototype = new SyncStrategy();

/**
 * Initializes the machine and sets the current state
 * with the init state.
 *
 * @param {MachineConfiguration} machineConfiguration
 */
AsyncStrategy.prototype.initialize = function(machineConfiguration) {
    this.promise = this.http(
        {
            method: 'GET',
            url: this.json
        }
    ).then(
        function(response) {
            machineConfiguration.extend(response.data);
            SyncStrategy.prototype.initialize(machineConfiguration);
        },
        function(response) {
            throw 'Unable to load \'' + json + '\'. The server responds with status ' + response.status + '.';
        }
    );
};

/**
 * Gets an array of the states.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
AsyncStrategy.prototype.getStates = function(machineConfiguration) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.getStates(machineConfiguration));
        });

        return deferred.promise;
    } else {
        throw 'You have to initialize the machine.'
    }
};

/**
 * Gets an array of the messages.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
AsyncStrategy.prototype.getMessages = function(machineConfiguration) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.getMessages(machineConfiguration));
        });

        return deferred.promise;
    } else {
        throw 'You have to initialize the machine.'
    }
};

/**
 * Checks if the specific message is one of the
 * messages of the machine.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @returns {boolean}
 */
AsyncStrategy.prototype.hasMessage = function(machineConfiguration, message) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.hasMessage(machineConfiguration, message));
        });

        return deferred.promise;
    } else {
        throw 'You have to initialize the machine.'
    }
};

/**
 * Checks if the specific message is available
 * for the current state.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @returns {boolean}
 */
AsyncStrategy.prototype.isAvailable = function(machineConfiguration, message) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.isAvailable(machineConfiguration, message));
        });

        return deferred.promise;
    } else {
        throw 'You have to initialize the machine.'
    }
};

/**
 * Gets an array of the messages available for
 * the current state.
 *
 * @param {MachineConfiguration} machineConfiguration
 * @returns {Array}
 */
AsyncStrategy.prototype.available = function(machineConfiguration) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.available(machineConfiguration));
        });

        return deferred.promise;
    }
    else {
        throw 'You have to initialize the machine.'
    }
};

/**
 * Sends a message to the state machine and changes
 * the current state according to the transitions.
 *
 * @param {Object} $injector
 * @param {MachineConfiguration} machineConfiguration
 * @param {String} message
 * @param {Object} [parameters]
 */
AsyncStrategy.prototype.send = function($injector, machineConfiguration, message, parameters) {
    if(null !== this.promise) {
        var deferred = this.q.defer();

        this.promise.then(function() {
            deferred.resolve(SyncStrategy.prototype.send($injector, machineConfiguration, message, parameters));
        });

        return deferred.promise;
    }
    else {
        throw 'You have to initialize the machine.'
    }
};
