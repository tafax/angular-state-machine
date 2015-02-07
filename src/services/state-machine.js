'use strict';

/**
 * Class to provide the functionality to manage the
 * state machine.
 *
 * @param {Object} $injector
 * @param {MachineStrategy} strategy
 * @param {MachineConfiguration} machineConfiguration
 * @constructor
 */
function StateMachine($injector, strategy, machineConfiguration) {
    /**
     * Initializes the machine and sets the current state
     * with the init state.
     */
    this.initialize = function() {
        strategy.initialize(machineConfiguration);
    };

    /**
     * Gets an array of the states.
     *
     * @returns {Array}
     */
    this.getStates = function() {
        return strategy.getStates(machineConfiguration);
    };

    /**
     * Gets an array of the messages.
     *
     * @returns {Array}
     */
    this.getMessages = function() {
        return strategy.getMessages(machineConfiguration);
    };

    /**
     * Checks if the specific message is one of the
     * messages of the machine.
     *
     * @param {String} message
     * @returns {boolean}
     */
    this.hasMessage = function(message) {
        return strategy.hasMessage(machineConfiguration, message);
    };

    /**
     * Checks if the specific message is available
     * for the current state.
     *
     * @param {String} message
     * @returns {boolean}
     */
    this.isAvailable = function(message) {
        return strategy.isAvailable(machineConfiguration, message);
    };

    /**
     * Gets an array of the messages available for
     * the current state.
     *
     * @returns {Array}
     */
    this.available = function() {
        return strategy.available(machineConfiguration);
    };

    /**
     * Sends a message to the state machine and changes
     * the current state according to the transitions.
     *
     * @param {String} message
     * @param {Object} [parameters]
     */
    this.send = function(message, parameters) {
        strategy.send($injector, machineConfiguration, message, parameters);
    };
}

/**
 * The state machine provider configures the machine
 * to use specification from JSON file and/or using
 * async/sync mode.
 */
FSM.provider('stateMachine', function StateMachineProvider() {
    /**
     * JSON file to load configuration.
     *
     * @type {String|null}
     * @private
     */
    var _json;

    /**
     * The state machine configuration.
     *
     * @type {Object}
     * @private
     */
    var _config;

    /**
     * Sets the configuration for the state
     * machine.
     *
     * @param {Object} config
     */
    this.config = function(config) {
        _config = config;
    };

    /**
     * Sets the JSON file to load the
     * configuration.
     *
     * @param {String} json
     */
    this.load = function(json) {
        _json = json;
    };

    /**
     * Gets a new instance of StateMachine specifying the
     * arguments passed to the provider.
     *
     * @type {Array}
     */
    this.$get = ['$injector', '$http', '$q', function($injector, $http, $q) {
        var strategy = (_json ? new AsyncStrategy(_json, $http, $q) : new SyncStrategy());
        return new StateMachine($injector, strategy, new MachineConfiguration(_config));
    }];
});